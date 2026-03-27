const { query } = require('../config/database');

// =============================================

class UserModel {

    static async encontrarPorId(id){
        const sql = `SELECT * from usuarios WHERE id = ?`;
        const result = await query(sql, [id]);
        return result[0] || null; // Retorna usuário ou Null
    }

    static async encontrarPorEmail(email){
        const sql = `SELECT * from usuarios WHERE email = ?`;
        const result = await query(sql, [email]);
        return result[0] || null; // Retorna usuário ou Null
    }

    static async criar(nome, email, senha, nivel_acesso) {
        const sql = `INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)`;
        const result = await query(sql, [nome, email, senha, nivel_acesso]);
        return result.insertId; // Retorna o ID do usuário criado
    }

    static async atualizar(id, nome){
        const sql = `UPDATE usuarios SET nome = ? WHERE id = ?`
        const result = await query(sql, [nome, id])
        return result.affectedRows > 0; // Retorna o ID e Nome de usuário atualizado
    }

}

module.exports = { UserModel };
