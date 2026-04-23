const UserModel = require('../models/userModel');

class UsuariosController {
  static async list(req, res) {
    try {
      const usuarios = await UserModel.findAll();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuarios:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async delete(req, res) {
    try {
      const usuario = await UserModel.findById(req.params.id);

      if (!usuario) {
        return res.status(404).json({ mensagem: 'Usuario nao encontrado.' });
      }

      if (Number(usuario.id) === Number(req.usuario.id)) {
        return res.status(409).json({ mensagem: 'Voce nao pode remover o proprio usuario.' });
      }

      await UserModel.deleteById(req.params.id);

      return res.status(200).json({ mensagem: 'Usuario deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar usuario:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = UsuariosController;
