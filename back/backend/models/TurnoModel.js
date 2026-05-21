// backend/models/turnoModel.js


const { sql } = require('../config/db');

class TurnoModel {

    static async crearTurno(turnoData) {
        const { fecha, hora_inicio, hora_fin, estado, id_medico } = turnoData;
        
        const result = await sql.query`
            EXEC sp_CrearTurno
                @fecha = ${fecha},
                @hora_inicio = ${hora_inicio},
                @hora_fin = ${hora_fin},
                @estado = ${estado || 'disponible'},
                @id_medico = ${id_medico}
        `;
        return result.recordset[0];
    }


    static async listarTurnosDisponibles() {
        const result = await sql.query`EXEC sp_ListarTurnosDisponibles`;
        return result.recordset;
    }


    static async listarTurnosPorMedico(id_medico) {
        const result = await sql.query`
            EXEC sp_ListarTurnosPorMedico @id_medico = ${id_medico}
        `;
        return result.recordset;
    }

    static async listarTurnosFiltrados(filtros) {
        const { especialidad, fecha, estado, id_localidad } = filtros;
        
        const result = await sql.query`
            EXEC sp_ListarTurnosFiltrados
                @especialidad = ${especialidad || null},
                @fecha = ${fecha || null},
                @estado = ${estado || null},
                @id_localidad = ${id_localidad || null}
        `;
        return result.recordset;
    }

    static async cancelarTurno(id_turno, id_medico) {
        const result = await sql.query`
            EXEC sp_CancelarTurno
                @id_turno = ${id_turno},
                @id_medico = ${id_medico}
        `;
        return result.recordset[0];
    }

    static async actualizarTurno(id_turno, id_medico, datos) {
        const { fecha, hora_inicio, hora_fin, estado } = datos;
        
        const result = await sql.query`
            EXEC sp_ActualizarTurno
                @id_turno = ${id_turno},
                @id_medico = ${id_medico},
                @fecha = ${fecha || null},
                @hora_inicio = ${hora_inicio || null},
                @hora_fin = ${hora_fin || null},
                @estado = ${estado || null}
        `;
        return result.recordset[0];
    }

    static async obtenerTurnoPorId(id_turno) {
        const result = await sql.query`
            EXEC sp_ObtenerTurnoPorId @id_turno = ${id_turno}
        `;
        return result.recordset[0];
    }

    static async verificarConflictoHorario(id_medico, fecha, hora_inicio, hora_fin, excluir_turno = null) {
        const result = await sql.query`
            EXEC sp_VerificarConflictoHorario
                @id_medico = ${id_medico},
                @fecha = ${fecha},
                @hora_inicio = ${hora_inicio},
                @hora_fin = ${hora_fin},
                @excluir_turno = ${excluir_turno}
        `;
        return result.recordset[0];
    }

    static async modificarHorarioTurno(id_turno, id_medico, nueva_fecha, nueva_hora_inicio, nueva_hora_fin) {
        const result = await sql.query`
            EXEC sp_ModificarHorarioTurno
                @id_turno = ${id_turno},
                @id_medico = ${id_medico},
                @nueva_fecha = ${nueva_fecha},
                @nueva_hora_inicio = ${nueva_hora_inicio},
                @nueva_hora_fin = ${nueva_hora_fin}
        `;
        return result.recordset[0];
    }
}

module.exports = TurnoModel;