const { query } = require('../config/database');

class EquipamentoModel {
  static async create({ nome, categoria, patrimonio, status, descricao }, executor = null) {
    const sql = `
      INSERT INTO equipamentos (nome, categoria, patrimonio, status, descricao)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [nome, categoria, patrimonio, status, descricao];

    if (executor) {
      const [result] = await executor.execute(sql, params);
      return result.insertId;
    }

    const result = await query(sql, params);
    return result.insertId;
  }

  static async findById(id, executor = null) {
    const sql = 'SELECT * FROM equipamentos WHERE id = ?';

    if (executor) {
      const [result] = await executor.execute(sql, [id]);
      return result[0] || null;
    }

    const result = await query(sql, [id]);
    return result[0] || null;
  }

  static async findByPatrimonio(patrimonio) {
    const sql = 'SELECT * FROM equipamentos WHERE patrimonio = ?';
    const result = await query(sql, [patrimonio]);
    return result[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT *
      FROM equipamentos
      ORDER BY
        CASE status
          WHEN 'em_manutencao' THEN 1
          WHEN 'operacional' THEN 2
          ELSE 3
        END,
        nome ASC,
        id ASC
    `;

    return query(sql);
  }

  static async listFunctional() {
    const sql = `
      SELECT *
      FROM view_equipamentos_operacionais
      ORDER BY nome ASC, id ASC
    `;

    return query(sql);
  }

  static async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) AS total
      FROM equipamentos
      WHERE status IS NOT NULL
      GROUP BY status
    `;

    return query(sql);
  }

  static async update(id, { nome, categoria, patrimonio, status, descricao }, executor = null) {
    const sql = `
      UPDATE equipamentos
      SET nome = ?, categoria = ?, patrimonio = ?, status = ?, descricao = ?
      WHERE id = ?
    `;

    const params = [nome, categoria, patrimonio, status, descricao, id];

    if (executor) {
      const [result] = await executor.execute(sql, params);
      return result.affectedRows > 0;
    }

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  static async updateStatus({ id, status }, executor = null) {
    const sql = 'UPDATE equipamentos SET status = ? WHERE id = ?';

    if (executor) {
      const [result] = await executor.execute(sql, [status, id]);
      return result.affectedRows > 0;
    }

    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  static async deleteById(id) {
    const sql = 'DELETE FROM equipamentos WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = EquipamentoModel;
