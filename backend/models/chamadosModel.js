const { query } = require('../config/database');

class ChamadaModel {
  static async create(
    { titulo, descricao, cliente_id, equipamento_id, tecnico_id, prioridade, status },
    executor = null
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

    const params = [titulo, descricao, cliente_id, equipamento_id, tecnico_id, prioridade, status];

    if (executor) {
      const [result] = await executor.execute(sql, params);
      return result.insertId;
    }

    const result = await query(sql, params);
    return result.insertId;
  }

  static async findById(id, executor = null) {
    const sql = `
      SELECT
        c.*,
        u.nome AS solicitante,
        u.email AS cliente_email,
        t.nome AS tecnico_responsavel,
        t.email AS tecnico_email,
        e.nome AS equipamento,
        e.categoria,
        e.patrimonio,
        e.status AS equipamento_status
      FROM chamados c
      JOIN usuarios u ON c.cliente_id = u.id
      LEFT JOIN usuarios t ON c.tecnico_id = t.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      WHERE c.id = ?
    `;

    if (executor) {
      const [result] = await executor.execute(sql, [id]);
      return result[0] || null;
    }

    const result = await query(sql, [id]);
    return result[0] || null;
  }

  static async findByAccessLevel({ id, cliente }) {
    const sql = `
      SELECT
        c.*,
        u.nome AS solicitante,
        t.nome AS tecnico_responsavel,
        e.nome AS equipamento,
        e.categoria,
        e.patrimonio,
        e.status AS equipamento_status
      FROM chamados c
      JOIN usuarios u ON c.cliente_id = u.id
      LEFT JOIN usuarios t ON c.tecnico_id = t.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      ${cliente ? 'WHERE c.cliente_id = ?' : ''}
      ORDER BY c.status ASC, c.aberto_em DESC, c.id DESC
    `;

    return cliente ? query(sql, [id]) : query(sql);
  }

  static async setTecnico({ id, tecnico_id }, executor = null) {
    const sql = `
      UPDATE chamados
      SET tecnico_id = ?, status = 'em_atendimento'
      WHERE id = ?
    `;

    if (executor) {
      const [result] = await executor.execute(sql, [tecnico_id, id]);
      return result.affectedRows > 0;
    }

    const result = await query(sql, [tecnico_id, id]);
    return result.affectedRows > 0;
  }

  static async updateStatus({ id, status }, executor = null) {
    const sql = 'UPDATE chamados SET status = ? WHERE id = ?';

    if (executor) {
      const [result] = await executor.execute(sql, [status, id]);
      return result.affectedRows > 0;
    }

    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  static async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) AS total
      FROM chamados
      WHERE status IS NOT NULL
      GROUP BY status
    `;

    return query(sql);
  }

  static async viewTecnico() {
    const sql = `
      SELECT
        c.id AS chamado_id,
        c.titulo,
        c.descricao,
        c.equipamento_id,
        c.prioridade,
        c.status,
        u_cliente.nome AS solicitante,
        e.nome AS equipamento,
        e.categoria,
        e.patrimonio,
        u_tec.nome AS tecnico_responsavel,
        c.aberto_em,
        c.atualizado_em
      FROM chamados c
      JOIN usuarios u_cliente ON c.cliente_id = u_cliente.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      LEFT JOIN usuarios u_tec ON c.tecnico_id = u_tec.id
      WHERE c.status IN ('aberto', 'em_atendimento')
      ORDER BY
        FIELD(c.prioridade, 'alta', 'media', 'baixa'),
        c.aberto_em ASC,
        c.id ASC
    `;

    return query(sql);
  }

  static async deleteById(id) {
    const sql = 'DELETE FROM chamados WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ChamadaModel;
