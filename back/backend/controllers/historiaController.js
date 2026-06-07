// controllers/historiaController.js

const CommandInvoker = require('../commands/invoker/CommandInvoker');
const CrearHistoriaCommand = require('../commands/historia/CrearHistoriaCommand');
const HistoriaModel = require('../models/HistoriaModel');
const { sql } = require('../config/db');

// Registrar atención médica (con Command)
const registrarAtencionMedica = async (req, res) => {
    const { id_inscripcion, sintomas, diagnostico, tratamiento, receta, notas, fecha_atencion } = req.body;

    try {
        if (!id_inscripcion) {
            return res.status(400).json({ message: 'El ID de inscripción es obligatorio' });
        }

        const command = new CrearHistoriaCommand(
            req.user.id_usuario,
            id_inscripcion,
            { sintomas, diagnostico, tratamiento, receta, notas, fecha_atencion }
        );
        
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);

        res.status(201).json({
            message: resultado.message,
            id_historia_medica: resultado.id_historia_medica
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al registrar atención médica' });
    }
};


// controllers/historiaController.js
const listarHistoriaPorPaciente = async (req, res) => {
    const { id_paciente } = req.params;

    try {
        // Verificar si es médico (puede ver cualquier historial)
        const medico = await UsuarioModel.verificarMedico(req.user.id_usuario);
        const esMedico = medico?.es_medico || false;
        
        // Si es médico, puede verlo directamente
        if (esMedico) {
            const historial = await HistoriaModel.listarPorPaciente(id_paciente);
            return res.json(historial);
        }
        
        // Si no es médico, verificar que sea el propio paciente
        const paciente = await UsuarioModel.verificarPaciente(req.user.id_usuario);
        const esPropietario = paciente?.id_paciente == id_paciente;
        
        if (!esPropietario) {
            return res.status(403).json({ message: 'No autorizado para ver este historial' });
        }

        const historial = await HistoriaModel.listarPorPaciente(id_paciente);
        res.json(historial);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el historial médico' });
    }
};

// Obtener detalles de una historia médica específica (no necesita Command)
const obtenerHistoriaMedica = async (req, res) => {
    const { id } = req.params;

    try {
        const historia = await HistoriaModel.obtenerPorId(id);

        if (!historia) {
            return res.status(404).json({ message: 'Historia médica no encontrada' });
        }

        res.json(historia);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la historia médica' });
    }

};

const obtenerHistoriaPorInscripcion = async (req, res) => {
    const { id_inscripcion } = req.params;

    try {
        const historia = await HistoriaModel.obtenerPorInscripcion(id_inscripcion);

        if (!historia) {
            return res.status(404).json({ message: 'No se encontró historia médica para esta inscripción' });
        }

        res.json(historia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la historia médica' });
    }
};
module.exports = {
    registrarAtencionMedica,
    listarHistoriaPorPaciente,
    obtenerHistoriaMedica,
    obtenerHistoriaPorInscripcion
};