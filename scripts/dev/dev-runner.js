/**
 * Berhot Dev Runner - Lightweight Express servers for all NestJS services
 * Run with: node dev-runner.js
 */
const http = require('http');

function createService(name, port, routes) {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Tenant-ID');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const url = req.url.split('?')[0];

    if (url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', service: name }));
      return;
    }
    if (url === '/ready') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ready' }));
      return;
    }

    for (const [pattern, handler] of Object.entries(routes)) {
      const [method, path] = pattern.split(' ');
      if (req.method === method && matchPath(url, path)) {
        const params = extractParams(url, path);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            const result = handler(params, parsed, req);
            res.writeHead(result.status || 200);
            res.end(JSON.stringify(result.body || result));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found', service: name, path: url }));
  });

  server.listen(port, () => console.log(`  ${name} → http://localhost:${port}`));
}

function matchPath(url, pattern) {
  const urlParts = url.split('/');
  const patParts = pattern.split('/');
  if (urlParts.length !== patParts.length) return false;
  return patParts.every((p, i) => p.startsWith(':') || p === urlParts[i]);
}

function extractParams(url, pattern) {
  const urlParts = url.split('/');
  const patParts = pattern.split('/');
  const params = {};
  patParts.forEach((p, i) => { if (p.startsWith(':')) params[p.slice(1)] = urlParts[i]; });
  return params;
}

console.log('\n  Berhot Platform - Starting NestJS services...\n');

// Restaurant POS (8082)
createService('restaurant-pos', 8082, {
  'GET /api/v1/restaurant/menu': () => ({ menu: [], total: 0 }),
  'POST /api/v1/restaurant/menu': (p, b) => ({ status: 201, body: { id: 'new-item', ...b } }),
  'GET /api/v1/restaurant/tables': () => ({ tables: [
    { id: '1', number: 1, seats: 4, status: 'available' },
    { id: '2', number: 2, seats: 2, status: 'available' },
    { id: '3', number: 3, seats: 6, status: 'occupied' },
    { id: '4', number: 4, seats: 4, status: 'available' },
  ], total: 4 }),
  'PUT /api/v1/restaurant/tables/:id': (p, b) => ({ id: p.id, ...b }),
  'GET /api/v1/restaurant/kitchen/orders': () => ({ orders: [], total: 0 }),
  'PUT /api/v1/restaurant/kitchen/orders/:id': (p, b) => ({ id: p.id, status: b.status || 'preparing' }),
  'GET /api/v1/restaurant/reservations': () => ({ reservations: [], total: 0 }),
  'POST /api/v1/restaurant/reservations': (p, b) => ({ status: 201, body: { id: 'new-res', status: 'confirmed', ...b } }),
});

// Cafe POS (8083)
createService('cafe-pos', 8083, {
  'GET /api/v1/cafe/menu': () => ({ menu: [], total: 0 }),
  'POST /api/v1/cafe/orders': (p, b) => ({ status: 201, body: { id: 'new-order', type: 'takeout', ...b } }),
  'GET /api/v1/cafe/queue': () => ({ queue: [], estimatedWait: '5 min' }),
});

// Retail POS (8084)
createService('retail-pos', 8084, {
  'GET /api/v1/retail/products': () => ({ products: [], total: 0 }),
  'POST /api/v1/retail/transactions': (p, b) => ({ status: 201, body: { id: 'new-txn', type: 'sale', ...b } }),
  'GET /api/v1/retail/inventory': () => ({ inventory: [], total: 0 }),
  'POST /api/v1/retail/returns': (p, b) => ({ status: 201, body: { id: 'new-return', ...b } }),
});

// Appointment POS (8085)
createService('appointment-pos', 8085, {
  'GET /api/v1/appointments': () => ({ appointments: [], total: 0 }),
  'POST /api/v1/appointments': (p, b) => ({ status: 201, body: { id: 'new-apt', status: 'scheduled', ...b } }),
  'GET /api/v1/appointments/slots': () => ({ slots: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00'], date: new Date().toISOString().split('T')[0] }),
  'GET /api/v1/appointments/staff': () => ({ staff: [], total: 0 }),
  'GET /api/v1/appointments/services': () => ({ services: [], total: 0 }),
});

// Notification Center (8086)
createService('notification-center', 8086, {
  'POST /api/v1/notifications/send': (p, b) => ({ status: 201, body: { id: 'new-notif', channel: b.channel || 'email', status: 'queued' } }),
  'GET /api/v1/notifications': () => ({ notifications: [], total: 0 }),
  'GET /api/v1/notifications/templates': () => ({ templates: ['welcome','order-confirmation','password-reset','payment-receipt'] }),
  'PUT /api/v1/notifications/:id/read': (p) => ({ id: p.id, read: true }),
});

// Shift Management (8087)
createService('shift-management', 8087, {
  'GET /api/v1/shifts': () => ({ shifts: [], total: 0 }),
  'POST /api/v1/shifts': (p, b) => ({ status: 201, body: { id: 'new-shift', status: 'scheduled', ...b } }),
  'GET /api/v1/shifts/schedule': () => ({ schedule: [], week: 'current' }),
  'POST /api/v1/shifts/:id/swap': (p, b) => ({ id: p.id, status: 'swap-requested', ...b }),
});

// Event Management (8088)
createService('event-management', 8088, {
  'GET /api/v1/events': () => ({ events: [], total: 0 }),
  'POST /api/v1/events': (p, b) => ({ status: 201, body: { id: 'new-event', status: 'draft', ...b } }),
  'GET /api/v1/events/:id': (p) => ({ id: p.id, status: 'draft' }),
  'GET /api/v1/events/:id/tickets': (p) => ({ eventId: p.id, tickets: [], total: 0 }),
  'POST /api/v1/events/:id/publish': (p) => ({ id: p.id, status: 'published' }),
});

// Memberships (8089)
createService('memberships', 8089, {
  'GET /api/v1/memberships/plans': () => ({ plans: [], total: 0 }),
  'POST /api/v1/memberships/plans': (p, b) => ({ status: 201, body: { id: 'new-plan', ...b } }),
  'GET /api/v1/memberships/members': () => ({ members: [], total: 0 }),
  'POST /api/v1/memberships/subscribe': (p, b) => ({ status: 201, body: { id: 'new-sub', status: 'active', ...b } }),
});

console.log('\n  All NestJS services started!\n');
