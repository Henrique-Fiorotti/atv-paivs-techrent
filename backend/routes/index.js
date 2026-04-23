const express = require('express');

const authRoutes = require('./authRoutes');
const usuariosRoutes = require('./usuariosRoutes');
const equipamentosRoutes = require('./equipamentosRoutes');
const chamadosRoutes = require('./chamadosRoutes');
const manutencaoRoutes = require('./manutencaoRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/equipamentos', equipamentosRoutes);
router.use('/chamados', chamadosRoutes);
router.use('/manutencao', manutencaoRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
