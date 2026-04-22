# 🏪 POS Papelería - Guía de Instalación

## Requisitos Previos
- **Node.js** v18 o superior
- **npm** v9 o superior

## Instalación Rápida

### 1. Backend (API)

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

El servidor iniciará en **http://localhost:3001**

### 2. Frontend (Interfaz)

En una **nueva terminal**:

```bash
cd frontend
npm install
npm run dev
```

La aplicación iniciará en **http://localhost:5173**

## Estructura del Proyecto

```
Papeleria/
├── backend/          # API REST (Express + Prisma + SQLite)
│   ├── prisma/       # Schema y seed de base de datos
│   ├── src/
│   │   ├── controllers/  # Handlers de rutas
│   │   ├── services/     # Lógica de negocio
│   │   ├── routes/       # Definición de endpoints
│   │   ├── validators/   # Schemas Zod
│   │   ├── middlewares/  # Error handler
│   │   ├── lib/          # Prisma singleton
│   │   └── types/        # TypeScript interfaces
│   └── server.ts
│
└── frontend/         # Interfaz PWA (React + Vite + Tailwind)
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── pages/        # Páginas (POS, Inventario, Ventas)
    │   ├── hooks/        # Custom hooks
    │   ├── store/        # Zustand state management
    │   ├── services/     # API client
    │   └── types/        # TypeScript interfaces
    └── public/           # Assets estáticos + PWA icons
```

## Funcionalidades

| Módulo | Funcionalidad |
|--------|--------------|
| **POS** | Búsqueda en tiempo real, carrito con IVA 16%, cobro |
| **Inventario** | CRUD de productos, edición de stock inline |
| **Ventas** | Historial con detalle, estadísticas, paginación |

## API Endpoints

```
GET    /api/products           # Listar productos
GET    /api/products/:id       # Detalle de producto
GET    /api/products/categories # Categorías
POST   /api/products           # Crear producto
PUT    /api/products/:id       # Actualizar producto
PATCH  /api/products/:id/stock # Actualizar stock

GET    /api/sales              # Listar ventas
GET    /api/sales/:id          # Detalle de venta
POST   /api/sales              # Registrar venta
```

## Evaluación de Riesgos Técnicos

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Concurrencia en stock | ⚠️ Medio | Transacciones atómicas con Prisma |
| Pérdida de datos SQLite | 🔴 Crítico | Backups periódicos del archivo .db |
| Escalabilidad SQLite | 🟡 Bajo | Migrar a PostgreSQL si >5 terminales |
| Precisión monetaria | ⚠️ Medio | Redondeo a 2 decimales en backend |
| Sin autenticación (MVP) | ⚠️ Medio | Implementar JWT post-MVP |
| Modo offline limitado | 🟡 Bajo | PWA cachea UI; cola offline post-MVP |

## Build para Producción

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```
