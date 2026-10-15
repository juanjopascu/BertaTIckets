# DACAS Enterprise — CRM & Mesa de Ayuda de Tickets

Plataforma corporativa de CRM y Helpdesk para DACAS (distribuidor mayorista de tecnología, ciberseguridad y conectividad enterprise).
Este proyecto es un **servicio independiente** diseñado para desplegarse en su propio servidor/host.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React 19 (SPA), Vite 8, React Router DOM 7, Lucide Icons.
- **Backend:** Node.js 20+, Express 5, Multer, Bcrypt, JsonWebToken.
- **Persistencia:** Base de datos relacional PostgreSQL / motor de almacenamiento JSON (`system_logs.json`).

---

## 🚀 Inicio en Desarrollo

```bash
# Instalar dependencias
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Iniciar ambos servicios (Backend en :3001, Frontend en :5173)
npm run dev
```

O individualmente:
```bash
npm run dev:backend   # Inicia backend en http://localhost:3001
npm run dev:frontend  # Inicia frontend en http://localhost:5173
```

---

## ⚙️ Variables de Entorno (`backend/.env`)

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_jwt_larga_y_aleatoria

# Conexión Inter-Servicios con el Servidor de E-Commerce (Server 1)
ECOMMERCE_API_URL=https://store.dacas.com
INTERNAL_SERVICE_KEY=clave_secreta_compartida_de_64_caracteres
```

---

## 🔗 Endpoints de Integración Inter-Servicio (REST API)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/internal/orders/created` | Recibe notificación de venta desde E-Commerce y abre ticket de Operaciones |
| `POST` | `/api/internal/tickets/create` | Abre ticket de postventa/RMA desde orden de compra |
| `GET` | `/api/internal/tickets/by-customer` | Retorna tickets abiertos y cerrados de un cliente por email |

> **Seguridad:** Todas las peticiones internas requieren la cabecera `x-service-key: <INTERNAL_SERVICE_KEY>`.
