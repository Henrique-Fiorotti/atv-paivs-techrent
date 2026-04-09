// =============================================
// CONTROLLER DE EQUIPAMENTOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
// Cada função recebe (req, res) e deve retornar uma resposta JSON.

const db = require('../config/database');

// GET /equipamentos - lista todos os equipamentos do inventário
const listar = async (req, res) => {
  try {
    const equipamentos = await db.query('SELECT * FROM equipamentos ORDER BY id DESC');
    return res.status(200).json(equipamentos);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// GET /equipamentos/:id - retorna um equipamento pelo ID
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const equipamento = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);

    if (equipamento.length === 0) {
      return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
    }

    return res.status(200).json(equipamento[0]);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// POST /equipamentos - cria um novo equipamento (apenas admin)
const criar = async (req, res) => {
  try {
    const { nome, categoria, patrimonio, status = 'operacional', descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ mensagem: 'Campo nome é obrigatório' });
    }

    const result = await db.query(
      'INSERT INTO equipamentos (nome, categoria, patrimonio, status, descricao) VALUES (?, ?, ?, ?, ?)',
      [nome, categoria || null, patrimonio || null, status, descricao || null]
    );

    return res.status(201).json({ mensagem: 'Equipamento criado com sucesso', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// PUT /equipamentos/:id - atualiza um equipamento (apenas admin)
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, categoria, patrimonio, status, descricao } = req.body;
    const atual = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);

    if (atual.length === 0) {
      return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
    }

    await db.query(
      `UPDATE equipamentos
       SET nome = ?, categoria = ?, patrimonio = ?, status = ?, descricao = ?
       WHERE id = ?`,
      [
        nome ?? atual[0].nome,
        categoria ?? atual[0].categoria,
        patrimonio ?? atual[0].patrimonio,
        status ?? atual[0].status,
        descricao ?? atual[0].descricao,
        id
      ]
    );

    return res.status(200).json({ mensagem: 'Equipamento atualizado com sucesso' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// DELETE /equipamentos/:id - remove um equipamento (apenas admin)
const remover = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM equipamentos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
    }

    return res.status(200).json({ mensagem: 'Equipamento removido com sucesso' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
