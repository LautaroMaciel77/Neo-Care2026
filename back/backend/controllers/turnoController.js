const { sql } = require('../config/db');

// Crear turno médico
const crearTurno = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, estado } = req.body;

    try {
        // 1. Verificar campos obligatorios
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'La fecha, hora de inicio y hora de fin son obligatorias' });
        }

        // 2. Verificar que el usuario es médico usando SP
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'Solo los médicos pueden crear turnos' });
        }

        // 3. Crear el turno usando SP
        const result = await sql.query`
            EXEC sp_CrearTurno
                @fecha = ${fecha},
                @hora_inicio = ${hora_inicio},
                @hora_fin = ${hora_fin},
                @estado = ${estado || 'disponible'},
                @id_medico = ${medico.id_medico}
        `;

        res.status(201).json({
            message: 'Turno creado exitosamente',
            id_turno: result.recordset[0].id_turno,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al crear turno' });
    }
};

// Listar todos los turnos disponibles
const listarTurnos = async (req, res) => {
    try {
        const result = await sql.query`EXEC sp_ListarTurnosDisponibles`;
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
};

// Listar turnos de un médico específico
const getMisTurnos = async (req, res) => {
    try {
        // Verificar que el usuario es médico
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Obtener los turnos del médico usando SP
        const result = await sql.query`
            EXEC sp_ListarTurnosPorMedico @id_medico = ${medico.id_medico}
        `;

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
};

// Listar turnos filtrados
const listarTurnosFiltrados = async (req, res) => {
    try {
        const { especialidad, fecha, estado, ubicacion } = req.query;

        const result = await sql.query`
            EXEC sp_ListarTurnosFiltrados
                @especialidad = ${especialidad},
                @fecha = ${fecha},
                @estado = ${estado},
                @ubicacion = ${ubicacion}
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos filtrados' });
    }
};

// Cancelar turno
const cancelarTurno = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario es médico
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Cancelar el turno usando SP
        const result = await sql.query`
            EXEC sp_CancelarTurno
                @id_turno = ${id},
                @id_medico = ${medico.id_medico}
        `;
        
        res.status(200).json({ 
            message: result.recordset[0]?.Mensaje || 'Turno cancelado exitosamente'
        });
    } catch (error) {
        console.error('Error en BD:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({ 
            message: error.message || 'Error al cancelar el turno' 
        });
    }
};

// Actualizar turno
const actualizarTurno = async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, estado } = req.body;

    try {
        // Verificar que el usuario es médico
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Actualizar el turno usando SP
        const result = await sql.query`
            EXEC sp_ActualizarTurno
                @id_turno = ${id},
                @id_medico = ${medico.id_medico},
                @fecha = ${fecha || null},
                @hora_inicio = ${hora_inicio || null},
                @hora_fin = ${hora_fin || null},
                @estado = ${estado || null}
        `;
        
        res.status(200).json({ 
            message: result.recordset[0]?.Mensaje || 'Turno actualizado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el turno' });
    }
};

// Obtener turno por ID
const obtenerTurnoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        // Asegurarse de que id sea número
        const idTurno = parseInt(id);
        
        if (isNaN(idTurno)) {
            return res.status(400).json({ message: 'ID de turno inválido' });
        }

        const result = await sql.query`
            EXEC sp_ObtenerTurnoPorId @id_turno = ${idTurno}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el turno' });
    }
};

// Verificar conflicto de horario
const verificarConflictoHorario = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, excluir_turno } = req.body;

    try {
        // Verificar que el usuario es médico
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const result = await sql.query`
            EXEC sp_VerificarConflictoHorario
                @id_medico = ${medico.id_medico},
                @fecha = ${fecha},
                @hora_inicio = ${hora_inicio},
                @hora_fin = ${hora_fin},
                @excluir_turno = ${excluir_turno || null}
        `;
        
        res.json({ 
            hay_conflicto: result.recordset[0].conflicto > 0 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar conflicto de horario' });
    }
};

module.exports = { 
    crearTurno, 
    listarTurnos, 
    getMisTurnos, 
    listarTurnosFiltrados, 
    cancelarTurno,
    actualizarTurno,
    obtenerTurnoPorId,
    verificarConflictoHorario
};