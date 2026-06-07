// backend/controllers/getMisTurnos.test.js
const { getMisTurnos } = require('../controllers/turnoController');
const UsuarioModel = require('../models/UsuarioModel');
const TurnoModel = require('../models/TurnoModel');

jest.mock('../models/UsuarioModel');
jest.mock('../models/TurnoModel');
console.error = jest.fn();

describe('getMisTurnos - Pruebas Extensivas', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { id_usuario: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    // ==================== CASO 1 ====================
    test('Caso 1: Usuario no es médico (verificarMedico retorna null)', async () => {
        UsuarioModel.verificarMedico.mockResolvedValue(null);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(403);
        expect(message).toBe('No autorizado');
    });

    // ==================== CASO 2 ====================
    test('Caso 2: Usuario tiene es_medico = false', async () => {
        UsuarioModel.verificarMedico.mockResolvedValue({ id_medico: 10, es_medico: false });
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(403);
        expect(message).toBe('No autorizado');
    });

    // ==================== CASO 3 ====================
    test('Caso 3: Objeto médico sin propiedad es_medico', async () => {
        UsuarioModel.verificarMedico.mockResolvedValue({ id_medico: 10 });
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(403);
    });

    // ==================== CASO 4 ====================
    test('Caso 4: verificarMedico retorna undefined', async () => {
        UsuarioModel.verificarMedico.mockResolvedValue(undefined);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(403);
    });

    // ==================== CASO 5 ====================
    test('Caso 5: Médico válido con 2 turnos', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [
            { id_turno: 1, fecha: '2025-06-15', hora_inicio: '09:00', hora_fin: '10:00', estado: 'disponible' },
            { id_turno: 2, fecha: '2025-06-16', hora_inicio: '10:00', hora_fin: '11:00', estado: 'ocupado' }
        ];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const responseData = res.json.mock.calls[0][0];
        
        console.log(`\n ${statusCode} - Lista de ${responseData.length} turnos con id_turno, fecha, hora_inicio, hora_fin, estado`);
        
        expect(statusCode).toBe(200);
        expect(responseData).toEqual(mockTurnos);
    });

    // ==================== CASO 6 ====================
    test('Caso 6: Médico válido sin turnos', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const responseData = res.json.mock.calls[0][0];
        
        console.log(`\n ${statusCode} - Arreglo vacío []`);
        
        expect(statusCode).toBe(200);
        expect(responseData).toEqual([]);
    });

    // ==================== CASO 7 ====================
    test('Caso 7: Diferentes IDs de médico', async () => {
        const ids = [100, 200, 300];
        for (const id of ids) {
            req.user.id_usuario = id;
            const mockMedico = { id_medico: id, es_medico: true };
            UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
            TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
            
            await getMisTurnos(req, res);
            
            const statusCode = res.status.mock.calls[0][0];
            console.log(`\n ID médico ${id} → ${statusCode} - OK`);
            expect(statusCode).toBe(200);
        }
    });

    // ==================== CASO 8 ====================
    test('Caso 8: Retorna turnos con todos los campos necesarios', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [{
            id_turno: 1,
            fecha: '2025-06-15',
            hora_inicio: '09:00',
            hora_fin: '10:00',
            estado: 'disponible'
        }];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        const tieneCampos = responseData[0].hasOwnProperty('id_turno') && 
                            responseData[0].hasOwnProperty('fecha') &&
                            responseData[0].hasOwnProperty('hora_inicio') &&
                            responseData[0].hasOwnProperty('hora_fin') &&
                            responseData[0].hasOwnProperty('estado');
        
        console.log(`\n 200 - Respuesta contiene id_turno (número), fecha (string), hora_inicio (string), hora_fin (string), estado (string) -> ${tieneCampos ? 'SÍ' : 'NO'}`);
        
        expect(tieneCampos).toBe(true);
    });

    // ==================== CASO 9 ====================
    test('Caso 9: Turno con paciente asignado', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [{
            id_turno: 1,
            fecha: '2025-06-15',
            hora_inicio: '09:00',
            hora_fin: '10:00',
            estado: 'ocupado',
            paciente_nombre: 'Juan Pérez',
            paciente_email: 'juan@mail.com'
        }];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        console.log(`\n 200 - Incluye paciente_nombre: "${responseData[0].paciente_nombre}" y paciente_email: "${responseData[0].paciente_email}"`);
        
        expect(responseData[0].paciente_nombre).toBe('Juan Pérez');
        expect(responseData[0].paciente_email).toBe('juan@mail.com');
    });

    // ==================== CASO 10 ====================
    test('Caso 10: Turnos con estado disponible', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [
            { id_turno: 1, estado: 'disponible' },
            { id_turno: 2, estado: 'disponible' }
        ];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        const todosDisponibles = responseData.every(t => t.estado === 'disponible');
        
        console.log(`\n 200 - Los ${responseData.length} turnos tienen estado="disponible" -> ${todosDisponibles ? 'SÍ' : 'NO'}`);
        
        expect(todosDisponibles).toBe(true);
    });

    // ==================== CASO 11 ====================
    test('Caso 11: Turnos con estado ocupado', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [
            { id_turno: 1, estado: 'ocupado' },
            { id_turno: 2, estado: 'ocupado' }
        ];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        const todosOcupados = responseData.every(t => t.estado === 'ocupado');
        
        console.log(`\n 200 - Los ${responseData.length} turnos tienen estado="ocupado" -> ${todosOcupados ? 'SÍ' : 'NO'}`);
        
        expect(todosOcupados).toBe(true);
    });

    // ==================== CASO 12 ====================
    test('Caso 12: Turnos con estado cancelado', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [
            { id_turno: 1, estado: 'cancelado' },
            { id_turno: 2, estado: 'cancelado' }
        ];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        const todosCancelados = responseData.every(t => t.estado === 'cancelado');
        
        console.log(`\n 200 - Los ${responseData.length} turnos tienen estado="cancelado" -> ${todosCancelados ? 'SÍ' : 'NO'}`);
        
        expect(todosCancelados).toBe(true);
    });

    // ==================== CASO 13 ====================
    test('Caso 13: Mezcla de diferentes estados', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const mockTurnos = [
            { id_turno: 1, estado: 'disponible' },
            { id_turno: 2, estado: 'ocupado' },
            { id_turno: 3, estado: 'cancelado' }
        ];
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(mockTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        const estados = responseData.map(t => t.estado);
        
        console.log(`\n 200 - Respuesta incluye estados: ${estados.join(', ')}`);
        
        expect(estados).toContain('disponible');
        expect(estados).toContain('ocupado');
        expect(estados).toContain('cancelado');
    });

    // ==================== CASO 14 ====================
    test('Caso 14: Error de conexión BD (verificarMedico lanza error)', async () => {
        const error = new Error('Error de conexión a la base de datos');
        UsuarioModel.verificarMedico.mockRejectedValue(error);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Error al obtener los turnos');
    });

    // ==================== CASO 15 ====================
    test('Caso 15: Error al listar turnos', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const error = new Error('Error al listar turnos');
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockRejectedValue(error);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
        expect(message).toBe('Error al obtener los turnos');
    });

    // ==================== CASO 16 ====================
    test('Caso 16: Error de timeout', async () => {
        const error = new Error('Database timeout');
        UsuarioModel.verificarMedico.mockRejectedValue(error);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        const message = res.json.mock.calls[0][0].message;
        
        console.log(`\n ${statusCode} - "${message}"`);
        
        expect(statusCode).toBe(500);
    });

    // ==================== CASO 17 ====================
    test('Caso 17: Error de sintaxis SQL', async () => {
        const error = new Error('Invalid SQL syntax');
        UsuarioModel.verificarMedico.mockRejectedValue(error);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        console.log(`\n ${statusCode} - Error capturado`);
        
        expect(statusCode).toBe(500);
    });

    // ==================== CASO 18 ====================
    test('Caso 18: Usa el id_usuario correcto del token', async () => {
        req.user.id_usuario = 999;
        const mockMedico = { id_medico: 888, es_medico: true };
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        console.log(`\n Se llamó a verificarMedico con id_usuario=999`);
        
        expect(UsuarioModel.verificarMedico).toHaveBeenCalledWith(999);
    });

    // ==================== CASO 19 ====================
    test('Caso 19: Pasa el id_medico correcto a listarTurnosPorMedico', async () => {
        const mockMedico = { id_medico: 777, es_medico: true };
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        console.log(`\n Se llamó a listarTurnosPorMedico con id_medico=777`);
        
        expect(TurnoModel.listarTurnosPorMedico).toHaveBeenCalledWith(777);
    });

    // ==================== CASO 20 ====================
    test('Caso 20: Maneja gran cantidad de turnos (150 turnos)', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const muchosTurnos = Array.from({ length: 150 }, (_, i) => ({
            id_turno: i + 1,
            fecha: '2025-06-15',
            hora_inicio: '09:00',
            hora_fin: '10:00',
            estado: 'disponible'
        }));
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue(muchosTurnos);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        console.log(`\n 200 - Respuesta con ${responseData.length} turnos procesados correctamente`);
        
        expect(responseData.length).toBe(150);
    });

    // ==================== CASO 21 ====================
    test('Caso 21: Respuesta rápida (< 1000 ms)', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        const start = Date.now();
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        const duration = Date.now() - start;
        console.log(`\n 200 - Respuesta en ${duration} ms (menor a 1000 ms)`);
        
        expect(duration).toBeLessThan(1000);
    });

    // ==================== CASO 22 ====================
    test('Caso 22: La respuesta siempre es un arreglo', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        const responseData = res.json.mock.calls[0][0];
        console.log(`\n 200 - Respuesta es un array: ${Array.isArray(responseData)}`);
        
        expect(Array.isArray(responseData)).toBe(true);
    });

    // ==================== CASO 23 ====================
    test('Caso 23: Código de estado 200 en éxito', async () => {
        const mockMedico = { id_medico: 10, es_medico: true };
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        console.log(`\n ${statusCode} - OK consistente`);
        
        expect(statusCode).toBe(200);
    });

    // ==================== CASO 24 ====================
    test('Caso 24: Sin efectos secundarios entre llamadas', async () => {
        const mockMedico1 = { id_medico: 10, es_medico: true };
        const mockMedico2 = { id_medico: 20, es_medico: true };
        
        req.user.id_usuario = 1;
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico1);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([{ id_turno: 1 }]);
        await getMisTurnos(req, res);
        
        req.user.id_usuario = 2;
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico2);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([{ id_turno: 2 }]);
        await getMisTurnos(req, res);
        
        console.log(`\n Primera llamada usó id_medico=10, segunda usó id_medico=20`);
        
        expect(TurnoModel.listarTurnosPorMedico).toHaveBeenNthCalledWith(1, 10);
        expect(TurnoModel.listarTurnosPorMedico).toHaveBeenNthCalledWith(2, 20);
    });

    // ==================== CASO 25 ====================
    test('Caso 25: id_usuario como string', async () => {
        req.user.id_usuario = "123";
        const mockMedico = { id_medico: 10, es_medico: true };
        
        UsuarioModel.verificarMedico.mockResolvedValue(mockMedico);
        TurnoModel.listarTurnosPorMedico.mockResolvedValue([]);
        
        await getMisTurnos(req, res);
        
        console.log(`\n Se llamó a verificarMedico con string "123"`);
        
        expect(UsuarioModel.verificarMedico).toHaveBeenCalledWith("123");
    });

    // ==================== CASO 26 ====================
    test('Caso 26: id_usuario null', async () => {
        req.user.id_usuario = null;
        
        await getMisTurnos(req, res);
        
        console.log(`\n Se llamó a verificarMedico con null`);
        
        expect(UsuarioModel.verificarMedico).toHaveBeenCalledWith(null);
    });

    // ==================== CASO 27 ====================
    test('Caso 27: req.user undefined', async () => {
        req.user = undefined;
        
        await getMisTurnos(req, res);
        
        const statusCode = res.status.mock.calls[0][0];
        console.log(`\n ${statusCode} - Error controlado por falta de usuario`);
        
        expect(statusCode).toBe(500);
    });
});