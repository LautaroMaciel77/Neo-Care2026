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
    verificarConflictoHorario
} = require('../controllers/turnoController');

// Listar turnos disponibles - Público
router.get('/', listarTurnos);

// Listar turnos filtrados - Público (con parámetros de consulta)
router.get('/filtrar', listarTurnosFiltrados);

// Obtener mis turnos - Solo médicos
router.get('/mis-turnos', protect, getMisTurnos);

// Verificar conflicto de horario - Solo médicos
router.post('/verificar-conflicto', protect, verificarConflictoHorario);

// Crear turno - Solo médicos logueados
router.post('/', protect, crearTurno);

// Obtener turno por ID - Público
router.get('/:id', obtenerTurnoPorId);

// Actualizar turno - Solo médicos (dueños del turno)
router.put('/:id', protect, actualizarTurno);

// Cancelar turno - Solo médicos (dueños del turno)
router.delete('/:id', protect, cancelarTurno);

module.exports = router;