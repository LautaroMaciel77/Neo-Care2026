// models/InscripcionModel.js

const { sql } = require('../config/db');
const TurnoModel = require('./TurnoModel');

class InscripcionModel {
    
    // ============================================
    // MÉTODOS BASE
    // ============================================
    
    static async obtenerPacienteId(id_usuario) {
        const result = await sql.query`
            DECLARE @id_pac INT, @mensaje NVARCHAR(255);
            EXEC sp_ObtenerPacienteId ${id_usuario}, @id_pac OUTPUT, @mensaje OUTPUT;
            SELECT @id_pac AS id_paciente, @mensaje AS mensaje;
        `;
        return result.recordset[0];
    }
    
    static async verificarExistente(id_paciente, id_turno) {
        const result = await sql.query`
            DECLARE @existe BIT, @mensaje NVARCHAR(255);
            EXEC sp_VerificarInscripcionExistente ${id_paciente}, ${id_turno}, @existe OUTPUT, @mensaje OUTPUT;
            SELECT @existe AS existe, @mensaje AS mensaje;
        `;
        return result.recordset[0];
    }
    
    static async crearInscripcion(id_paciente, id_turno) {
        const result = await sql.query`
            DECLARE @id_inscripcion INT, @mensaje NVARCHAR(255);
            EXEC sp_CrearInscripcion ${id_paciente}, ${id_turno}, @id_inscripcion OUTPUT, @mensaje OUTPUT;
            SELECT @id_inscripcion AS id_inscripcion, @mensaje AS mensaje;
        `;
        return result.recordset[0];
    }
    
    // ✅ CORREGIDO: Ahora recibe id_paciente, no id_usuario
    static async listarPorPaciente(id_paciente) {
        console.log('📋 listarPorPaciente - id_paciente:', id_paciente);
        
        const result = await sql.query`
            EXEC sp_GetInscripcionesByPaciente @id_paciente = ${id_paciente}
        `;
        
        console.log('📋 Resultado del SP:', result.recordset);
        return result.recordset;
    }
    
    static async verificarPropiedad(id_inscripcion, id_paciente) {
        const result = await sql.query`
            DECLARE @pertenece BIT, @mensaje NVARCHAR(255);
            EXEC sp_VerificarPropiedadInscripcion ${id_inscripcion}, ${id_paciente}, @pertenece OUTPUT, @mensaje OUTPUT;
            SELECT @pertenece AS pertenece, @mensaje AS mensaje;
        `;
        return result.recordset[0];
    }
    
    static async cancelarInscripcionDB(id_inscripcion) {
        await sql.query`
            EXEC sp_CancelarInscripcion @id_inscripcion = ${id_inscripcion}
        `;
        return true;
    }
    
    // ============================================
    // MÉTODOS FACHADA
    // ============================================
    
    static async inscribir(id_usuario, id_turno) {
        console.log('📝 inscribir - id_usuario:', id_usuario, 'id_turno:', id_turno);
        
        // Paso 1: Validar paciente
        const paciente = await this.obtenerPacienteId(id_usuario);
        console.log('📝 Paciente:', paciente);
        
        if (paciente.mensaje !== 'OK') {
            throw new Error(paciente.mensaje);
        }
        
        // Paso 2: Validar turno disponible
        const turno = await TurnoModel.obtenerTurnoPorId(id_turno);
        console.log('📝 Turno:', turno);
        
        if (!turno) {
            throw new Error('El turno no existe');
        }
        
        if (turno.estado !== 'disponible') {
            throw new Error(`El turno no está disponible (estado actual: ${turno.estado})`);
        }
        
        // Paso 3: Validar duplicado
        const duplicado = await this.verificarExistente(paciente.id_paciente, id_turno);
        console.log('📝 Duplicado:', duplicado);
        
        if (duplicado.existe) {
            throw new Error(duplicado.mensaje);
        }
        
        // Paso 4: Crear inscripción
        const nuevaInscripcion = await this.crearInscripcion(paciente.id_paciente, id_turno);
        console.log('📝 Nueva inscripción:', nuevaInscripcion);
        
        return {
            id_inscripcion: nuevaInscripcion.id_inscripcion,
            mensaje: nuevaInscripcion.mensaje
        };
    }
    
    // ✅ CORREGIDO: Obtiene el id_paciente y luego llama a listarPorPaciente
    static async obtenerInscripcionesDeUsuario(id_usuario) {
        console.log('🔍 obtenerInscripcionesDeUsuario - id_usuario:', id_usuario);
        
        // Primero obtener el id_paciente
        const paciente = await this.obtenerPacienteId(id_usuario);
        console.log('🔍 Paciente encontrado:', paciente);
        
        if (paciente.mensaje !== 'OK') {
            throw new Error(paciente.mensaje);
        }
        
        // Llamar a listarPorPaciente con el id_paciente correcto
        const inscripciones = await this.listarPorPaciente(paciente.id_paciente);
        console.log('🔍 Inscripciones encontradas:', inscripciones.length);
        
        return inscripciones;
    }
    
    static async cancelar(id_inscripcion, id_usuario) {
        console.log('🗑️ cancelar - id_inscripcion:', id_inscripcion, 'id_usuario:', id_usuario);
        
        const paciente = await this.obtenerPacienteId(id_usuario);
        console.log('🗑️ Paciente:', paciente);
        
        if (paciente.mensaje !== 'OK') {
            throw new Error(paciente.mensaje);
        }
        
        const propiedad = await this.verificarPropiedad(id_inscripcion, paciente.id_paciente);
        console.log('🗑️ Propiedad:', propiedad);
        
        if (!propiedad.pertenece) {
            throw new Error(propiedad.mensaje);
        }
        
        await this.cancelarInscripcionDB(id_inscripcion);
        
        return { mensaje: 'Inscripción cancelada exitosamente' };
    }
}

module.exports = InscripcionModel;