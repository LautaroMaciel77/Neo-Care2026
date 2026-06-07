// routes/historiaRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    registrarAtencionMedica,
    listarHistoriaPorPaciente,
    obtenerHistoriaMedica,
    obtenerHistoriaPorInscripcion  
} = require('../controllers/historiaController');

router.use(protect);

router.post('/', registrarAtencionMedica);
router.get('/paciente/:id_paciente', listarHistoriaPorPaciente);
router.get('/inscripcion/:id_inscripcion', obtenerHistoriaPorInscripcion); 
router.get('/:id', obtenerHistoriaMedica);

module.exports = router;