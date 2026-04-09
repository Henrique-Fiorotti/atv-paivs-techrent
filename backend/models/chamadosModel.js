const { query } = require("../config/database");

// =============================================

// CRUD de CHAMADOS

class ChamadosModel {

    static async criar(titulo, descricao, cliente_id, equipamento_id, tecnico_id = null, prioridade = 'media', status = 'aberto') {
        const sql = `INSERT INTO chamados (titulo, descricao, cliente_id, equipamento_id, tecnico_id, prioridade, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const result = await query(sql, [titulo, descricao, cliente_id, equipamento_id, 
        tecnico_id, prioridade, status]);
        
        return result.insertId; // Retorna o ID do chamado criado
    }

    static async findById(id) {
        const sql = `SELECT * FROM chamados WHERE id = ?`;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async listar(){
        const sql = `SELECT * FROM chamados`;
        return  await query(sql, []);
    }

    static async listarPorCliente(cliente_id){
        const sql = `SELECT * FROM chamados WHERE cliente_id = ? ORDER BY aberto_em DESC`;
        return await query(sql, [cliente_id]);
    }

    static async buscarDetalhadoPorId(id){
        const sql = `
            SELECT
                c.*,
                uc.nome AS cliente_nome,
                uc.email AS cliente_email,
                ut.nome AS tecnico_nome,
                e.nome AS equipamento_nome,
                e.categoria AS equipamento_categoria,
                e.patrimonio AS equipamento_patrimonio
            FROM chamados c
            JOIN usuarios uc ON c.cliente_id = uc.id
            LEFT JOIN usuarios ut ON c.tecnico_id = ut.id
            JOIN equipamentos e ON c.equipamento_id = e.id
            WHERE c.id = ?
        `;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async painelTecnico(){
        const sql = `SELECT * FROM view_painel_tecnico`;
        return await query(sql, []);
    }

    static async resumoChamados(){
        const sql = `SELECT * FROM view_resumo_chamados`;
        return await query(sql, []);
    }

    static async atualizar(id, {descricao, tecnico_id, prioridade, status}){
        const chamadoAtual = await this.findById(id);
        if (!chamadoAtual) return false;

        const sql = `UPDATE chamados
                     SET descricao = ?, tecnico_id = ?, prioridade = ?, status = ?
                     WHERE id = ?`;

        const result = await query(sql, [
            descricao ?? chamadoAtual.descricao,
            tecnico_id ?? chamadoAtual.tecnico_id,
            prioridade ?? chamadoAtual.prioridade,
            status ?? chamadoAtual.status,
            id
        ]);

        if ((status ?? chamadoAtual.status) === "resolvido") {
            if(chamadoAtual.equipamento_id){
                await query(
                    `UPDATE equipamentos set status = 'operacional' WHERE id = ?`, [chamadoAtual.equipamento_id]
                );
            }
        }
        
        return result.affectedRows > 0;
    }

    static async deletar(id){
        const sql = `DELETE from chamados WHERE id = ?`;

        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = { ChamadosModel }
