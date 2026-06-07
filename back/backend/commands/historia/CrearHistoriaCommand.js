// commands/turno/CrearHistoriaCommand.js

const Command = require('../base/Command');
const UsuarioModel = require('../../models/UsuarioModel');
const HistoriaModel = require('../../models/HistoriaModel');

class CrearHistoriaCommand extends Command {
    constructor(id_usuario, id_inscripcion, historiaData) {
        super();
        this.id_usuario = id_usuario;
        this.id_inscripcion = id_inscripcion;
        this.historiaData = historiaData;
        this.id_historia_creada = null;
    }
    
    async execute() {
        try {
            // Verificar que es médico
            const medico = await UsuarioModel.verificarMedico(this.id_usuario);
            
            if (!medico || !medico.es_medico) {
                throw new Error('Solo los médicos pueden registrar atenciones médicas');
            }
            
            // Validar campos
            if (!this.id_inscripcion) {
                throw new Error('El ID de inscripción es obligatorio');
            }
            
            // Registrar atención médica
            const result = await HistoriaModel.registrarAtencion({
                id_inscripcion: this.id_inscripcion,
                ...this.historiaData
            });
            
            this.id_historia_creada = result.id_historia_medica;
            this.result = result;
            
            return {
                id_historia_medica: result.id_historia_medica,
                message: 'Atención médica registrada exitosamente'
            };
            
        } catch (error) {
            this.error = error;
            throw error;
        }
    }
    
    async undo() {
        if (!this.id_historia_creada) {
            throw new Error('No se puede deshacer: no hay historia creada');
        }
        
        try {
            await HistoriaModel.eliminar(this.id_historia_creada);
            this.executed = false;
            return { message: 'Historia médica eliminada (undo)' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CrearHistoriaCommand;