// tests/controllers/turnoController.test.js
const {
    crearTurno,
    listarTurnos,
    getMisTurnos,
    listarTurnosFiltrados,
    cancelarTurno,
    actualizarTurno,
    modificarHorarioTurno,
    obtenerTurnoPorId,
    verificarConflictoHorario
} = require('../../controllers/turnoController');

const TurnoModel = require('../../models/TurnoModel');
const UsuarioModel = require('../../models/UsuarioModel');
const CommandInvoker = require('../../commands/invoker/CommandInvoker');
const CrearTurnoCommand = require('../../commands/turno/CrearTurnoCommand');
const CancelarTurnoCommand = require('../../commands/turno/CancelarTurnoCommand');
const ActualizarTurnoCommand = require('../../commands/turno/ActualizarTurnoCommand');
const ModificarHorarioCommand = require('../../commands/turno/ModificarHorarioCommand');

// Mockear todas las dependencias
jest.mock('../../models/TurnoModel');
jest.mock('../../models/UsuarioModel');
jest.mock('../../commands/invoker/CommandInvoker');
jest.mock('../../commands/turno/CrearTurnoCommand');
jest.mock('../../commands/turno/CancelarTurnoCommand');
jest.mock('../../commands/turno/ActualizarTurnoCommand');
jest.mock('../../commands/turno/ModificarHorarioCommand');

// Mock para console.error (opcional, para silenciar logs)
console.error = jest.fn();

