// backend/controllers/inscripcionController.test.js

const { getMisInscripciones, cancelarInscripcion } = require('../controllers/inscripcionController');
const InscripcionModel = require('../models/InscripcionModel');
const CommandInvoker = require('../commands/invoker/CommandInvoker');
const CancelarInscripcionCommand = require('../commands/turno/CancelarInscripcionCommand');

// ==================== getMisInscripciones ====================
describe('getMisInscripciones - Pruebas', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { id_usuario: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('Caso 1: Debe retornar lista de inscripciones del usuario', async () => {
        const mockInscripciones = [
            { id_inscripcion: 1, id_turno: 10, estado: 'activo' },
            { id_inscripcion: 2, id_turno: 20, estado: 'activo' }
        ];
        InscripcionModel.obtenerInscripcionesDeUsuario.mockResolvedValue(mockInscripciones);
        
        await getMisInscripciones(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const responseData = res.json.mock.calls[0][0];
        
        console.log(`\n✅ ${statusCode} - Lista de ${responseData.length} inscripciones`);
        
        expect(statusCode).toBe(200);
        expect(responseData).toEqual(mockInscripciones);
    });

    test('Caso 2: Debe retornar arreglo vacío si no tiene inscripciones', async () => {
        InscripcionModel.obtenerInscripcionesDeUsuario.mockResolvedValue([]);
        
        await getMisInscripciones(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const responseData = res.json.mock.calls[0][0];
        
        console.log(`\n✅ ${statusCode} - Arreglo vacío []`);
        
        expect(statusCode).toBe(200);
        expect(responseData).toEqual([]);
    });

    test('Caso 3: Debe retornar 500 si hay error en BD', async () => {
        const error = new Error('Error de conexión');
        InscripcionModel.obtenerInscripcionesDeUsuario.mockRejectedValue(error);
        
        await getMisInscripciones(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n✅ ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Error de conexión');
    });
});

// ==================== cancelarInscripcion ====================
describe('cancelarInscripcion - Pruebas', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { id_usuario: 1 },
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('Caso 1: Debe retornar 400 si no se proporciona id', async () => {
        req.params.id = undefined;
        
        await cancelarInscripcion(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n✅ ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(400);
        expect(message).toBe('Debe indicar una inscripción para cancelar.');
    });

    test('Caso 2: Debe cancelar inscripción exitosamente', async () => {
        req.params.id = '123';
        const mockResultado = { message: 'Inscripción cancelada con éxito' };
        const mockCommandInstance = {};
        CancelarInscripcionCommand.mockImplementation(() => mockCommandInstance);
        CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
        
        await cancelarInscripcion(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const response = res.json.mock.calls[0][0];
        
        console.log(`\n✅ ${statusCode} - "${response.message}"`);
        
        expect(statusCode).toBe(200);
        expect(response).toEqual({ message: 'Inscripción cancelada con éxito' });
    });

    test('Caso 3: Debe retornar 500 si el comando falla', async () => {
        req.params.id = '123';
        const error = new Error('Inscripción no encontrada');
        CancelarInscripcionCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockRejectedValue(error);
        
        await cancelarInscripcion(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n✅ ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Inscripción no encontrada');
    });
});