const express = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/admin', autenticar, autorizar('admin'), DashboardController.viewAdmin);
router.get('/tecnico', autenticar, autorizar('admin', 'tecnico'), DashboardController.viewTecnico);
router.get('/cliente', autenticar, autorizar('cliente', 'admin'), DashboardController.viewCliente);

module.exports = router;
