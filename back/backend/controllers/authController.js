const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');


// Registrar usuario general (crea usuario base)
const registerUsuario = async (req, res) => {
    const { nombre, email, password, telefono } = req.body;

    try {
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Completar todos los campos obligatorios (nombre, email, password)' });
        }

        // Verificar si el email ya existe
        const userExists = await sql.query`
            SELECT id_usuario FROM usuario WHERE email = ${email}
        `;

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const result = await sql.query`
            INSERT INTO usuario (nombre, email, password, telefono) 
            OUTPUT INSERTED.id_usuario
            VALUES (${nombre}, ${email}, ${hashedPassword}, ${telefono || null})
        `;

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            id_usuario: result.recordset[0].id_usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Registrar médico (profesional)
const registerMedico = async (req, res) => {
    const { id_usuario, especialidad } = req.body;

    try {
        if (!id_usuario || !especialidad) {
            return res.status(400).json({ message: 'Completar todos los campos obligatorios (id_usuario, especialidad)' });
        }

        // Verificar si el usuario existe
        const userExists = await sql.query`
            SELECT id_usuario FROM usuario WHERE id_usuario = ${id_usuario}
        `;

        if (userExists.recordset.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Verificar si ya es médico
        const medicoExists = await sql.query`
            SELECT id_medico FROM medico WHERE id_usuario = ${id_usuario}
        `;

        if (medicoExists.recordset.length > 0) {
            return res.status(400).json({ message: 'El usuario ya está registrado como médico' });
        }

        // Insertar médico
        const result = await sql.query`
            INSERT INTO medico (especialidad, id_usuario) 
            OUTPUT INSERTED.id_medico
            VALUES (${especialidad}, ${id_usuario})
        `;

        res.status(201).json({
            message: 'Médico registrado exitosamente',
            id_medico: result.recordset[0].id_medico
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Registrar paciente
const registerPaciente = async (req, res) => {
    const { id_usuario, edad, alergias } = req.body;

    try {
        if (!id_usuario || !edad) {
            return res.status(400).json({ message: 'Completar los campos obligatorios (id_usuario, edad)' });
        }

        // Verificar si el usuario existe
        const userExists = await sql.query`
            SELECT id_usuario FROM usuario WHERE id_usuario = ${id_usuario}
        `;

        if (userExists.recordset.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Verificar si ya es paciente
        const pacienteExists = await sql.query`
            SELECT id_paciente FROM paciente WHERE id_usuario = ${id_usuario}
        `;

        if (pacienteExists.recordset.length > 0) {
            return res.status(400).json({ message: 'El usuario ya está registrado como paciente' });
        }

        // Insertar paciente
        const result = await sql.query`
            INSERT INTO paciente (edad, alergias, id_usuario) 
            OUTPUT INSERTED.id_paciente
            VALUES (${edad}, ${alergias || null}, ${id_usuario})
        `;

        res.status(201).json({
            message: 'Paciente registrado exitosamente',
            id_paciente: result.recordset[0].id_paciente
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Login de usuario
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Completar todos los campos' });
        }

        // Buscar usuario por email
        const users = await sql.query`
            SELECT * FROM usuario WHERE email = ${email}
        `;

        if (users.recordset.length === 0) {
            return res.status(400).json({ message: 'El usuario no existe' });
        }

        const user = users.recordset[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Verificar si es médico o paciente
        const medico = await sql.query`
            SELECT id_medico, especialidad FROM medico WHERE id_usuario = ${user.id_usuario}
        `;

        const paciente = await sql.query`
            SELECT id_paciente, edad, alergias FROM paciente WHERE id_usuario = ${user.id_usuario}
        `;

        let rol = null;
        let id_rol = null;

        if (medico.recordset.length > 0) {
            rol = 'medico';
            id_rol = medico.recordset[0].id_medico;
        } else if (paciente.recordset.length > 0) {
            rol = 'paciente';
            id_rol = paciente.recordset[0].id_paciente;
        }

        res.json({
            message: 'Login exitoso',
            token: generateToken(user.id_usuario),
            usuario: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                rol: rol,
                id_rol: id_rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    registerUsuario,
    registerMedico,
    registerPaciente,
    loginUser,
};