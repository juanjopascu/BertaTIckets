const fs = require('fs');
const path = require('path');

const NOTIFICATIONS_FILE = path.join(__dirname, '..', 'notifications.json');

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-erp-1',
    category: 'erp',
    title: 'Facturación Aprobada SO-2026-1055',
    message: 'Orden de venta por $18,500 USD aprobada y facturada para Networking Solutions SRL en DACAS Argentina S.A.',
    severity: 'success', // success, warning, danger, info
    read: false,
    targetView: 'erp',
    targetTab: 'order_to_cash',
    actionLabel: 'Ver en ERP',
    roles: ['admin', 'admin_erp', 'staff'],
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString() // hace 18 min
  },
  {
    id: 'notif-ecom-1',
    category: 'ecommerce',
    title: 'Nuevo Pedido E-Commerce #1055',
    message: 'Pedido por $756.50 USD registrado por Juan Pérez (Tech Solutions S.A.) mediante Transferencia Bancaria.',
    severity: 'info',
    read: false,
    targetView: 'ecommerce',
    targetTab: 'ordenes',
    actionLabel: 'Ver Pedido',
    roles: ['admin', 'admin_ecommerce'],
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() // hace 35 min
  },
  {
    id: 'notif-crm-1',
    category: 'crm',
    title: 'SLA Próximo a Vencer en Soporte',
    message: 'Ticket #2 (Innovate SA) en Soporte Técnico tiene un vencimiento de SLA estimado en menos de 45 minutos.',
    severity: 'warning',
    read: false,
    targetView: 'crm',
    ticketId: 2,
    actionLabel: 'Abrir Ticket',
    roles: ['admin', 'staff', 'vendedor', 'pm', 'manager'],
    timestamp: new Date(Date.now() - 1000 * 60 * 62).toISOString() // hace 1 hora
  },
  {
    id: 'notif-erp-2',
    category: 'erp',
    title: 'Alerta de Umbral de Inventario',
    message: 'Stock de FortiGate 60F en Hub Central Buenos Aires alcanzó el límite mínimo de reposición (2 unidades).',
    severity: 'warning',
    read: false,
    targetView: 'erp',
    targetTab: 'inventory',
    actionLabel: 'Gestionar Stock',
    roles: ['admin', 'admin_erp'],
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() // hace 2.5 hs
  },
  {
    id: 'notif-crm-2',
    category: 'crm',
    title: 'Oportunidad Ganada: Servicios CL',
    message: 'Se confirmó el cierre exitoso del caso comercial en Chile. Estado actualizado a Ganado.',
    severity: 'success',
    read: true,
    targetView: 'crm',
    ticketId: 3,
    actionLabel: 'Ver CRM',
    roles: ['admin', 'staff', 'vendedor', 'pm'],
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() // hace 6 hs
  },
  {
    id: 'notif-ecom-2',
    category: 'ecommerce',
    title: 'Cliente B2B Verificado',
    message: 'Connect Cloud Chile SpA completó la verificación impositiva y habilitó su cuenta con lista mayorista.',
    severity: 'info',
    read: true,
    targetView: 'ecommerce',
    targetTab: 'clientes',
    actionLabel: 'Ver Cliente',
    roles: ['admin', 'admin_ecommerce'],
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString() // hace 12 hs
  }
];

class NotificationService {
  constructor() {
    this.notifications = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(NOTIFICATIONS_FILE)) {
        const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
        this.notifications = JSON.parse(raw);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.save();
      }
    } catch (err) {
      console.error('Error cargando notifications.json:', err);
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  save() {
    try {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(this.notifications, null, 2), 'utf8');
    } catch (err) {
      console.error('Error guardando notifications.json:', err);
    }
  }

  getNotifications(role = 'admin') {
    if (role === 'admin') {
      return this.notifications;
    }
    return this.notifications.filter(n => !n.roles || n.roles.includes(role));
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return notif;
    }
    return null;
  }

  markAllAsRead(role = 'admin') {
    let count = 0;
    this.notifications.forEach(n => {
      if (role === 'admin' || !n.roles || n.roles.includes(role)) {
        if (!n.read) {
          n.read = true;
          count++;
        }
      }
    });
    this.save();
    return { count };
  }

  addNotification(data) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: data.category || 'crm', // erp, crm, ecommerce
      title: data.title || 'Nueva Notificación',
      message: data.message || '',
      severity: data.severity || 'info',
      read: false,
      targetView: data.targetView || null,
      targetTab: data.targetTab || null,
      ticketId: data.ticketId || null,
      orderId: data.orderId || null,
      actionLabel: data.actionLabel || 'Ver Detalles',
      roles: data.roles || ['admin', 'staff'],
      timestamp: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    this.save();
    return newNotif;
  }

  deleteNotification(id) {
    const initialLen = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (this.notifications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

module.exports = new NotificationService();
