// models/HistoriaModel.js

const { sql } = require('../config/db');

class HistoriaModel {
    
    // crear historia
    static async registrarAtencion(data) {
        const { id_inscripcion, sintomas, diagnostico, tratamiento, receta, notas, fecha_atencion } = data;
        
        const result = await sql.query`
            EXEC sp_RegistrarAtencionMedica
                @id_inscripcion = ${id_inscripcion},
                @sintomas = ${sintomas || null},
                @diagnostico = ${diagnostico || null},
                @tratamiento = ${tratamiento || null},
                @receta = ${receta || null},
                @notas = ${notas || null},
                @fecha_atencion = ${fecha_atencion || null}
        `;
        
        return result.recordset[0];
    }
    
    // Listar historial médico de un paciente
    static async listarPorPaciente(id_paciente) {
        const result = await sql.query`
            EXEC sp_ListarHistoriaPorPaciente @id_paciente = ${id_paciente}
        `;
        return result.recordset;
    }
    
    // Obtener detalles de una historia médica específica
    static async obtenerPorId(id_historia_medica) {
        const result = await sql.query`
            EXEC sp_ObtenerHistoriaMedica @id_historia_medica = ${id_historia_medica}
        `;
        return result.recordset[0];
    }
    
    // Eliminar historiapara undo
    static async eliminar(id_historia_medica) {
        const result = await sql.query`
            EXEC sp_EliminarHistoriaMedica @id_historia_medica = ${id_historia_medica}
        `;
        return result.recordset[0];
    }
    static async obtenerPorInscripcion(id_inscripcion) {
    const result = await sql.query`
        EXEC sp_ObtenerHistoriaPorInscripcion @id_inscripcion = ${id_inscripcion}
    `;
    return result.recordset[0]; 
    }
    
    
}
module.exports = HistoriaModel;