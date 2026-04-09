// =============================================
// REGISTRADOR CENTRAL DE ROTAS DA API
// =============================================
// Centraliza o mapeamento de prefixos para manter o server.js limpo.

const express = require('express');

const authRoutes = require('./authRoutes');
const equipamentosRoutes = require('./equipamentosRoutes');
const chamadosRoutes = require('./chamadosRoutes');
const manutencaoRoutes = require('./manutencaoRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/equipamentos', equipamentosRoutes);
router.use('/chamados', chamadosRoutes);
router.use('/manutencao', manutencaoRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
