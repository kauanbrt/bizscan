// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/authRoutes');
const companyRoutes = require('./src/routes/companyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS (deve vir antes do rate limiting)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Headers de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilita CSP para evitar conflitos com Vite em dev
}));

// Rate limiting - prevenir ataques automatizados
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requests por IP em 15 minutos
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas de login em 15 minutos
  message: 'Muitas tentativas de login, tente novamente mais tarde.',
  skipSuccessfulRequests: true,
});

app.use('/api/login', loginLimiter);
app.use('/api', limiter);

// Compressão de respostas
app.use(compression());

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas
app.use('/api', authRoutes);
app.use('/api', companyRoutes);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
