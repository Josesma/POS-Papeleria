import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Product, Sale } from '../types';

/**
 * Export Inventory to Excel
 */
export async function exportInventoryExcel(products: Product[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'POS Papelería';
  wb.created = new Date();

  const ws = wb.addWorksheet('Inventario', {
    properties: { tabColor: { argb: '6366F1' } }
  });

  // Header styling
  ws.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Producto', key: 'name', width: 30 },
    { header: 'Categoría', key: 'category', width: 15 },
    { header: 'Código', key: 'barcode', width: 18 },
    { header: 'Precio', key: 'price', width: 12 },
    { header: 'Costo', key: 'cost', width: 12 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Mín.', key: 'minStock', width: 8 },
    { header: 'Valor', key: 'value', width: 15 },
    { header: 'Estado', key: 'status', width: 12 },
  ];

  // Style header row
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6366F1' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 28;

  // Add data rows
  products.forEach((p) => {
    const isLow = p.stock <= (p.minStock || 5);
    const isOut = p.stock <= 0;
    
    const row = ws.addRow({
      id: p.id,
      name: p.name,
      category: p.category,
      barcode: p.barcode || '—',
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock || 5,
      value: p.price * p.stock,
      status: isOut ? '🔴 Agotado' : isLow ? '🟡 Bajo' : '🟢 Normal',
    });

    // Highlight low/out of stock
    if (isOut) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
    } else if (isLow) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
    }
  });

  // Format currency columns
  ['price', 'cost', 'value'].forEach(key => {
    ws.getColumn(key).numFmt = '$#,##0.00';
  });

  // Summary row
  ws.addRow({});
  const totalRow = ws.addRow({
    name: 'TOTAL INVENTARIO',
    stock: products.reduce((s, p) => s + p.stock, 0),
    value: products.reduce((s, p) => s + p.price * p.stock, 0),
  });
  totalRow.font = { bold: true, size: 12 };

  // Auto-filter
  ws.autoFilter = { from: 'A1', to: 'J1' };

  // Generate and save
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `Inventario_${date}.xlsx`);
}

/**
 * Export Sales to Excel
 */
export async function exportSalesExcel(sales: Sale[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'POS Papelería';
  wb.created = new Date();

  const ws = wb.addWorksheet('Ventas', {
    properties: { tabColor: { argb: '10B981' } }
  });

  ws.columns = [
    { header: 'Folio', key: 'folio', width: 15 },
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Productos', key: 'items', width: 40 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Descuento', key: 'discount', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Método', key: 'method', width: 12 },
    { header: 'Recibido', key: 'received', width: 12 },
    { header: 'Cambio', key: 'change', width: 12 },
  ];

  // Style header
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 28;

  sales.forEach((sale) => {
    const itemNames = sale.items?.map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`).join(', ') || '';
    ws.addRow({
      folio: sale.folio?.slice(0, 8).toUpperCase() || '',
      date: new Date(sale.createdAt).toLocaleString('es-MX'),
      items: itemNames,
      subtotal: sale.subtotal,
      discount: sale.discount || 0,
      total: sale.total,
      method: sale.paymentMethod,
      received: sale.amountReceived || sale.total,
      change: sale.changeProduced || 0,
    });
  });

  // Format currency
  ['subtotal', 'discount', 'total', 'received', 'change'].forEach(key => {
    ws.getColumn(key).numFmt = '$#,##0.00';
  });

  // Summary
  ws.addRow({});
  const totalRow = ws.addRow({
    items: 'TOTAL VENTAS',
    total: sales.reduce((s, sale) => s + sale.total, 0),
    discount: sales.reduce((s, sale) => s + (sale.discount || 0), 0),
  });
  totalRow.font = { bold: true, size: 12 };

  ws.autoFilter = { from: 'A1', to: 'I1' };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `Ventas_${date}.xlsx`);
}

/**
 * Export Inventory to PDF
 */
export function exportInventoryPDF(products: Product[]) {
  const doc = new jsPDF() as any;
  const date = new Date().toLocaleString('es-MX');

  doc.setFontSize(20);
  doc.text('REPORTE DE INVENTARIO', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generado: ${date}`, 105, 28, { align: 'center' });
  doc.line(15, 33, 195, 33);

  const tableData = products.map(p => [
    p.name,
    p.category,
    `$${p.price.toFixed(2)}`,
    p.stock.toString(),
    `$${(p.price * p.stock).toFixed(2)}`,
    p.stock <= 0 ? 'Agotado' : p.stock <= (p.minStock || 5) ? 'Bajo' : 'OK',
  ]);

  doc.autoTable({
    startY: 40,
    head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Valor', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  doc.setFontSize(12);
  doc.text(`Total Productos: ${products.length}`, 15, finalY);
  doc.text(`Valor Total: $${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 15, finalY + 7);

  const safeName = date.replace(/[/:\s,]/g, '_');
  doc.save(`Inventario_${safeName}.pdf`);
}
