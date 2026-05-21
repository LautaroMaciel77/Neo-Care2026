// backend/models/UsuarioModel.js

const { sql } = require('../config/db');

class UsuarioModel {
    /**
     * Verificar si un usuario es médico 
     * @param {number} id_usuario 
     * @returns {Promise<Object|null>}
     */
    static async verificarMedico(id_usuario) {
        try {
            const result = await sql.query`
                EXEC sp_VerificarMedico @id_usuario = ${id_usuario}
            `;
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error en UsuarioModel.verificarMedico:', error);
            throw error;
        }
    }
    // models/UsuarioModel.js - agregar este método

static async verificarPaciente(id_usuario) {
    const result = await sql.query`
        DECLARE @id_pac INT, @mensaje NVARCHAR(255);
        EXEC sp_ObtenerPacienteId ${id_usuario}, @id_pac OUTPUT, @mensaje OUTPUT;
        SELECT @id_pac AS id_paciente, @mensaje AS mensaje;
    `;
    
    const data = result.recordset[0];
    
    if (data.mensaje !== 'OK') {
        return null;
    }
    
    return {
        id_paciente: data.id_paciente,
        es_paciente: true
    };
}
}




module.exports = UsuarioModel;