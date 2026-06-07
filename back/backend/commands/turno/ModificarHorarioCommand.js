// commands/turno/ModificarHorarioCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');

class ModificarHorarioCommand extends Command {
    constructor(id_usuario, id_turno, nuevoHorario) {
        super();
        this.id_usuario = id_usuario;
        this.id_turno = id_turno;
        this.nuevoHorario = nuevoHorario;  // { fecha, hora_inicio, hora_fin }
        this.id_medico = null;
        this.horarioOriginal = null;
        this.tienePaciente = false;
        this.datosPaciente = null;
    }
    
    async execute() {
        try {
            const { fecha, hora_inicio, hora_fin } = this.nuevoHorario;
            
            // VALIDACIÓN 1: Campos obligatorios
            if (!fecha || !hora_inicio || !hora_fin) {
                throw new Error('La nueva fecha, hora inicio y hora fin son obligatorias');
            }
            
            // VALIDACIÓN 2: Hora inicio debe ser menor que hora fin
            if (hora_inicio >= hora_fin) {
                throw new Error('La hora de inicio debe ser menor que la hora de fin');
            }
            
            // VALIDACIÓN 3: Verificar que es médico
            const medico = await UsuarioModel.verificarMedico(this.id_usuario);
            
            if (!medico || !medico.es_medico) {
                throw new Error('No autorizado. Solo los médicos pueden modificar horarios');
            }
            
            this.id_medico = medico.id_medico;
            
            // VALIDACIÓN 4: Verificar que el turno existe y pertenece al médico
            const turnoActual = await TurnoModel.obtenerTurnoPorId(this.id_turno);
            
            if (!turnoActual) {
                throw new Error('Turno no encontrado');
            }
            
            // Guardar horario original para poder deshacer
            this.horarioOriginal = {
                fecha: turnoActual.fecha,
                hora_inicio: turnoActual.hora_inicio,
                hora_fin: turnoActual.hora_fin
            };
            
            // Verificar si tiene paciente asignado
            if (turnoActual.paciente_nombre) {
                this.tienePaciente = true;
                this.datosPaciente = {
                    nombre: turnoActual.paciente_nombre,
                    email: turnoActual.paciente_email
                };
            }
            
            // VALIDACIÓN 5: Verificar conflicto de horario 
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
            
            // Modificar el horario
            const resultado = await TurnoModel.modificarHorarioTurno(
                this.id_turno,
                this.id_medico,
                fecha,
                hora_inicio,
                hora_fin
            );
            
            this.result = resultado;
            
            // Devolver información adicional si tiene paciente
            if (this.tienePaciente) {
                return {
                    message: `Horario modificado. El paciente ${this.datosPaciente.nombre} será notificado del cambio.`,
                    warning: true,
                    paciente: this.datosPaciente
                };
            }
            
            return resultado;
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.horarioOriginal) {
            throw new Error('No se puede deshacer: no hay horario original');
        }
        
        try {
            // Restaurar horario original
            const resultado = await TurnoModel.modificarHorarioTurno(
                this.id_turno,
                this.id_medico,
                this.horarioOriginal.fecha,
                this.horarioOriginal.hora_inicio,
                this.horarioOriginal.hora_fin
            );
            
            this.executed = false;
            return { message: 'Horario restaurado a su estado original (undo)', id_turno: this.id_turno };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ModificarHorarioCommand;