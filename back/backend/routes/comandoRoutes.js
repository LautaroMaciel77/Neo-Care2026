// routes/comandoRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getEstadoHistorial,
    deshacer,
    rehacer,
    getHistorial,
    limpiarHistorial
} = require('../controllers/comandoController');


router.use(protect);

// Rutas de comandos
router.get('/estado', getEstadoHistorial);
router.post('/deshacer', deshacer);
router.post('/rehacer', rehacer);
router.get('/historial', getHistorial);
router.delete('/historial', limpiarHistorial);

module.exports = router;