// backend/controllers/inscripcion.test.js
const { inscribirseTurno } = require('../controllers/inscripcionController');
const CommandInvoker = require('../commands/invoker/CommandInvoker');
const InscribirseCommand = require('../commands/turno/InscribirseCommand');

jest.mock('../commands/invoker/CommandInvoker');
jest.mock('../commands/turno/InscribirseCommand');
console.error = jest.fn();

describe('inscribirseTurno - Pruebas Extensivas', () => {
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

    // CASO 1: Falta el id del turno
    test('Caso 1: No se proporciona id del turno', async () => {
        req.params.id = undefined;
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(400);
        expect(message).toBe('Debe indicar un turno para inscribirse.');
        expect(CommandInvoker.ejecutar).not.toHaveBeenCalled();
    });

    // CASO 2: Inscripción exitosa
    test('Caso 2: Inscripción exitosa con id válido', async () => {
        req.params.id = '123';
        const mockResultado = {
            mensaje: 'Inscripción realizada con éxito',
            id_inscripcion: 456
        };
        const mockCommandInstance = {};
        InscribirseCommand.mockImplementation(() => mockCommandInstance);
        CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const response = res.json.mock.calls[0][0];
        
        console.log(`\n ${statusCode} - message: "${response.message}", id_inscripcion: ${response.id_inscripcion}`);
        
        expect(statusCode).toBe(201);
        expect(response).toEqual({
            message: 'Inscripción realizada con éxito',
            id_inscripcion: 456
        });
        expect(InscribirseCommand).toHaveBeenCalledWith(1, '123');
        expect(CommandInvoker.ejecutar).toHaveBeenCalledWith(1, mockCommandInstance);
    });

    // CASO 3: Error del command - turno no existe
    test('Caso 3: Error - turno no encontrado', async () => {
        req.params.id = '999';
        const error = new Error('Turno no encontrado');
        InscribirseCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockRejectedValue(error);
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Turno no encontrado');
    });

    // CASO 4: Error del command - turno no disponible
    test('Caso 4: Error - turno no disponible (ocupado o cancelado)', async () => {
        req.params.id = '123';
        const error = new Error('El turno no está disponible para inscripción');
        InscribirseCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockRejectedValue(error);
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('El turno no está disponible para inscripción');
    });

    // CASO 5: Error del command - ya inscrito previamente
    test('Caso 5: Error - ya existe inscripción para este usuario', async () => {
        req.params.id = '123';
        const error = new Error('Ya estás inscrito en este turno');
        InscribirseCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockRejectedValue(error);
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Ya estás inscrito en este turno');
    });

    // CASO 6: Error del command sin mensaje (mensaje undefined)
    test('Caso 6: Error sin mensaje definido', async () => {
        req.params.id = '123';
        const error = new Error(); // mensaje undefined
        InscribirseCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockRejectedValue(error);
        
        await inscribirseTurno(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - mensaje: "${message}" (undefined se convierte en vacío)`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe(undefined); // o ''? Depende de cómo se propague
    });

    // CASO 7: Verificar que se pasa correctamente el id_usuario
    test('Caso 7: Se usa el id_usuario del token correctamente', async () => {
        req.user.id_usuario = 999;
        req.params.id = '123';
        const mockResultado = { mensaje: 'Ok', id_inscripcion: 1 };
        InscribirseCommand.mockImplementation(() => ({}));
        CommandInvoker.ejecutar.mockResolvedValue(mockResultado);
        
        await inscribirseTurno(req, res);
        
        console.log(`\n Se llamó a InscribirseCommand con id_usuario=999`);
        
        expect(InscribirseCommand).toHaveBeenCalledWith(999, '123');
    });
});