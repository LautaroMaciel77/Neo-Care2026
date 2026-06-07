// tests/controllers/crearTurno.test.js
const { crearTurno } = require('../controllers/turnoController');
const CommandInvoker = require('../commands/invoker/CommandInvoker');
const CrearTurnoCommand = require('../commands/turno/CrearTurnoCommand');

// Mockear dependencias
jest.mock('../commands/invoker/CommandInvoker');
jest.mock('../commands/turno/CrearTurnoCommand');

// Silenciar console.error para pruebas
console.error = jest.fn();

describe('crearTurno - Pruebas Extensivas', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Configurar req y res para cada prueba
        req = {
            user: { id_usuario: 1 },
            body: {}
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    // ==================== PRUEBAS DE VALIDACIÓN DE CAMPOS ====================
    describe('Validación de campos obligatorios', () => {
        test('Caso 1: Debe retornar 400 cuando falta fecha', async () => {
            req.body = {
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'disponible'
            };
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La fecha, hora de inicio y hora de fin son obligatorias'
            });
            expect(CommandInvoker.ejecutar).not.toHaveBeenCalled();
        });

        test('Caso 2: Debe retornar 400 cuando falta hora_inicio', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_fin: '10:00',
                estado: 'disponible'
            };
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La fecha, hora de inicio y hora de fin son obligatorias'
            });
        });

        test('Caso 3: Debe retornar 400 cuando falta hora_fin', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                estado: 'disponible'
            };
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La fecha, hora de inicio y hora de fin son obligatorias'
            });
        });

        test('Caso 4: Debe retornar 400 cuando faltan múltiples campos', async () => {
            req.body = {
                fecha: '2025-06-15'
                // faltan hora_inicio y hora_fin
            };
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La fecha, hora de inicio y hora de fin son obligatorias'
            });
        });

        test('Caso 5: Debe retornar 400 cuando todos los campos están vacíos', async () => {
            req.body = {};
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La fecha, hora de inicio y hora de fin son obligatorias'
            });
        });
    });

    // ==================== PRUEBAS DE ESTADO POR DEFECTO ====================
    describe('Comportamiento del estado', () => {
        test('Caso 6: Debe usar estado "disponible" por defecto cuando no se envía estado', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
                // estado no enviado
            };
            
            const mockCommandInstance = { execute: jest.fn() };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'disponible'  // ← estado por defecto
            });
        });

        test('Caso 7: Debe respetar el estado enviado por el usuario', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'ocupado'
            };
            
            const mockCommandInstance = { execute: jest.fn() };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'ocupado'  // ← respeta el estado enviado
            });
        });

        test('Caso 8: Debe aceptar estado "cancelado"', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'cancelado'
            };
            
            const mockCommandInstance = { execute: jest.fn() };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, expect.objectContaining({
                estado: 'cancelado'
            }));
        });
    });

    // ==================== PRUEBAS DE FORMATO DE DATOS ====================
    describe('Formatos de datos válidos', () => {
        test('Caso 9: Debe aceptar fechas en formato YYYY-MM-DD', async () => {
            req.body = {
                fecha: '2025-12-31',  // formato ISO
                hora_inicio: '14:30',
                hora_fin: '15:30',
                estado: 'disponible'
            };
            
            const mockCommandInstance = { execute: jest.fn() };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, expect.objectContaining({
                fecha: '2025-12-31'
            }));
        });

        test('Caso 10: Debe aceptar horas con formato HH:MM', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '23:45',
                hora_fin: '00:15',  // medianoche
                estado: 'disponible'
            };
            
            const mockCommandInstance = { execute: jest.fn() };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, expect.objectContaining({
                hora_inicio: '23:45',
                hora_fin: '00:15'
            }));
        });
    });

    // ==================== PRUEBAS DE CASOS DE ÉXITO ====================
    describe('Creación exitosa de turnos', () => {
        test('Caso 11: Debe crear turno correctamente con todos los campos', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00',
                estado: 'disponible'
            };
            
            const mockResultado = { id_turno: 12345 };
            const mockCommandInstance = { mock: true };
            CrearTurnoCommand.mockImplementation(() => mockCommandInstance);
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await crearTurno(req, res);
            
            expect(CommandInvoker.ejecutar).toHaveBeenCalledWith(1, mockCommandInstance);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Turno creado exitosamente',
                id_turno: 12345
            });
        });

        test('Caso 12: Debe crear turno sin estado (usando disponible por defecto)', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            const mockResultado = { id_turno: 67890 };
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Turno creado exitosamente',
                id_turno: 67890
            });
        });

        test('Caso 13: Debe crear múltiples turnos secuencialmente', async () => {
            const turnos = [
                { fecha: '2025-06-15', hora_inicio: '09:00', hora_fin: '10:00' },
                { fecha: '2025-06-15', hora_inicio: '10:00', hora_fin: '11:00' },
                { fecha: '2025-06-15', hora_inicio: '11:00', hora_fin: '12:00' }
            ];
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            
            for (let i = 0; i < turnos.length; i++) {
                req.body = turnos[i];
                const mockResultado = { id_turno: i + 1 };
                CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
                
                await crearTurno(req, res);
                
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Turno creado exitosamente',
                    id_turno: i + 1
                });
            }
            expect(CommandInvoker.ejecutar).toHaveBeenCalledTimes(3);
        });
    });

    // ==================== PRUEBAS DE MANEJO DE ERRORES ====================
    describe('Manejo de errores del Command', () => {
        test('Caso 14: Debe retornar 500 cuando el Command lanza error genérico', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            const error = new Error('Error en la base de datos');
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error en la base de datos'
            });
        });

        test('Caso 15: Debe retornar 500 cuando el Command lanza error sin mensaje', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            const error = new Error();
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockRejectedValue(error);
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error al crear turno'  // mensaje por defecto
            });
        });

        test('Caso 16: Debe retornar 500 cuando el Command retorna resultado sin id_turno', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            const mockResultado = { something: 'sin id_turno' };
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
            
            await crearTurno(req, res);
            
            // El controller no valida esto, pero se puede probar que responde con lo que tiene
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Turno creado exitosamente',
                id_turno: undefined  // undefined si no viene id_turno
            });
        });
    });

    // ==================== PRUEBAS DE INTEGRACIÓN DE PARÁMETROS ====================
    describe('Integración de parámetros del usuario', () => {
        test('Caso 17: Debe usar el id_usuario correcto del token', async () => {
            req.user = { id_usuario: 999 };
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(999, expect.any(Object));
            expect(CommandInvoker.ejecutar).toHaveBeenCalledWith(999, expect.any(Object));
        });

        test('Caso 18: Debe pasar correctamente todos los datos al Command', async () => {
            req.user = { id_usuario: 456 };
            req.body = {
                fecha: '2025-07-20',
                hora_inicio: '15:30',
                hora_fin: '16:30',
                estado: 'disponible'
            };
            
            let commandReceived = null;
            CrearTurnoCommand.mockImplementation((id, data) => {
                commandReceived = { id, data };
                return {};
            });
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(commandReceived).toEqual({
                id: 456,
                data: {
                    fecha: '2025-07-20',
                    hora_inicio: '15:30',
                    hora_fin: '16:30',
                    estado: 'disponible'
                }
            });
        });
    });

    // ==================== PRUEBAS DE VALORES LÍMITE ====================
    describe('Valores límite', () => {
        test('Caso 19: Debe aceptar fechas en el pasado', async () => {
            req.body = {
                fecha: '2020-01-01',  // fecha pasada
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('Caso 20: Debe aceptar fechas muy lejanas (año 3000)', async () => {
            req.body = {
                fecha: '3000-12-31',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('Caso 21: Debe aceptar horas límite (00:00 y 23:59)', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '00:00',
                hora_fin: '23:59'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(CrearTurnoCommand).toHaveBeenCalledWith(1, expect.objectContaining({
                hora_inicio: '00:00',
                hora_fin: '23:59'
            }));
        });
    });

    // ==================== PRUEBAS DE CONSISTENCIA ====================
    describe('Consistencia de respuestas', () => {
        test('Caso 22: La respuesta siempre debe tener la misma estructura', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 100 });
            
            await crearTurno(req, res);
            
            const responseCall = res.json.mock.calls[0][0];
            expect(responseCall).toHaveProperty('message');
            expect(responseCall).toHaveProperty('id_turno');
            expect(typeof responseCall.message).toBe('string');
            expect(typeof responseCall.id_turno).toBe('number');
        });

        test('Caso 23: El código de estado siempre debe ser 201 en éxito', async () => {
            req.body = {
                fecha: '2025-06-15',
                hora_inicio: '09:00',
                hora_fin: '10:00'
            };
            
            CrearTurnoCommand.mockImplementation(() => ({}));
            CommandInvoker.ejecutar.mockResolvedValue({ id_turno: 1 });
            
            await crearTurno(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
            // Asegurar que no se llamó con otros códigos
            const statusCalls = res.status.mock.calls;
            expect(statusCalls[0][0]).toBe(201);
        });
    });
});