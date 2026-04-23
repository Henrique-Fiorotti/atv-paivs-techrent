const express = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const ChamadaController = require('../controllers/chamadosController');

const router = express.Router();

router.get('/', autenticar, ChamadaController.list);
router.get('/:id', autenticar, ChamadaController.findById);
router.post('/', autenticar, autorizar('cliente', 'admin'), ChamadaController.create);
router.put('/:id/status', autenticar, autorizar('tecnico', 'admin'), ChamadaController.updateStatus);

module.exports = router;
