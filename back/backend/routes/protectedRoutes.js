// /backend/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Ruta protegida de prueba
router.get('/profile', protect, (req, res) => {
    res.json({
        message: 'Acceso permitido',
        user: req.user,
    });
});

module.exports = router;