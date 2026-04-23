const { query } = require('../config/database');

class ManutencaoModel {
  static async create({ chamado_id, equipamento_id, tecnico_id, descricao }, executor = null) {
    const sql = `
      INSERT INTO historico_manutencao (chamado_id, equipamento_id, tecnico_id, descricao)
      VALUES (?, ?, ?, ?)
    `;

    const params = [chamado_id, equipamento_id, tecnico_id, descricao];

    if (executor) {
      const [result] = await executor.execute(sql, params);
      return result.insertId;
    }

    const result = await query(sql, params);
    return result.insertId;
  }

  static async findAll() {
    const sql = `
      SELECT
        hm.*,
        c.titulo AS chamado,
        e.nome AS equipamento,
        e.patrimonio AS patrimonio,
        u.nome AS tecnico
      FROM historico_manutencao hm
      JOIN chamados c ON hm.chamado_id = c.id
      JOIN equipamentos e ON hm.equipamento_id = e.id
      JOIN usuarios u ON hm.tecnico_id = u.id
      ORDER BY hm.registrado_em DESC, hm.id DESC
    `;

    return query(sql);
  }

  static async findByChamadoId(chamado_id) {
    const sql = `
      SELECT
        hm.*,
        e.nome AS equipamento,
        u.nome AS tecnico
      FROM historico_manutencao hm
      JOIN equipamentos e ON hm.equipamento_id = e.id
      JOIN usuarios u ON hm.tecnico_id = u.id
      WHERE hm.chamado_id = ?
      ORDER BY hm.registrado_em ASC, hm.id ASC
    `;

    return query(sql, [chamado_id]);
  }

  static async updateDescription(id, descricao) {
    const sql = 'UPDATE historico_manutencao SET descricao = ? WHERE id = ?';
    const result = await query(sql, [descricao, id]);
    return result.affectedRows > 0;
  }
}

module.exports = ManutencaoModel;
