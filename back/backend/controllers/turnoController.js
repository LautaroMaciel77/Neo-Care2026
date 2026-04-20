const { sql } = require('../config/db');

// Crear turno médico
const crearTurno = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, estado } = req.body;

    try {
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'La fecha, hora de inicio y hora de fin son obligatorias' });
        }

        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'Solo los médicos pueden crear turnos' });
        }

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
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

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
        const { especialidad, fecha, estado, id_localidad } = req.query;

        const result = await sql.query`
            EXEC sp_ListarTurnosFiltrados
                @especialidad = ${especialidad || null},
                @fecha = ${fecha || null},
                @estado = ${estado || null},
                @id_localidad = ${id_localidad || null}
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
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

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
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

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



// Registrar atención médica
const registrarAtencionMedica = async (req, res) => {
    const { id_inscripcion, sintomas, diagnostico, tratamiento, receta, notas, fecha_atencion } = req.body;

    try {
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'Solo los médicos pueden registrar atenciones médicas' });
        }

        if (!id_inscripcion) {
            return res.status(400).json({ message: 'El ID de inscripción es obligatorio' });
        }

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

        res.status(201).json({
            message: 'Atención médica registrada exitosamente',
            id_historia_medica: result.recordset[0].id_historia_medica
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al registrar atención médica' });
    }
};

// Listar historial médico de un paciente
const listarHistoriaPorPaciente = async (req, res) => {
    const { id_paciente } = req.params;

    try {
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const esMedico = medicoResult.recordset[0]?.es_medico || false;
        
        const pacienteResult = await sql.query`
            SELECT id_paciente FROM paciente WHERE id_usuario = ${req.user.id_usuario}
        `;
        const esPaciente = pacienteResult.recordset[0]?.id_paciente == id_paciente;

        if (!esMedico && !esPaciente) {
            return res.status(403).json({ message: 'No autorizado para ver este historial' });
        }

        const result = await sql.query`
            EXEC sp_ListarHistoriaPorPaciente @id_paciente = ${id_paciente}
        `;

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el historial médico' });
    }
};

// Obtener detalles de una historia médica específica
const obtenerHistoriaMedica = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query`
            EXEC sp_ObtenerHistoriaMedica @id_historia_medica = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Historia médica no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la historia médica' });
    }
};
// Modificar horario de turno
const modificarHorarioTurno = async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin } = req.body;

    try {
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'La nueva fecha, hora inicio y hora fin son obligatorias' });
        }

        // Verificar que es médico
        const medicoResult = await sql.query`
            EXEC sp_VerificarMedico @id_usuario = ${req.user.id_usuario}
        `;
        
        const medico = medicoResult.recordset[0];
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Modificar horario
        const result = await sql.query`
            EXEC sp_ModificarHorarioTurno
                @id_turno = ${id},
                @id_medico = ${medico.id_medico},
                @nueva_fecha = ${fecha},
                @nueva_hora_inicio = ${hora_inicio},
                @nueva_hora_fin = ${hora_fin}
        `;

        const data = result.recordset[0];
        
        // Si tiene paciente, mostrar advertencia
        if (data.TienePaciente === 1) {
            return res.status(200).json({
                message: `Horario modificado. El paciente ${data.NombrePaciente} (${data.EmailPaciente}) será notificado del cambio.`,
                warning: true,
                paciente: {
                    nombre: data.NombrePaciente,
                    email: data.EmailPaciente
                }
            });
        }
        
        res.status(200).json({ message: data.Mensaje });
        
    } catch (error) {
        console.error(error);
        let statusCode = 500;
        let message = error.message;
        
        if (error.message.includes('no te pertenece')) statusCode = 404;
        if (error.message.includes('Ya existe otro turno')) statusCode = 409;
        
        res.status(statusCode).json({ message });
    }
};

//quitar las historias de paciente y moverlas a controller Paciente
module.exports = { 
    crearTurno, 
    listarTurnos, 
    getMisTurnos, 
    listarTurnosFiltrados, 
    cancelarTurno,
    actualizarTurno,
    obtenerTurnoPorId,
    verificarConflictoHorario,
    modificarHorarioTurno
    //registrarAtencionMedica,
    //listarHistoriaPorPaciente,
    //obtenerHistoriaMedica
};