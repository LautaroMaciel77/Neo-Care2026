// commands/turno/CrearHistoriaCommand.js

const Command = require('../base/Command');
const { sql } = require('../../config/db');

class CrearHistoriaCommand extends Command {
    constructor(id_medico, id_inscripcion, historiaData) {
        super();
        this.id_medico = id_medico;
        this.id_inscripcion = id_inscripcion;
        this.historiaData = historiaData;
        this.id_historia_creada = null;
    }
    
    async execute() {
        try {
            const { sintomas, diagnostico, tratamiento, receta, notas } = this.historiaData;
            
            // Validar campos obligatorios
            if (!diagnostico) {
                throw new Error('El diagnóstico es obligatorio');
            }
            
            // Usar el SP existente sp_RegistrarAtencionMedica
            const result = await sql.query`
                EXEC sp_RegistrarAtencionMedica
                    @id_inscripcion = ${this.id_inscripcion},
                    @sintomas = ${sintomas || null},
                    @diagnostico = ${diagnostico},
                    @tratamiento = ${tratamiento || null},
                    @receta = ${receta || null},
                    @notas = ${notas || null},
                    @fecha_atencion = GETDATE()
            `;
            
            this.id_historia_creada = result.recordset[0].id_historia_medica;
            this.result = {
                id_historia_medica: this.id_historia_creada,
                message: 'Historia médica creada exitosamente'
            };
            
            return this.result;
            
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
            // Usar el SP sp_EliminarHistoriaMedica
            await sql.query`
                EXEC sp_EliminarHistoriaMedica @id_historia_medica = ${this.id_historia_creada}
            `;
            
            this.executed = false;
            return { message: 'Historia médica eliminada (undo)' };
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CrearHistoriaCommand;