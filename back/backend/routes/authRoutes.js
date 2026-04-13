const express = require('express');
const router = express.Router();
const { 
    registerUsuario,
    registerMedico,
    registerPaciente,
    loginUser,
} = require('../controllers/authController');

// Rutas de autenticación y registro
router.post('/registerUsuario', registerUsuario);
router.post('/registerPaciente', registerPaciente);
router.post('/registerMedico', registerMedico);
router.post('/login', loginUser);

module.exports = router;