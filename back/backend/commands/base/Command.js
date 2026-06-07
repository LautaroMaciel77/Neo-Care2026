// commands/base/Command.js

/**
 * Clase base abstracta para todos los comandos
 * @abstract
 */
class Command {
    constructor() {
        // Fecha de creación del comando
        this.timestamp = new Date();
        
        // Indica si el comando ya fue ejecutado
        this.executed = false;
        
        // Resultado de la ejecución (se llena en execute)
        this.result = null;
        
        // Error ocurrido durante la ejecución
        this.error = null;
    }
    
    /**
     * Ejecuta la acción principal del comando
     * @returns {Promise<any>}
     * @throws {Error}
     */
    async execute() {
        throw new Error('Método execute() debe ser implementado por la clase hija');
    }
    
    /**
     * Revierte la acción del comando
     * @returns {Promise<any>}
     * @throws {Error}
     */
    async undo() {
        throw new Error('Método undo() debe ser implementado por la clase hija');
    }
    
    /**
     * Obtiene información del comando para auditoría
     * @returns {Object}
     */
    getInfo() {
        return {
            nombre: this.constructor.name,
            timestamp: this.timestamp,
            ejecutado: this.executed,
            resultado: this.result,
            error: this.error ? this.error.message : null
        };
    }
    
    /**
     * Verifica si el comando puede ser deshecho
     * @returns {boolean}
     */
    canUndo() {
        return this.executed && !this.error;
    }
}

module.exports = Command;