describe('Turno Controller - Pruebas Unitarias', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            user: { id_usuario: 1 },
            params: {},
            body: {},
            query: {}
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

   
    // ==================== listarTurnos ====================
    describe('listarTurnos', () => {
        test('Debe listar todos los turnos disponibles - resultado 200', async () => {
            const mockTurnos = [
                { id_turno: 1, fecha: '2025-06-15', estado: 'disponible' },
                { id_turno: 2, fecha: '2025-06-16', estado: 'disponible' }
            ];
            TurnoModel.listarTurnosDisponibles.mockResolvedValue(mockTurnos);
            
            await listarTurnos(req, res);
            
            expect(TurnoModel.listarTurnosDisponibles).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockTurnos);
        });

        test('Debe retornar 500 si hay error en la BD', async () => {
            TurnoModel.listarTurnosDisponibles.mockRejectedValue(new Error('Error de conexión'));
            
            await listarTurnos(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener los turnos' });
        });
    });

    // ==================== getMisTurnos ====================
    describe('getMisTurnos', () => {
        test('Debe listar turnos del médico autenticado - resultado 200', async () => {
            const mockMedico = { id_medico: 10, es_medico: true };
            UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
            
            const mockTurnos = [
                { id_turno: 1, fecha: '2025-06-15' },
                { id_turno: 2, fecha: '2025-06-16' }
            ];
            TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
            
            await getMisTurnos(req, res);
            
            expect(UsuarioModel.verificarMedico).toHaveBeenCalledWith(1);
            expect(TurnoModel.listarTurnosPorMedico).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTurnos);
        });

        test('Debe retornar 403 si el usuario no es médico', async () => {
            UsuarioModel.verificarMedico.mockResolvedValue(null);
            
            await getMisTurnos(req, res);
            
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado' });
            expect(TurnoModel.listarTurnosPorMedico).not.toHaveBeenCalled();
        });

        test('Debe retornar 500 si hay error', async () => {
            UsuarioModel.verificarMedico.mockRejectedValue(new Error('Error'));
            
            await getMisTurnos(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener los turnos' });
        });
    });

    // ==================== listarTurnosFiltrados ====================
    describe('listarTurnosFiltrados', () => {
        test('Debe listar turnos con filtros - resultado 200', async () => {
            req.query = {
                especialidad: 'Cardiología',
                fecha: '2025-06-15',
                estado: 'disponible',
                id_localidad: '5'
            };
            
            const mockTurnos = [{ id_turno: 1 }, { id_turno: 2 }];
            TurnoModel.listarTurnosFiltrados.mockResolvedValue(mockTurnos);
            
            await listarTurnosFiltrados(req, res);
            
            expect(TurnoModel.listarTurnosFiltrados).toHaveBeenCalledWith({
                especialidad: 'Cardiología',
                fecha: '2025-06-15',
                estado: 'disponible',
                id_localidad: '5'
            });
            expect(res.json).toHaveBeenCalledWith(mockTurnos);
        });

        test('Debe aceptar filtros vacíos', async () => {
            req.query = {};
            TurnoModel.listarTurnosFiltrados.mockResolvedValue([]);
            
            await listarTurnosFiltrados(req, res);
            
            expect(TurnoModel.listarTurnosFiltrados).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('Debe retornar 500 si hay error', async () => {
            TurnoModel.listarTurnosFiltrados.mockRejectedValue(new Error('Error'));
            
            await listarTurnosFiltrados(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener los turnos filtrados' });
        });
    });

    // ==================== cancelarTurno ====================
    describe('cancelarTurno', () => {
        test('Debe cancelar turno exitosamente - resultado 200', async () => {
            req.params.id = '123';
            const mockResultado = { Mensaje: 'Turno cancelado con éxito' };
            const mockCommandInstance = { mock: true };
            
            CancelarTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await cancelarTurno(req, res);
            
            expect(CancelarTurnoCommand).toHaveBeenCalledWith(1, '123');
            expect(CommandInvoker.ejecutar).toHaveBeenCalledWith(1, mockCommandInstance);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno cancelado con éxito' });
        });

        test('Debe usar mensaje por defecto si resultado no tiene Mensaje', async () => {
            req.params.id = '123';
            CancelarTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({});
            
            await cancelarTurno(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno cancelado exitosamente' });
        });

        test('Debe retornar 404 si el turno no existe', async () => {
            req.params.id = '999';
            const error = new Error('Turno no encontrado');
            CancelarTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await cancelarTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno no encontrado' });
        });

        test('Debe retornar 500 para otros errores', async () => {
            req.params.id = '123';
            const error = new Error('Error inesperado');
            CancelarTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await cancelarTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error inesperado' });
        });
    });

    // ==================== actualizarTurno ====================
    describe('actualizarTurno', () => {
        test('Debe actualizar turno exitosamente - resultado 200', async () => {
            req.params.id = '123';
            req.body = {
                fecha: '2025-06-20',
                hora_inicio: '14:00',
                hora_fin: '15:00',
                estado: 'ocupado'
            };
            
            const mockResultado = { Mensaje: 'Turno actualizado' };
            const mockCommandInstance = { mock: true };
            ActualizarTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await actualizarTurno(req, res);
            
            expect(ActualizarTurnoCommand).toHaveBeenCalledWith(1, '123', {
                fecha: '2025-06-20',
                hora_inicio: '14:00',
                hora_fin: '15:00',
                estado: 'ocupado'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno actualizado' });
        });

        test('Debe usar mensaje por defecto si no hay Mensaje en resultado', async () => {
            req.params.id = '123';
            req.body = {};
            ActualizarTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({});
            
            await actualizarTurno(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno actualizado exitosamente' });
        });

        test('Debe retornar 500 si hay error', async () => {
            req.params.id = '123';
            req.body = {};
            ActualizarTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(new Error('Error al actualizar'));
            
            await actualizarTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al actualizar' });
        });
    });

    // ==================== modificarHorarioTurno ====================
    describe('modificarHorarioTurno', () => {
        test('Debe modificar horario exitosamente sin warning - resultado 200', async () => {
            req.params.id = '123';
            req.body = {
                fecha: '2025-06-25',
                hora_inicio: '16:00',
                hora_fin: '17:00'
            };
            
            const mockResultado = { Mensaje: 'Horario modificado exitosamente' };
            const mockCommandInstance = { mock: true };
            ModificarHorarioCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await modificarHorarioTurno(req, res);
            
            expect(ModificarHorarioCommand).toHaveBeenCalledWith(1, '123', {
                fecha: '2025-06-25',
                hora_inicio: '16:00',
                hora_fin: '17:00'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Horario modificado exitosamente' });
        });

        test('Debe retornar 200 con warning si el turno tiene paciente', async () => {
            req.params.id = '123';
            req.body = {
                fecha: '2025-06-25',
                hora_inicio: '16:00',
                hora_fin: '17:00'
            };
            
            const mockResultado = {
                message: 'Horario modificado. El paciente Juan será notificado',
                warning: true,
                paciente: { nombre: 'Juan', email: 'juan@mail.com' }
            };
            ModificarHorarioCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await modificarHorarioTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResultado);
        });

        test('Debe retornar 400 si falta algún campo', async () => {
            req.params.id = '123';
            req.body = { fecha: '2025-06-25', hora_inicio: '16:00' };
            
            await modificarHorarioTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La nueva fecha, hora inicio y hora fin son obligatorias'
            });
        });

        test('Debe retornar 404 si el turno no pertenece al médico', async () => {
            req.params.id = '123';
            req.body = { fecha: '2025-06-25', hora_inicio: '16:00', hora_fin: '17:00' };
            
            const error = new Error('El turno no te pertenece');
            ModificarHorarioCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await modificarHorarioTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'El turno no te pertenece' });
        });

        test('Debe retornar 409 si hay conflicto de horario', async () => {
            req.params.id = '123';
            req.body = { fecha: '2025-06-25', hora_inicio: '16:00', hora_fin: '17:00' };
            
            const error = new Error('Ya existe otro turno en ese horario');
            ModificarHorarioCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await modificarHorarioTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ya existe otro turno en ese horario' });
        });

        test('Debe retornar 500 para errores no contemplados', async () => {
            req.params.id = '123';
            req.body = { fecha: '2025-06-25', hora_inicio: '16:00', hora_fin: '17:00' };
            
            const error = new Error('Error desconocido');
            ModificarHorarioCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await modificarHorarioTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error desconocido' });
        });
    });

    // ==================== obtenerTurnoPorId ====================
    describe('obtenerTurnoPorId', () => {
        test('Debe obtener turno por ID exitosamente - resultado 200', async () => {
            req.params.id = '123';
            const mockTurno = { id_turno: 123, fecha: '2025-06-15', estado: 'disponible' };
            TurnoModel.obtenerTurnoPorId.mockResolvedValue(mockTurno);
            
            await obtenerTurnoPorId(req, res);
            
            expect(TurnoModel.obtenerTurnoPorId).toHaveBeenCalledWith(123);
            expect(res.json).toHaveBeenCalledWith(mockTurno);
        });

        test('Debe retornar 400 si el ID no es numérico', async () => {
            req.params.id = 'abc';
            
            await obtenerTurnoPorId(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'ID de turno inválido' });
            expect(TurnoModel.obtenerTurnoPorId).not.toHaveBeenCalled();
        });

        test('Debe retornar 404 si el turno no existe', async () => {
            req.params.id = '999';
            TurnoModel.obtenerTurnoPorId.mockResolvedValue(null);
            
            await obtenerTurnoPorId(req, res);
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Turno no encontrado' });
        });

        test('Debe retornar 500 si hay error en BD', async () => {
            req.params.id = '123';
            TurnoModel.obtenerTurnoPorId.mockRejectedValue(new Error('Error BD'));
            
            await obtenerTurnoPorId(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener el turno' });
        });
    });

    // ==================== verificarConflictoHorario ====================
    describe('verificarConflictoHorario', () => {
        test('Debe retornar que NO hay conflicto - resultado false', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                excluir_turno: null
            };
            
            const mockMedico = { id_medico: 10, es_medico: true };
            UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
            TurnoModel.verificarConflictoHorario.mockResolvedValue({ conflicto: 0 });
            
            await verificarConflictoHorario(req, res);
            
            expect(UsuarioModel.verificarMedico).toHaveBeenCalledWith(1);
            expect(TurnoModel.verificarConflictoHorario).toHaveBeenCalledWith(10, '2025-06-15', '09:00', '10:00', null);
            expect(res.json).toHaveBeenCalledWith({ hay_conflicto: false });
        });

        test('Debe retornar que SÍ hay conflicto - resultado true', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                excluir_turno: 5
            };
            
            const mockMedico = { id_medico: 10, es_medico: true };
            UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
            TurnoModel.verificarConflictoHorario.mockResolvedValue({ conflicto: 2 });
            
            await verificarConflictoHorario(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ hay_conflicto: true });
        });

        test('Debe retornar 403 si el usuario no es médico', async () => {
            UsuarioModel.verificarMedico.mockResolvedValue(null);
            
            await verificarConflictoHorario(req, res);
            
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado' });
            expect(TurnoModel.verificarConflictoHorario).not.toHaveBeenCalled();
        });

        test('Debe retornar 500 si hay error', async () => {
            req.body = { fecha: '2025-06-15', hora_inicio: '09:00', hora_fin: '10:00' };
            UsuarioModel.verificarMedico.mockRejectedValue(new Error('Error'));
            
            await verificarConflictoHorario(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al verificar conflicto de horario' });
        });
    });
});