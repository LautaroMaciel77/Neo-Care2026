// commands/InscribirseCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');
const InscripcionModel = require('../../models/InscripcionModel');

class InscribirseCommand extends Command {
    constructor(id_usuario, id_turno) {
        super();
        this.id_usuario = id_usuario;
        this.id_turno = id_turno;
        this.id_paciente = null;
        this.turno_original = null;      // Guardar estado del turno para undo
        this.id_inscripcion_creada = null;
    }
    
    async execute() {
        try {
            // VALIDACIÓN 1: Verificar que el usuario es paciente
            const paciente = await UsuarioModel.verificarPaciente(this.id_usuario);
            
            if (!paciente || !paciente.es_paciente) {
                throw new Error('Solo los pacientes pueden inscribirse a turnos');
            }
            
            this.id_paciente = paciente.id_paciente;
            
            // VALIDACIÓN 2: Verificar que el turno existe y está disponible
            const turno = await TurnoModel.obtenerTurnoPorId(this.id_turno);
            
            if (!turno) {
                throw new Error('El turno no existe');
            }
            
            if (turno.estado !== 'disponible') {
                throw new Error(`El turno no está disponible (estado actual: ${turno.estado})`);
            }
            
            // Guardar estado original del turno para poder deshacer
            this.turno_original = turno;
            
            // VALIDACIÓN 3: Verificar que no esté ya inscrito
        const yaInscripto = await InscripcionModel.verificarExistente(this.id_paciente, this.id_turno);
            if (yaInscripto && yaInscripto.existe) {
            throw new Error(yaInscripto.mensaje || 'Ya estás inscrito en este turno');
            }
            
            
            // Crear la inscripción (esto actualiza el turno a 'ocupado' internamente)
            const nuevaInscripcion = await InscripcionModel.crearInscripcion(
                this.id_paciente, 
                this.id_turno
            );
            
            this.id_inscripcion_creada = nuevaInscripcion.id_inscripcion;
            this.result = nuevaInscripcion;
            
            return {
                id_inscripcion: nuevaInscripcion.id_inscripcion,
                mensaje: nuevaInscripcion.mensaje || 'Inscripción exitosa'
            };
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.id_inscripcion_creada) {
            throw new Error('No se puede deshacer: no hay inscripción creada');
        }
        
        try {
            // Cancelar la inscripción (esto libera el turno a 'disponible')
            await InscripcionModel.cancelarInscripcionDB(this.id_inscripcion_creada);
            
            this.executed = false;
            return { 
                message: 'Inscripción cancelada (undo)', 
                id_inscripcion: this.id_inscripcion_creada,
                id_turno: this.id_turno
            };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = InscribirseCommand;