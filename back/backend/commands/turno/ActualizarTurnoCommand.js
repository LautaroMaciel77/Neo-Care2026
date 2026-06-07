// commands/turno/ActualizarTurnoCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');

class ActualizarTurnoCommand extends Command {
    constructor(id_usuario, id_turno, nuevosDatos) {
        super();
        this.id_usuario = id_usuario;
        this.id_turno = id_turno;
        this.nuevosDatos = nuevosDatos;
        this.id_medico = null;
        this.datosOriginales = null;  // Guardar estado original para undo
    }
    
    async execute() {
        try {
            // VALIDACIÓN 1: Verificar que es médico
            const medico = await UsuarioModel.verificarMedico(this.id_usuario);
            
            if (!medico || !medico.es_medico) {
                throw new Error('No autorizado. Solo los médicos pueden actualizar turnos');
            }
            
            this.id_medico = medico.id_medico;
            
            // VALIDACIÓN 2: Verificar que el turno existe y pertenece al médico
            const turnoActual = await TurnoModel.obtenerTurnoPorId(this.id_turno);
            
            if (!turnoActual) {
                throw new Error('Turno no encontrado');
            }
            
            // Guardar datos originales para poder deshacer
            this.datosOriginales = {
                fecha: turnoActual.fecha,
                hora_inicio: turnoActual.hora_inicio,
                hora_fin: turnoActual.hora_fin,
                estado: turnoActual.estado
            };
            
            // VALIDACIÓN 3: Si cambia el horario, verificar conflicto
            const { fecha, hora_inicio, hora_fin } = this.nuevosDatos;
            if (fecha && hora_inicio && hora_fin) {
                const conflicto = await TurnoModel.verificarConflictoHorario(
                    this.id_medico,
                    fecha,
                    hora_inicio,
                    hora_fin,
                    this.id_turno  
                );
                
                if (conflicto.conflicto > 0) {
                    throw new Error('Ya existe otro turno en ese horario');
                }
            }
            
            // Actualizar el turno
            const resultado = await TurnoModel.actualizarTurno(
                this.id_turno,
                this.id_medico,
                this.nuevosDatos
            );
            
            this.result = resultado;
            return resultado;
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.datosOriginales) {
            throw new Error('No se puede deshacer: no hay datos originales');
        }
        
        try {
            // Restaurar el turno a su estado original
            const resultado = await TurnoModel.actualizarTurno(
                this.id_turno,
                this.id_medico,
                this.datosOriginales
            );
            
            this.executed = false;
            return { message: 'Turno restaurado a estado original (undo)', id_turno: this.id_turno };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ActualizarTurnoCommand;