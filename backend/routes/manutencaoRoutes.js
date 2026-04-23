const express = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const ManutencaoController = require('../controllers/manutencaoController');

const router = express.Router();

router.get('/', autenticar, autorizar('admin', 'tecnico'), ManutencaoController.list);
router.post('/', autenticar, autorizar('admin', 'tecnico'), ManutencaoController.register);
router.put('/:id', autenticar, autorizar('admin', 'tecnico'), ManutencaoController.updateDescription);

module.exports = router;
