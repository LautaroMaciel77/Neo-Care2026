// commands/turno/CrearTurnoCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const TurnoModel = require('../../models/TurnoModel');

class CrearTurnoCommand extends Command {
    constructor(id_usuario, turnoData) {
        super();
        this.id_usuario = id_usuario;
        this.turnoData = turnoData;
        this.id_medico = null;
        this.id_turno_creado = null;
    }
    
    async execute() {
        try {
            // Validar que el usuario es médico
            const medico = await UsuarioModel.verificarMedico(this.id_usuario);
            
            if (!medico || !medico.es_medico) {
                throw new Error('Solo los médicos pueden crear turnos');
            }
            
            this.id_medico = medico.id_medico;
            
            // Validar campos obligatorios
            const { fecha, hora_inicio, hora_fin } = this.turnoData;
            if (!fecha || !hora_inicio || !hora_fin) {
                throw new Error('La fecha, hora de inicio y hora de fin son obligatorias');
            }
            
            // Crear el turno
            const nuevoTurno = await TurnoModel.crearTurno({
                ...this.turnoData,
                estado: this.turnoData.estado || 'disponible',
                id_medico: this.id_medico
            });
            
            this.id_turno_creado = nuevoTurno.id_turno;
            this.result = nuevoTurno;
            
            return nuevoTurno;
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.id_turno_creado || !this.id_medico) {
            throw new Error('No se puede deshacer: no hay turno creado');
        }
        
        try {
            const resultado = await TurnoModel.cancelarTurno(this.id_turno_creado, this.id_medico);
            this.executed = false;
            return { message: 'Turno eliminado (undo)', id_turno: this.id_turno_creado };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CrearTurnoCommand;