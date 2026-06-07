// controllers/comandoController.js

const CommandInvoker = require('../commands/invoker/CommandInvoker');

const getEstadoHistorial = async (req, res) => {
    try {
        res.json({
            canUndo: CommandInvoker.canUndo(req.user.id_usuario),
            canRedo: CommandInvoker.canRedo(req.user.id_usuario),
            historySize: CommandInvoker.getHistoryInfo(req.user.id_usuario).length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const deshacer = async (req, res) => {
    try {
        const resultado = await CommandInvoker.deshacer(req.user.id_usuario);
        res.json({ 
            message: resultado?.message || 'Acción deshecha exitosamente',
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: error.message || 'No se pudo deshacer la acción',
            success: false
        });
    }
};

const rehacer = async (req, res) => {
    try {
        const resultado = await CommandInvoker.rehacer(req.user.id_usuario);
        res.json({ 
            message: resultado?.message || 'Acción rehecha exitosamente',
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: error.message || 'No se pudo rehacer la acción',
            success: false
        });
    }
};

const getHistorial = async (req, res) => {
    try {
        const historial = CommandInvoker.getHistoryInfo(req.user.id_usuario);
        res.json({
            total: historial.length,
            historial: historial
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const limpiarHistorial = async (req, res) => {
    try {
        CommandInvoker.clearHistory(req.user.id_usuario);
        res.json({ message: 'Historial limpiado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEstadoHistorial,
    deshacer,
    rehacer,
    getHistorial,
    limpiarHistorial
};