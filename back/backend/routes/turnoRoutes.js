//routes/turnoRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    crearTurno, 
    listarTurnos, 
    getMisTurnos, 
    listarTurnosFiltrados, 
    cancelarTurno,
    actualizarTurno,
    obtenerTurnoPorId,
    verificarConflictoHorario,
    modificarHorarioTurno
} = require('../controllers/turnoController');
const { 
    inscribirseTurno, 
    getMisInscripciones, 
    cancelarInscripcion 
} = require('../controllers/inscripcionController');

// ============================================
// RUTAS PÚBLICAS
// ============================================
router.get('/', listarTurnos);
router.get('/filtrar', listarTurnosFiltrados);

// ============================================
// RUTAS PROTEGIDAS (requieren token)
// ============================================
router.use(protect);

//  Las rutas específicas van ANTES que las rutas con parámetros
router.get('/mis-turnos', getMisTurnos);
router.get('/mis-inscripciones', getMisInscripciones); 

router.post('/verificar-conflicto', verificarConflictoHorario);
router.post('/', crearTurno);
router.post('/:id/inscribirse', inscribirseTurno);

router.delete('/inscripciones/:id', cancelarInscripcion);
router.delete('/:id', cancelarTurno);

router.put('/:id', actualizarTurno);
router.patch('/:id/horario', modificarHorarioTurno);


router.get('/:id', obtenerTurnoPorId);

module.exports = router;