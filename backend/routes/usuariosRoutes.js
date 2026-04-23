const express = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const UsuariosController = require('../controllers/usuariosController');

const router = express.Router();

router.get('/', autenticar, autorizar('admin'), UsuariosController.list);
router.delete('/:id', autenticar, autorizar('admin'), UsuariosController.delete);

module.exports = router;
