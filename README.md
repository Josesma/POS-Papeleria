# 🏪 POS Papelería - Sistema de Gestión de Ventas e Inventario

![POS Papelería Banner](./banner.png)

¡Bienvenido al sistema **POS Papelería**! Una solución moderna, rápida y eficiente para gestionar tu negocio. Este sistema proporciona un Punto de Venta (POS) intuitivo, gestión de inventario en tiempo real y un historial detallado de ventas, todo con una interfaz de usuario premium y oscura (Dark Theme).

---

## ✨ Características Principales

- **🛒 POS Inteligente**: Búsqueda en tiempo real, carrito con cálculo de IVA (16%) y procesamiento rápido de cobros.
- **📦 Gestión de Inventario**: CRUD completo de productos y edición rápida de stock para mantener tu negocio al día.
- **📈 Historial de Ventas**: Registro detallado de ventas, estadísticas y paginación para un análisis financiero fácil.
- **🎨 Diseño Premium**: Interfaz moderna, minimalista y responsiva enfocada en la mejor experiencia de usuario.

---

## 🚀 Tecnologías Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/) con Express
- **Base de Datos**: [SQLite](https://www.sqlite.org/) con [Prisma ORM](https://www.prisma.io/)

---

## 🛠️ Guía de Instalación Rápida

Para empezar a usar el sistema, sigue estos pasos:

### 1. Requisitos
- Node.js (v18 o superior)
- npm (v9 o superior)

### 2. Instalación Backend (API)
Abre una terminal en la carpeta `backend`:
```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```
El servidor iniciará en **http://localhost:3001**

### 3. Instalación Frontend (Interfaz)
Abre una nueva terminal en la carpeta `frontend`:
```bash
npm install
npm run dev
```
La aplicación iniciará en **http://localhost:5173**

> [!TIP]
> Si estás en Windows, puedes simplemente hacer doble clic en el archivo `Iniciar_Proyecto.bat` desde la raíz para arrancar tanto el frontend como el backend automáticamente.

Para instrucciones más detalladas, consulta la [Guía de Instalación Completa](./GUIA_INSTALACION.md).

---

## ⚠️ Aviso de Responsabilidad (Disclaimer)

> [!CAUTION]
> **Este proyecto se proporciona "tal cual", sin garantía de ningún tipo.** 
> Al descargar, instalar y utilizar este código, asumes toda la responsabilidad de su funcionamiento, seguridad y adecuación a la normativa vigente (incluyendo leyes fiscales y de privacidad) aplicable a tu negocio o país. El autor (**JoseSoy**) no se hace responsable por cualquier pérdida de datos, errores en transacciones, o problemas legales derivados del uso de este software en un entorno de producción real. Se recomienda realizar pruebas exhaustivas y copias de seguridad periódicas de la base de datos (`.db`).

---

## 🤝 Contribuciones

Si deseas mejorar este sistema, ¡eres bienvenido! Siéntete libre de abrir un *Issue* o enviar un *Pull Request*.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📱 Contacto y Redes Sociales

Si quieres ver más contenido sobre este sistema o tienes dudas, puedes seguirme en mis redes sociales:

[![TikTok Badge](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@josesoy__)
[![YouTube Badge](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@Josesoy1)
[![Instagram Badge](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/josesoy__/)
[![Facebook Badge](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/JoseSoyy/)

---
*Desarrollado con ❤️ por **JoseSoy** para negocios exitosos.*
