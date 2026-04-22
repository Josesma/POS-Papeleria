import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@papeleria.com',
    name: 'Administrador',
    password: 'admin123', // Will be hashed below
    role: 'ADMIN',
  },
  {
    email: 'cajero@papeleria.com',
    name: 'Cajero de Turno',
    password: 'cajero123', // Will be hashed below
    role: 'CASHIER',
  },
];

const customers = [
  { name: 'Público General', phone: '0000000000', email: 'general@sale.com' },
  { name: 'Juan Pérez', phone: '5551234567', email: 'juan.perez@email.com' },
  { name: 'María García', phone: '5559876543', email: 'maria.garcia@email.com' },
];

const products = [
  // Escritura
  { name: 'Lápiz HB No.2', description: 'Lápiz de grafito estándar', barcode: '7501001001', price: 5.00, cost: 2.50, stock: 200, category: 'Escritura' },
  { name: 'Bolígrafo Azul', description: 'Bolígrafo punto mediano azul', barcode: '7501001002', price: 8.00, cost: 3.50, stock: 150, category: 'Escritura' },
  { name: 'Bolígrafo Negro', description: 'Bolígrafo punto mediano negro', barcode: '7501001003', price: 8.00, cost: 3.50, stock: 150, category: 'Escritura' },
  { name: 'Bolígrafo Rojo', description: 'Bolígrafo punto mediano rojo', barcode: '7501001004', price: 8.00, cost: 3.50, stock: 100, category: 'Escritura' },
  { name: 'Marcador Fluorescente Amarillo', description: 'Resaltador punta cincel', barcode: '7501001005', price: 15.00, cost: 7.00, stock: 80, category: 'Escritura' },
  { name: 'Plumón Permanente Negro', description: 'Marcador permanente punta fina', barcode: '7501001006', price: 18.00, cost: 8.50, stock: 60, category: 'Escritura' },

  // Cuadernos
  { name: 'Cuaderno Profesional 100 hojas', description: 'Cuaderno rayado pasta dura', barcode: '7501002001', price: 45.00, cost: 22.00, stock: 80, category: 'Cuadernos' },
  { name: 'Cuaderno Profesional 200 hojas', description: 'Cuaderno rayado pasta dura', barcode: '7501002002', price: 75.00, cost: 38.00, stock: 50, category: 'Cuadernos' },
  { name: 'Libreta Pequeña 80 hojas', description: 'Libreta de bolsillo rayada', barcode: '7501002003', price: 20.00, cost: 9.00, stock: 100, category: 'Cuadernos' },
  { name: 'Cuaderno Cuadrícula 100 hojas', description: 'Cuaderno cuadrícula chica', barcode: '7501002004', price: 48.00, cost: 24.00, stock: 70, category: 'Cuadernos' },

  // Papel
  { name: 'Hojas Blancas Carta (500 pzas)', description: 'Resma de papel bond blanco', barcode: '7501003001', price: 120.00, cost: 65.00, stock: 40, category: 'Papel' },
  { name: 'Hojas de Colores Carta (100 pzas)', description: 'Paquete multicolor', barcode: '7501003002', price: 85.00, cost: 42.00, stock: 30, category: 'Papel' },
  { name: 'Cartulina Blanca', description: 'Cartulina tamaño carta', barcode: '7501003003', price: 8.00, cost: 3.50, stock: 100, category: 'Papel' },

  // Organización
  { name: 'Carpeta 3 Argollas', description: 'Carpeta pasta dura tamaño carta', barcode: '7501004001', price: 55.00, cost: 28.00, stock: 40, category: 'Organización' },
  { name: 'Folder Manila Carta (25 pzas)', description: 'Paquete de folders', barcode: '7501004002', price: 65.00, cost: 32.00, stock: 35, category: 'Organización' },
  { name: 'Sobre Manila Carta', description: 'Sobre para documentos', barcode: '7501004003', price: 5.00, cost: 2.00, stock: 200, category: 'Organización' },

  // Herramientas
  { name: 'Tijeras Escolares', description: 'Tijeras punta roma 13cm', barcode: '7501005001', price: 25.00, cost: 12.00, stock: 50, category: 'Herramientas' },
  { name: 'Pegamento en Barra 40g', description: 'Adhesivo en barra', barcode: '7501005002', price: 22.00, cost: 10.00, stock: 60, category: 'Herramientas' },
  { name: 'Cinta Adhesiva Transparente', description: 'Cinta scotch 18mm x 33m', barcode: '7501005003', price: 18.00, cost: 8.00, stock: 80, category: 'Herramientas' },
  { name: 'Goma de Borrar Blanca', description: 'Borrador suave para lápiz', barcode: '7501005004', price: 6.00, cost: 2.50, stock: 120, category: 'Herramientas' },
  { name: 'Sacapuntas Metálico', description: 'Sacapuntas individual de metal', barcode: '7501005005', price: 10.00, cost: 4.00, stock: 90, category: 'Herramientas' },
  { name: 'Regla 30cm Plástico', description: 'Regla transparente graduada', barcode: '7501005006', price: 12.00, cost: 5.00, stock: 70, category: 'Herramientas' },
  { name: 'Corrector Líquido', description: 'Corrector tipo pluma', barcode: '7501005007', price: 20.00, cost: 9.00, stock: 55, category: 'Herramientas' },

  // Arte
  { name: 'Colores de Madera (12 pzas)', description: 'Lápices de colores largos', barcode: '7501006001', price: 45.00, cost: 22.00, stock: 40, category: 'Arte' },
  { name: 'Crayones de Cera (24 pzas)', description: 'Crayolas estándar', barcode: '7501006002', price: 35.00, cost: 16.00, stock: 35, category: 'Arte' },
  { name: 'Acuarelas (12 colores)', description: 'Set de acuarelas con pincel', barcode: '7501006003', price: 40.00, cost: 19.00, stock: 30, category: 'Arte' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  // Seed Customers
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone || '' },
      update: {},
      create: customer,
    });
  }

  // Seed Products
  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    });
  }

  console.log(`✅ ${users.length} usuarios, ${customers.length} clientes y ${products.length} productos procesados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
