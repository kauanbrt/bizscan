const jwt = require('jsonwebtoken');

// Importa a blacklist de tokens
let tokenBlacklist;
try {
  tokenBlacklist = require('./authRoutes').tokenBlacklist;
} catch (err) {
  tokenBlacklist = new Set();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não encontrado.' });
  }

  const token = authHeader.substring(7);

  // Verifica se o token está na blacklist
  if (tokenBlacklist && tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token foi invalidado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
