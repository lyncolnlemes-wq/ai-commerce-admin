const jwt = require('jsonwebtoken');
const { parse } = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const TOKEN_NAME = 'admin_token';

function getUsers() {
  const raw = process.env.ADMIN_USERS || '';
  return raw.split(',').map((entry) => {
    const [email, password] = entry.split(':');
    return { email: email?.trim(), password: password?.trim() };
  }).filter((u) => u.email && u.password);
}

function validateCredentials(email, password) {
  const users = getUsers();
  return users.find((u) => u.email === email && u.password === password);
}

function generateToken(email) {
  return jwt.sign({ email, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getTokenFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  return cookies[TOKEN_NAME] || null;
}

function requireAuth(handler) {
  return async (req, res) => {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: 'Não autenticado' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Token inválido ou expirado' });
    req.user = decoded;
    return handler(req, res);
  };
}

module.exports = { validateCredentials, generateToken, verifyToken, getTokenFromRequest, requireAuth, TOKEN_NAME };
