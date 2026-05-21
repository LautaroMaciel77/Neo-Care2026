// controllers/inscripcionController.js

const InscripcionModel = require('../models/InscripcionModel');

const inscribirseTurno = async (req, res) => {
    // ✅ El id_turno viene de req.params, no de req.body
    const { id } = req.params;  // o const id_turno = req.params.id

    try {
        if (!id) {
            return res.status(400).json({ 
                message: 'Debe indicar un turno para inscribirse.' 
            });
        }

        const resultado = await InscripcionModel.inscribir(
            req.user.id_usuario, 
            id  // ← aquí va el id_turno desde params
        );

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
        const resultado = await InscripcionModel.cancelar(id, req.user.id_usuario);
        res.status(200).json({ message: resultado.mensaje });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    inscribirseTurno, 
    getMisInscripciones, 
    cancelarInscripcion 
};