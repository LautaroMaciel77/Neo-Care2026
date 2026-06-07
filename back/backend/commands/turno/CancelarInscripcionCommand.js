// commands/turno/CancelarInscripcionCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');
const InscripcionModel = require('../../models/InscripcionModel');

class CancelarInscripcionCommand extends Command {
    constructor(id_usuario, id_inscripcion) {
        super();
        this.id_usuario = id_usuario;
        this.id_inscripcion = id_inscripcion;
        this.id_paciente = null;
        this.id_turno = null;
        this.inscripcionOriginal = null;
        this.turnoOriginal = null;
    }
    
    async execute() {
        try {
            // VALIDACIÓN 1: Verificar que el usuario es paciente
            const paciente = await UsuarioModel.verificarPaciente(this.id_usuario);
            
            if (!paciente || !paciente.es_paciente) {
                throw new Error('No autorizado. Solo los pacientes pueden cancelar inscripciones');
            }
            
            this.id_paciente = paciente.id_paciente;
            
            // VALIDACIÓN 2: Verificar que la inscripción existe y pertenece al paciente
            const pertenece = await InscripcionModel.verificarPropiedad(
                this.id_inscripcion, 
                this.id_paciente
            );
            
            if (!pertenece) {
                throw new Error('Esta inscripción no te pertenece');
            }
            
            // Obtener datos de la inscripción para poder deshacer
            const inscripciones = await InscripcionModel.listarPorPaciente(this.id_paciente);
            const inscripcion = inscripciones.find(i => i.id_inscripcion == this.id_inscripcion);
            
            if (!inscripcion) {
                throw new Error('Inscripción no encontrada');
            }
            
            // Guardar información original para undo
            this.id_turno = inscripcion.id_turno;
            this.inscripcionOriginal = {
                id_inscripcion: inscripcion.id_inscripcion,
                id_turno: inscripcion.id_turno,
                fecha_inscripcion: inscripcion.fecha_inscripcion
            };
            
            // Guardar estado original del turno
            const turno = await TurnoModel.obtenerTurnoPorId(this.id_turno);
            this.turnoOriginal = {
                id_turno: turno.id_turno,
                estado: turno.estado,
                id_medico: turno.id_medico
            };
            
            // Cancelar la inscripción (esto libera el turno a 'disponible')
            await InscripcionModel.cancelarInscripcionDB(this.id_inscripcion);
            
            this.result = { message: 'Inscripción cancelada exitosamente' };
            return this.result;
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.inscripcionOriginal) {
            throw new Error('No se puede deshacer: no hay información de la inscripción original');
        }
        
        try {
            // Recrear la inscripción (esto vuelve a marcar el turno como 'ocupado')
            const nuevaInscripcion = await InscripcionModel.crearInscripcion(
                this.id_paciente,
                this.id_turno
            );
            
            this.executed = false;
            return { 
                message: 'Inscripción restaurada (undo)', 
                id_inscripcion: nuevaInscripcion.id_inscripcion,
                id_turno: this.id_turno
            };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CancelarInscripcionCommand;