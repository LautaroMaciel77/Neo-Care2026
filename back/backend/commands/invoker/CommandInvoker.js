// commands/invoker/CommandInvoker.js

class CommandInvoker {
    constructor() {
        // Historial separado por usuario
        this.historialPorUsuario = new Map();
        this.maxHistorySize = 50;
    }
    
    // Obtener el historial del usuario actual
    getHistorialUsuario(id_usuario) {
        if (!this.historialPorUsuario.has(id_usuario)) {
            this.historialPorUsuario.set(id_usuario, {
                history: [],
                undoHistory: []
            });
        }
        return this.historialPorUsuario.get(id_usuario);
    }
    
    // Ejecutar un comando
    async ejecutar(id_usuario, command) {
        const { history } = this.getHistorialUsuario(id_usuario);
        
        try {
            const resultado = await command.execute();
            command.executed = true;
            command.result = resultado;
            command.error = null;
            
            history.push(command);
            
            // Limitar tamaño del historial
            if (history.length > this.maxHistorySize) {
                history.shift();
            }
            
            return resultado;
            
        } catch (error) {
            command.error = error;
            throw error;
        }
    }
    
    // Deshacer última acción
    async deshacer(id_usuario) {
        const { history, undoHistory } = this.getHistorialUsuario(id_usuario);
        
        if (history.length === 0) {
            throw new Error('No hay comandos para deshacer');
        }
        
        const command = history.pop();
        
        if (!command.canUndo()) {
            history.push(command);
            throw new Error(`El comando ${command.constructor.name} no puede ser deshecho`);
        }
        
        try {
            const resultado = await command.undo();
            command.executed = false;
            undoHistory.push(command);
            return resultado;
            
        } catch (error) {
            history.push(command);
            throw error;
        }
    }
    
    // Rehacer última acción
    async rehacer(id_usuario) {
        const { history, undoHistory } = this.getHistorialUsuario(id_usuario);
        
        if (undoHistory.length === 0) {
            throw new Error('No hay comandos para rehacer');
        }
        
        const command = undoHistory.pop();
        
        try {
            const resultado = await command.execute();
            command.executed = true;
            history.push(command);
            return resultado;
            
        } catch (error) {
            undoHistory.push(command);
            throw error;
        }
    }
    
    // Verificar si hay comandos para deshacer
    canUndo(id_usuario) {
        const { history } = this.getHistorialUsuario(id_usuario);
        return history.length > 0;
    }
    
    // Verificar si hay comandos para rehacer
    canRedo(id_usuario) {
        const { undoHistory } = this.getHistorialUsuario(id_usuario);
        return undoHistory.length > 0;
    }
    
    // Obtener información del historial
    getHistoryInfo(id_usuario) {
        const { history } = this.getHistorialUsuario(id_usuario);
        return history.map(cmd => cmd.getInfo());
    }
    
    // Limpiar historial de un usuario
    clearHistory(id_usuario) {
        this.historialPorUsuario.delete(id_usuario);
    }
}

// Exportar la instancia única (Singleton)
const instance = new CommandInvoker();
module.exports = instance;