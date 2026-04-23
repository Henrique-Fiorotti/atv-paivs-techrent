const { query } = require('../config/database');

class UserModel {
  static async create({ nome, email, senha, nivel_acesso }) {
    const sql = `
      INSERT INTO usuarios (nome, email, senha, nivel_acesso)
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [nome, email, senha, nivel_acesso]);
    return result.insertId;
  }

  static async findAll() {
    const sql = `
      SELECT id, nome, email, nivel_acesso, criado_em
      FROM usuarios
      ORDER BY criado_em DESC, id DESC
    `;

    return query(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    const result = await query(sql, [id]);
    return result[0] || null;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    const result = await query(sql, [email]);
    return result[0] || null;
  }

  static async update({ id, nome }) {
    const sql = 'UPDATE usuarios SET nome = ? WHERE id = ?';
    const result = await query(sql, [nome, id]);
    return result.affectedRows > 0;
  }

  static async deleteById(id) {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
