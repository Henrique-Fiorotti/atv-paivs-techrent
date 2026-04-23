const express = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const EquipamentoController = require('../controllers/equipamentosController');

const router = express.Router();

router.get('/', autenticar, EquipamentoController.list);
router.get('/:id', autenticar, EquipamentoController.findById);
router.post('/', autenticar, autorizar('admin'), EquipamentoController.create);
router.put('/:id', autenticar, autorizar('admin'), EquipamentoController.update);
router.put('/:id/status', autenticar, autorizar('admin', 'tecnico'), EquipamentoController.updateStatus);
router.delete('/:id', autenticar, autorizar('admin'), EquipamentoController.delete);

module.exports = router;
