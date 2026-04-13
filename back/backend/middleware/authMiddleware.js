const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const result = await sql.query`SELECT * FROM usuario WHERE id_usuario = ${decoded.id}`;

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            req.user = result.recordset[0];

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token inválido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, token no encontrado' });
    }
};

module.exports = { protect };