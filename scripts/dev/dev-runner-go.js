/**
 * Berhot Dev Runner - Lightweight servers for remaining Go services
 * Run with: node dev-runner-go.js
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
    if (url === '/health') { res.writeHead(200); res.end(JSON.stringify({ status: 'healthy', service: name })); return; }
    if (url === '/ready') { res.writeHead(200); res.end(JSON.stringify({ status: 'ready' })); return; }
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
          } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
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
  const u = url.split('/'), p = pattern.split('/');
  if (u.length !== p.length) return false;
  return p.every((s, i) => s.startsWith(':') || s === u[i]);
}
function extractParams(url, pattern) {
  const u = url.split('/'), p = pattern.split('/'), params = {};
  p.forEach((s, i) => { if (s.startsWith(':')) params[s.slice(1)] = u[i]; });
  return params;
}

console.log('\n  Berhot Platform - Starting Go-equivalent services...\n');

// Tenant Management (8100)
createService('tenant-management', 8100, {
  'GET /api/v1/tenants': () => ({ tenants: [], total: 0 }),
  'POST /api/v1/tenants': (p, b) => ({ status: 201, body: { id: 'new-tenant', status: 'active', ...b } }),
  'GET /api/v1/tenants/:id': (p) => ({ id: p.id, status: 'active' }),
  'PUT /api/v1/tenants/:id': (p, b) => ({ id: p.id, ...b }),
  'GET /api/v1/tenants/:id/products': (p) => ({ tenantId: p.id, products: [] }),
  'POST /api/v1/tenants/:id/products': (p, b) => ({ status: 201, body: { tenantId: p.id, productId: b.productId, status: 'active' } }),
  'POST /api/v1/tenants/:id/onboard': (p) => ({ tenantId: p.id, status: 'onboarded' }),
});

// Loyalty Program (8101)
createService('loyalty', 8101, {
  'GET /api/v1/loyalty/programs': () => ({ programs: [], total: 0 }),
  'POST /api/v1/loyalty/programs': (p, b) => ({ status: 201, body: { id: 'new-prog', status: 'active', ...b } }),
  'GET /api/v1/loyalty/members': () => ({ members: [], total: 0 }),
  'POST /api/v1/loyalty/members': (p, b) => ({ status: 201, body: { id: 'new-member', points: 0, ...b } }),
  'GET /api/v1/loyalty/members/:id/balance': (p) => ({ memberId: p.id, points: 150, tier: 'silver' }),
  'POST /api/v1/loyalty/points/earn': (p, b) => ({ status: 201, body: { memberId: b.memberId, pointsEarned: b.points || 10, newBalance: 160 } }),
  'POST /api/v1/loyalty/points/redeem': (p, b) => ({ memberId: b.memberId, pointsRedeemed: b.points || 50, newBalance: 100 }),
  'GET /api/v1/loyalty/rewards': () => ({ rewards: [
    { id: 'r1', name: 'Free Coffee', pointsCost: 50 },
    { id: 'r2', name: '10% Discount', pointsCost: 100 },
    { id: 'r3', name: 'Free Dessert', pointsCost: 75 },
  ]}),
  'GET /api/v1/public/loyalty/check/:phone': (p) => ({ phone: p.phone, member: true, points: 150, tier: 'silver' }),
});

// Queue & Waitlist (8102)
createService('queue-waitlist', 8102, {
  'GET /api/v1/queue': () => ({ queues: [{ id: 'q1', name: 'Main Queue', currentSize: 3, estimatedWait: '15 min' }], total: 1 }),
  'POST /api/v1/queue/entries': (p, b) => ({ status: 201, body: { id: 'e1', position: 4, estimatedWait: '20 min', ...b } }),
  'GET /api/v1/queue/entries/:id': (p) => ({ id: p.id, position: 2, status: 'waiting', estimatedWait: '10 min' }),
  'POST /api/v1/queue/entries/:id/call': (p) => ({ id: p.id, status: 'called' }),
  'POST /api/v1/queue/entries/:id/complete': (p) => ({ id: p.id, status: 'completed' }),
  'POST /api/v1/queue/entries/:id/cancel': (p) => ({ id: p.id, status: 'cancelled' }),
  'GET /api/v1/public/queue/status': () => ({ queueSize: 3, estimatedWait: '15 min', nextPosition: 4 }),
});

// Time & Attendance (8103)
createService('time-attendance', 8103, {
  'POST /api/v1/attendance/clock-in': (p, b) => ({ status: 201, body: { id: 'a1', employeeId: b.employeeId, clockIn: new Date().toISOString(), status: 'clocked-in' } }),
  'POST /api/v1/attendance/clock-out': (p, b) => ({ employeeId: b.employeeId, clockOut: new Date().toISOString(), status: 'clocked-out', hoursWorked: 8.5 }),
  'GET /api/v1/attendance/records': () => ({ records: [], total: 0 }),
  'GET /api/v1/attendance/reports': () => ({ totalHours: 0, totalEmployees: 0, averageHours: 0 }),
  'POST /api/v1/attendance/fingerprint/register': (p, b) => ({ status: 201, body: { employeeId: b.employeeId, enrolled: true } }),
});

// Hardware Management (8104)
createService('hardware', 8104, {
  'GET /api/v1/hardware/devices': () => ({ devices: [
    { id: 'd1', type: 'receipt-printer', model: 'Epson TM-T88VI', status: 'connected' },
    { id: 'd2', type: 'cash-drawer', model: 'APG Series 4000', status: 'connected' },
    { id: 'd3', type: 'barcode-scanner', model: 'Honeywell 1900', status: 'connected' },
  ], total: 3 }),
  'POST /api/v1/hardware/devices': (p, b) => ({ status: 201, body: { id: 'new-dev', status: 'pairing', ...b } }),
  'POST /api/v1/hardware/print': (p, b) => ({ status: 'printed', deviceId: b.deviceId || 'd1' }),
  'POST /api/v1/hardware/drawer/open': () => ({ status: 'opened', deviceId: 'd2' }),
});

// Audit Trail (8105)
createService('audit-trail', 8105, {
  'GET /api/v1/audit/logs': () => ({ logs: [], total: 0 }),
  'GET /api/v1/audit/logs/:id': (p) => ({ id: p.id, action: 'unknown' }),
});

// Search Engine (8106)
createService('search-engine', 8106, {
  'GET /api/v1/search': () => ({ results: [], total: 0, query: '' }),
  'POST /api/v1/search/index': () => ({ status: 'indexed' }),
});

// Webhook Service (8107)
createService('webhook-service', 8107, {
  'GET /api/v1/webhooks': () => ({ webhooks: [], total: 0 }),
  'POST /api/v1/webhooks': (p, b) => ({ status: 201, body: { id: 'new-wh', status: 'active', ...b } }),
  'DELETE /api/v1/webhooks/:id': (p) => ({ id: p.id, deleted: true }),
});

// Marketplace (8108)
createService('marketplace', 8108, {
  'GET /api/v1/marketplace/apps': () => ({ apps: [
    { id: 'a1', name: 'Uber Eats Integration', category: 'delivery', status: 'available' },
    { id: 'a2', name: 'HungerStation', category: 'delivery', status: 'available' },
    { id: 'a3', name: 'Accounting Sync', category: 'finance', status: 'available' },
  ], total: 3 }),
  'POST /api/v1/marketplace/apps/:id/install': (p) => ({ appId: p.id, status: 'installed' }),
});

// Integrations (8109)
createService('integrations', 8109, {
  'GET /api/v1/integrations': () => ({ integrations: [], total: 0 }),
  'POST /api/v1/integrations': (p, b) => ({ status: 201, body: { id: 'new-int', status: 'connected', ...b } }),
  'GET /api/v1/integrations/:id/status': (p) => ({ id: p.id, status: 'connected', lastSync: new Date().toISOString() }),
});

console.log('\n  All Go-equivalent services started!\n');
