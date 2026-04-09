// =============================================
// CONTROLLER DE HISTÓRICO DE MANUTENÇÃO
// =============================================
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /manutencao - lista todos os registros de manutenção (admin/técnico)
const listar = async (req, res) => {
  try {
    const registros = await db.query(`
      SELECT
        hm.*,
        c.titulo AS chamado_titulo,
        e.nome AS equipamento_nome,
        u.nome AS tecnico_nome
      FROM historico_manutencao hm
      JOIN chamados c ON hm.chamado_id = c.id
      JOIN equipamentos e ON hm.equipamento_id = e.id
      JOIN usuarios u ON hm.tecnico_id = u.id
      ORDER BY hm.registrado_em DESC
    `);

    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// POST /manutencao - registra um reparo em um equipamento (técnico)
// Body esperado: { chamado_id, equipamento_id, descricao }
// Após registrar, atualizar chamados.status para 'resolvido'
// e equipamentos.status para 'operacional'
const registrar = async (req, res) => {
  try {
    const { chamado_id, equipamento_id, descricao } = req.body;
    const tecnico_id = req.usuario.id;

    if (!chamado_id || !equipamento_id || !descricao) {
      return res.status(400).json({ mensagem: 'Campos chamado_id, equipamento_id e descricao são obrigatórios.' });
    }

    const chamado = await db.query('SELECT * FROM chamados WHERE id = ?', [chamado_id]);
    if (chamado.length === 0) {
      return res.status(404).json({ mensagem: 'Chamado não encontrado' });
    }

    await db.query(
      `INSERT INTO historico_manutencao (chamado_id, equipamento_id, tecnico_id, descricao)
       VALUES (?, ?, ?, ?)`,
      [chamado_id, equipamento_id, tecnico_id, descricao]
    );

    await db.query(
      `UPDATE chamados SET status = 'resolvido', tecnico_id = ? WHERE id = ?`,
      [tecnico_id, chamado_id]
    );
    await db.query(
      `UPDATE equipamentos SET status = 'operacional' WHERE id = ?`,
      [equipamento_id]
    );

    return res.status(201).json({ mensagem: 'Manutenção registrada com sucesso' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

module.exports = { listar, registrar };
