// Simple account system server
// Usage: node index.js
// Endpoints:
// POST /register { username, password }
// POST /login { username, password } -> sets cookie 'session'
// POST /logout -> clears session
// GET  /me -> returns current user
// GET  /admin -> only accessible to user 'admin'

const http = require('http');
const crypto = require('crypto');
const url = require('url');

// In-memory user store (username -> { password })
const users = {
  // default admin account as requested
  admin: { password: 'ck0' }
};

// In-memory session store (token -> username)
const sessions = new Map();

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!body) return resolve(null);
      try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function getSessionTokenFromReq(req) {
  // check cookie header
  const cookies = (req.headers.cookie || '').split(';').map(s => s.trim());
  for (const c of cookies) {
    const [k, v] = c.split('=');
    if (k === 'session') return v;
  }
  // check Authorization: Bearer <token>
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  try {
    if (req.method === 'POST' && path === '/register') {
      const body = await parseJSONBody(req);
      if (!body || !body.username || !body.password) {
        return sendJSON(res, 400, { error: 'username and password required' });
      }
      const { username, password } = body;
      if (users[username]) return sendJSON(res, 409, { error: 'user already exists' });
      users[username] = { password };
      return sendJSON(res, 201, { ok: true, username });
    }

    if (req.method === 'POST' && path === '/login') {
      const body = await parseJSONBody(req);
      if (!body || !body.username || !body.password) {
        return sendJSON(res, 400, { error: 'username and password required' });
      }
      const { username, password } = body;
      const user = users[username];
      if (!user || user.password !== password) {
        return sendJSON(res, 401, { error: 'invalid credentials' });
      }
      const token = generateToken();
      sessions.set(token, username);
      // set cookie (HttpOnly recommended, but simple here)
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly`);
      return sendJSON(res, 200, { ok: true, username });
    }

    if (req.method === 'POST' && path === '/logout') {
      const token = getSessionTokenFromReq(req);
      if (token) sessions.delete(token);
      // clear cookie
      res.setHeader('Set-Cookie', `session=; Max-Age=0; HttpOnly`);
      return sendJSON(res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/me') {
      const token = getSessionTokenFromReq(req);
      if (!token || !sessions.has(token)) return sendJSON(res, 200, { user: null });
      const username = sessions.get(token);
      return sendJSON(res, 200, { user: { username } });
    }

    if (req.method === 'GET' && path === '/admin') {
      const token = getSessionTokenFromReq(req);
      if (!token || !sessions.has(token)) return sendJSON(res, 401, { error: 'not authenticated' });
      const username = sessions.get(token);
      if (username !== 'admin') return sendJSON(res, 403, { error: 'forbidden: admin only' });
      return sendJSON(res, 200, { ok: true, message: 'welcome admin' });
    }

    // basic root page
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('Account system running. Endpoints: /register, /login, /logout, /me, /admin');
    }

    sendJSON(res, 404, { error: 'not found' });
  } catch (err) {
    console.error('request handler error', err);
    sendJSON(res, 500, { error: 'internal server error' });
  }
}

const port = process.env.PORT || 3000;
const server = http.createServer(handleRequest);
server.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
