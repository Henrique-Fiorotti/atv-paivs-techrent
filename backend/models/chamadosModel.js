const { query } = require("../config/database");

// =============================================

// CRUD de CHAMADOS

class ChamadosModel {

    static async criar(titulo, descricao, cliente_id, equipamento_id, tecnico_id, prioridade, status) {
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

    static async painelTecnico(){
        const sql = `SELECT * FROM view_painel_tecnico`;
        return await query(sql, []);
    }

    static async resumoChamados(){
        const sql = `SELECT * FROM view_resumo_chamados`;
        return await query(sql, []);
    }

    static async atualizar(id, {descricao, tecnico_id, prioridade, status}){
        // TODO: ex: aberto -> em_atendimento -> resolvido
        // ao resolver, atualizar equipamentos.status para 'operacional'

        const sql = `UPDATE chamados set descricao = ?, tecnico_id = ?, prioridade = ?, status = ? WHERE id = ?`;

        const result = await query(sql, [descricao, tecnico_id, prioridade, status, id]);

        if(status == "resolvido"){

            const chamado = await this.findById;

            if(chamado && chamado.equipamento_id){
                await query(
                    `UPDATE equipamentos set status = 'operacional' WHERE id = ?`, [chamado.equipamento_id]
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