// commands/turno/CancelarTurnoCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');

class CancelarTurnoCommand extends Command {
    constructor(id_usuario, id_turno) {
        super();
        this.id_usuario = id_usuario;
        this.id_turno = id_turno;
        this.id_medico = null;
        this.turno_original = null;  // Guardar estado original para poder rehacer
    }
    
    async execute() {
        try {
            // Validar que el usuario es médico
            const medico = await UsuarioModel.verificarMedico(this.id_usuario);
            
            if (!medico || !medico.es_medico) {
                throw new Error('No autorizado. Solo los médicos pueden cancelar turnos');
            }
            
            this.id_medico = medico.id_medico;
            
            // Obtener el turno antes de cancelarlo (para poder rehacer después)
            const turno = await TurnoModel.obtenerTurnoPorId(this.id_turno);
            
            if (!turno) {
                throw new Error('Turno no encontrado');
            }
            
            if (turno.estado === 'cancelado') {
                throw new Error('El turno ya está cancelado');
            }
            
            // Guardar estado original para undo
            this.turno_original = turno;
            
            // Cancelar el turno
            const resultado = await TurnoModel.cancelarTurno(this.id_turno, this.id_medico);
            
            this.result = resultado;
            return resultado;
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.turno_original) {
            throw new Error('No se puede deshacer: no hay información del turno original');
        }
        
        try {
            // Restaurar el turno a su estado original
            const resultado = await TurnoModel.actualizarTurno(
                this.id_turno,
                this.id_medico,
                {
                    fecha: this.turno_original.fecha,
                    hora_inicio: this.turno_original.hora_inicio,
                    hora_fin: this.turno_original.hora_fin,
                    estado: this.turno_original.estado
                }
            );
            
            this.executed = false;
            return { message: 'Turno restaurado (undo)', id_turno: this.id_turno };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CancelarTurnoCommand;