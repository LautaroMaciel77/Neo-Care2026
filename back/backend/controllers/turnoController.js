// controllers/turnoController.js

const { sql } = require('../config/db');
const UsuarioModel = require('../models/UsuarioModel');
const TurnoModel = require('../models/TurnoModel');
const CommandInvoker = require('../commands/invoker/CommandInvoker');
const CrearTurnoCommand = require('../commands/turno/CrearTurnoCommand');
const CancelarTurnoCommand = require('../commands/turno/CancelarTurnoCommand');
const ActualizarTurnoCommand = require('../commands/turno/ActualizarTurnoCommand');
const ModificarHorarioCommand = require('../commands/turno/ModificarHorarioCommand');

// Crear turno médico
const crearTurno = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, estado } = req.body;

    try {
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ 
                message: 'La fecha, hora de inicio y hora de fin son obligatorias' 
            });
        }

        const command = new CrearTurnoCommand(req.user.id_usuario, {
            fecha,
            hora_inicio,
            hora_fin,
            estado: estado || 'disponible'
        });
        
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);

        res.status(201).json({
            message: 'Turno creado exitosamente',
            id_turno: resultado.id_turno
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al crear turno' });
    }
};

// Listar todos los turnos disponibles
const listarTurnos = async (req, res) => {
    try {
        const turnos = await TurnoModel.listarTurnosDisponibles();
        res.json(turnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
};

// Listar turnos de un médico específico
const getMisTurnos = async (req, res) => {
    try {
        const medico = await UsuarioModel.verificarMedico(req.user.id_usuario);
        
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const turnos = await TurnoModel.listarTurnosPorMedico(medico.id_medico);
        res.status(200).json(turnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
};

// Listar turnos filtrados
const listarTurnosFiltrados = async (req, res) => {
    try {
        const { especialidad, fecha, estado, id_localidad } = req.query;

        const turnos = await TurnoModel.listarTurnosFiltrados({
            especialidad,
            fecha,
            estado,
            id_localidad
        });

        res.json(turnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos filtrados' });
    }
};



const cancelarTurno = async (req, res) => {
    const { id } = req.params;

    try {
        const command = new CancelarTurnoCommand(req.user.id_usuario, id);
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);
        
        res.status(200).json({ 
            message: resultado?.Mensaje || 'Turno cancelado exitosamente'
        });
        
    } catch (error) {
        console.error('Error:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({ 
            message: error.message || 'Error al cancelar el turno' 
        });
    }
};


const actualizarTurno = async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, estado } = req.body;

    try {
        const command = new ActualizarTurnoCommand(
            req.user.id_usuario, 
            id, 
            { fecha, hora_inicio, hora_fin, estado }
        );
        
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);
        
        res.status(200).json({ 
            message: resultado?.Mensaje || 'Turno actualizado exitosamente'
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al actualizar el turno' });
    }
};

const modificarHorarioTurno = async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin } = req.body;

    try {
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'La nueva fecha, hora inicio y hora fin son obligatorias' });
        }

        const command = new ModificarHorarioCommand(
            req.user.id_usuario,
            id,
            { fecha, hora_inicio, hora_fin }
        );
        
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);
        
        if (resultado.warning) {
            return res.status(200).json({
                message: resultado.message,
                warning: true,
                paciente: resultado.paciente
            });
        }
        
        res.status(200).json({ message: resultado.Mensaje || 'Horario modificado exitosamente' });
        
    } catch (error) {
        console.error(error);
        let statusCode = 500;
        let message = error.message;
        
        if (error.message.includes('no te pertenece')) statusCode = 404;
        if (error.message.includes('Ya existe otro turno')) statusCode = 409;
        
        res.status(statusCode).json({ message });
    }
};

// Obtener turno por ID de turno
const obtenerTurnoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const idTurno = parseInt(id);
        
        if (isNaN(idTurno)) {
            return res.status(400).json({ message: 'ID de turno inválido' });
        }

        const turno = await TurnoModel.obtenerTurnoPorId(idTurno);
        
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        
        res.json(turno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el turno' });
    }
};

// Verificar conflicto de horario
const verificarConflictoHorario = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, excluir_turno } = req.body;

    try {
        const medico = await UsuarioModel.verificarMedico(req.user.id_usuario);
        
        if (!medico || !medico.es_medico) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const resultado = await TurnoModel.verificarConflictoHorario(
            medico.id_medico,
            fecha,
            hora_inicio,
            hora_fin,
            excluir_turno
        );
        
        res.json({ 
            hay_conflicto: resultado.conflicto > 0 
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
    verificarConflictoHorario,
    modificarHorarioTurno
};