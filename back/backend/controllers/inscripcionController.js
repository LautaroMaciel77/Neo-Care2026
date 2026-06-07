// controllers/inscripcionController.js


const InscripcionModel = require('../models/InscripcionModel');
const CommandInvoker = require('../commands/invoker/CommandInvoker');
const InscribirseCommand = require('../commands/turno/InscribirseCommand');
const CancelarInscripcionCommand = require('../commands/turno/CancelarInscripcionCommand');

const inscribirseTurno = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ 
                message: 'Debe indicar un turno para inscribirse.' 
            });
        }

        const command = new InscribirseCommand(req.user.id_usuario, id);
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);

        res.status(201).json({ 
            message: resultado.mensaje,
            id_inscripcion: resultado.id_inscripcion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



const getMisInscripciones = async (req, res) => {
    try {
        console.log('📌 getMisInscripciones - Usuario:', req.user.id_usuario);
        
        const inscripciones = await InscripcionModel.obtenerInscripcionesDeUsuario(
            req.user.id_usuario
        );
        
        console.log('📌 Inscripciones a enviar:', inscripciones.length);
        res.status(200).json(inscripciones);
        
    } catch (error) {
        console.error('❌ Error en getMisInscripciones:', error);
        res.status(500).json({ message: error.message });
    }
};





const cancelarInscripcion = async (req, res) => {
    const { id } = req.params;  

    try {
        const command = new CancelarInscripcionCommand(req.user.id_usuario, id);
        const resultado = await CommandInvoker.ejecutar(req.user.id_usuario, command);
        res.status(200).json({ message: resultado.message });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('no encontrado') ? 404 : 403;
        res.status(status).json({ message: error.message });
    }
};

module.exports = { 
    inscribirseTurno, 
    getMisInscripciones, 
    cancelarInscripcion 
};