const { query } = require('../config/database');

class ChamadosModel {
  static async criar(
    titulo,
    descricao,
    cliente_id,
    equipamento_id,
    tecnico_id = null,
    prioridade = 'media',
    status = 'aberto'
  ) {
    const sql = `
      INSERT INTO chamados (
        titulo,
        descricao,
        cliente_id,
        equipamento_id,
        tecnico_id,
        prioridade,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      titulo,
      descricao,
      cliente_id,
      equipamento_id,
      tecnico_id,
      prioridade,
      status,
    ]);

    return result.insertId;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM chamados WHERE id = ?';
    const result = await query(sql, [id]);
    return result[0] || null;
  }

  static async listar() {
    const sql = `
      SELECT
        c.*,
        uc.nome AS cliente_nome,
        uc.email AS cliente_email,
        ut.nome AS tecnico_nome,
        e.nome AS equipamento_nome,
        e.categoria AS equipamento_categoria,
        e.patrimonio AS equipamento_patrimonio,
        e.status AS equipamento_status
      FROM chamados c
      JOIN usuarios uc ON c.cliente_id = uc.id
      LEFT JOIN usuarios ut ON c.tecnico_id = ut.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      ORDER BY c.aberto_em DESC, c.id DESC
    `;

    return query(sql);
  }

  static async listarPorCliente(cliente_id) {
    const sql = `
      SELECT
        c.*,
        uc.nome AS cliente_nome,
        uc.email AS cliente_email,
        ut.nome AS tecnico_nome,
        e.nome AS equipamento_nome,
        e.categoria AS equipamento_categoria,
        e.patrimonio AS equipamento_patrimonio,
        e.status AS equipamento_status
      FROM chamados c
      JOIN usuarios uc ON c.cliente_id = uc.id
      LEFT JOIN usuarios ut ON c.tecnico_id = ut.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      WHERE c.cliente_id = ?
      ORDER BY c.aberto_em DESC, c.id DESC
    `;

    return query(sql, [cliente_id]);
  }

  static async buscarDetalhadoPorId(id) {
    const sql = `
      SELECT
        c.*,
        uc.nome AS cliente_nome,
        uc.email AS cliente_email,
        ut.nome AS tecnico_nome,
        ut.email AS tecnico_email,
        e.nome AS equipamento_nome,
        e.categoria AS equipamento_categoria,
        e.patrimonio AS equipamento_patrimonio,
        e.status AS equipamento_status
      FROM chamados c
      JOIN usuarios uc ON c.cliente_id = uc.id
      LEFT JOIN usuarios ut ON c.tecnico_id = ut.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      WHERE c.id = ?
    `;

    const result = await query(sql, [id]);
    return result[0] || null;
  }

  static async atualizar(id, { descricao, tecnico_id, prioridade, status }) {
    const chamadoAtual = await this.findById(id);
    if (!chamadoAtual) {
      return false;
    }

    const sql = `
      UPDATE chamados
      SET descricao = ?, tecnico_id = ?, prioridade = ?, status = ?
      WHERE id = ?
    `;

    const result = await query(sql, [
      descricao ?? chamadoAtual.descricao,
      tecnico_id ?? chamadoAtual.tecnico_id,
      prioridade ?? chamadoAtual.prioridade,
      status ?? chamadoAtual.status,
      id,
    ]);

    return result.affectedRows > 0;
  }

  static async deletar(id) {
    const sql = 'DELETE FROM chamados WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = { ChamadosModel };
