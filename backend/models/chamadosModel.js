const { query } = require("../config/database");
const { pool } = require("../config/database");

// =============================================

class ChamadosModel {

    static async listar(id_usuario, perfil) {
        const sql = `SELECT * FROM chamados WHERE cliente_id = ?`;
        const result = await query(sql, [id]);
        return result[0] || null;
    }
    
}