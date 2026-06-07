import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export const MisTurnos = () => {
    const [turnos, setTurnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [turnoEditando, setTurnoEditando] = useState(null);
    const [nuevoHorario, setNuevoHorario] = useState({
        fecha: '',
        hora_inicio: '',
        hora_fin: ''
    });
    const [modalAbierto, setModalAbierto] = useState(false);
    const [puedeDeshacer, setPuedeDeshacer] = useState(false);
    const [puedeRehacer, setPuedeRehacer] = useState(false);
    const [mostrarModalHistoria, setMostrarModalHistoria] = useState(false);
    const [mostrarModalHistoriaVer, setMostrarModalHistoriaVer] = useState(false);
    const [historiaData, setHistoriaData] = useState({
        id_inscripcion: '',
        sintomas: '',
        diagnostico: '',
        tratamiento: '',
        receta: '',
        notas: ''
    });
    const [creandoHistoria, setCreandoHistoria] = useState(false);
    const navigate = useNavigate();

    const coloresEstado = {
        disponible: 'bg-green-100 text-green-800',
        ocupado: 'bg-yellow-100 text-yellow-800',
        cancelado: 'bg-red-100 text-red-800',
        completado: 'bg-blue-100 text-blue-800'
    };

    const generarOpcionesHoras = () => {
        const opciones = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hora = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
                opciones.push(hora);
            }
        }
        return opciones;
    };

    const horasDisponibles = generarOpcionesHoras();

    useEffect(() => {
        verificarAccesoYcargarTurnos();
    }, []);

    useEffect(() => {
        verificarHistorial();
    }, []);

    const verificarAccesoYcargarTurnos = async () => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            toast.error('Debes iniciar sesión para ver tus turnos');
            setTimeout(() => navigate('/'), 2000);
            setCargando(false);
            return;
        }
        
        if (userRole !== 'medico') {
            toast.warning('Esta sección es solo para médicos.');
            setTimeout(() => navigate('/'), 2500);
            setCargando(false);
            return;
        }
        
        await obtenerMisTurnos();
    };

    const obtenerMisTurnos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            const response = await API.get('/turnos/mis-turnos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTurnos(response.data);
            setCargando(false);
            setError(null);
        } catch (err) {
            console.error('Error al obtener turnos:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    toast.error('Sesión expirada. Redirigiendo al inicio...');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    setTimeout(() => navigate('/'), 2000);
                } else if (err.response.status === 403) {
                    setError('No tienes permisos para acceder a esta información.');
                    toast.error('Acceso denegado');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setError('Error al cargar tus turnos. Intenta nuevamente.');
                }
            } else if (err.request) {
                setError('Error de conexión. Verifica tu internet.');
            } else {
                setError('Error inesperado. Por favor, intenta más tarde.');
            }
            setCargando(false);
        }
    };

    const verificarHistorial = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.get('/comandos/estado', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPuedeDeshacer(response.data.canUndo);
            setPuedeRehacer(response.data.canRedo);
        } catch (err) {
            console.error('Error al verificar historial:', err);
        }
    };

    const deshacerUltimaAccion = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.post('/comandos/deshacer', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(response.data.message || 'Acción deshecha');
            await obtenerMisTurnos();
            await verificarHistorial();
            
        } catch (err) {
            console.error('Error al deshacer:', err);
            toast.error(err.response?.data?.message || 'No se pudo deshacer la acción');
        }
    };

    const rehacerUltimaAccion = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.post('/comandos/rehacer', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(response.data.message || 'Acción rehecha');
            await obtenerMisTurnos();
            await verificarHistorial();
            
        } catch (err) {
            console.error('Error al rehacer:', err);
            toast.error(err.response?.data?.message || 'No se pudo rehacer la acción');
        }
    };

    const cancelarTurno = async (idTurno) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar este turno?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await API.delete(`/turnos/${idTurno}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            toast.success('Turno cancelado exitosamente');
            setTurnos(turnos.filter(t => t.id_turno !== idTurno));
            await verificarHistorial();
        } catch (err) {
            console.error('Error al cancelar turno:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    setTimeout(() => navigate('/'), 2000);
                } else if (err.response.status === 403) {
                    toast.error('No tienes permisos para cancelar este turno.');
                } else {
                    toast.error(`No se pudo cancelar el turno: ${err.response.data.message || 'Error desconocido'}`);
                }
            } else if (err.request) {
                toast.error('Error de conexión. Verifica tu internet.');
            } else {
                toast.error('Error inesperado al cancelar el turno');
            }
        }
    };

    const modificarHorario = async (idTurno, fecha, hora_inicio, hora_fin) => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.patch(
                `/turnos/${idTurno}/horario`,
                { fecha, hora_inicio, hora_fin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.warning) {
                toast.warning(response.data.message, {
                    autoClose: 5000,
                    position: "top-center"
                });
            } else {
                toast.success(response.data.message);
            }
            
            await obtenerMisTurnos();
            await verificarHistorial();
            
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al modificar horario');
        }
    };

    const abrirModalModificar = (turno) => {
        setTurnoEditando(turno);
        setNuevoHorario({
            fecha: turno.fecha,
            hora_inicio: turno.hora_inicio,
            hora_fin: turno.hora_fin
        });
        setModalAbierto(true);
    };

    const handleModificarSubmit = async () => {
        if (!nuevoHorario.fecha || !nuevoHorario.hora_inicio || !nuevoHorario.hora_fin) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        if (nuevoHorario.hora_inicio >= nuevoHorario.hora_fin) {
            toast.error('La hora de inicio debe ser menor que la hora de fin');
            return;
        }

        await modificarHorario(
            turnoEditando.id_turno,
            nuevoHorario.fecha,
            nuevoHorario.hora_inicio,
            nuevoHorario.hora_fin
        );

        setModalAbierto(false);
        setTurnoEditando(null);
    };

    const abrirModalHistoria = (turno) => {
        if (!turno.id_inscripcion) {
            toast.error('Este turno no tiene un paciente inscrito');
            return;
        }
        
        setHistoriaData({
            id_inscripcion: turno.id_inscripcion,
            sintomas: '',
            diagnostico: '',
            tratamiento: '',
            receta: '',
            notas: ''
        });
        setMostrarModalHistoria(true);
    };

    const verHistoriaMedica = async (idHistoriaMedica) => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.get(`/historia/${idHistoriaMedica}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const historia = response.data;
            
            setHistoriaData({
                id_inscripcion: historia.id_inscripcion || '',
                sintomas: historia.sintomas || '',
                diagnostico: historia.diagnostico || '',
                tratamiento: historia.tratamiento || '',
                receta: historia.receta || '',
                notas: historia.notas || ''
            });
            setMostrarModalHistoriaVer(true);
            
        } catch (err) {
            console.error('Error al obtener historia:', err);
            toast.error(err.response?.data?.message || 'Error al cargar la historia médica');
        }
    };

    const handleCrearHistoria = async () => {
        if (!historiaData.sintomas) {
            toast.error('Los síntomas son obligatorios');
            return;
        }
        if (!historiaData.diagnostico) {
            toast.error('El diagnóstico es obligatorio');
            return;
        }
        if (!historiaData.tratamiento) {
            toast.error('El tratamiento es obligatorio');
            return;
        }
        if (!historiaData.receta) {
            toast.error('La receta es obligatoria');
            return;
        }
        
        setCreandoHistoria(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await API.post('/historia', {
                id_inscripcion: historiaData.id_inscripcion,
                sintomas: historiaData.sintomas,
                diagnostico: historiaData.diagnostico,
                tratamiento: historiaData.tratamiento,
                receta: historiaData.receta,
                notas: historiaData.notas
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Historia médica creada exitosamente');
            setMostrarModalHistoria(false);
            await obtenerMisTurnos();
            await verificarHistorial();
            
        } catch (err) {
            console.error('Error al crear historia:', err);
            toast.error(err.response?.data?.message || 'Error al crear historia médica');
        } finally {
            setCreandoHistoria(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return 'Fecha no disponible';
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatearHora = (hora) => {
        if (!hora) return '--:--';
        if (typeof hora === 'string' && hora.includes('T')) {
            return hora.split('T')[1].substring(0, 5);
        }
        if (typeof hora === 'string' && hora.includes(':')) {
            return hora.substring(0, 5);
        }
        return '--:--';
    };

    const getEstadoTexto = (estado) => {
        const estados = {
            disponible: 'Disponible',
            ocupado: 'Ocupado',
            cancelado: 'Cancelado',
            completado: 'Completado'
        };
        return estados[estado] || estado;
    };

    if (cargando) return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando tus turnos...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="text-center mt-10 p-6 bg-red-50 rounded-lg max-w-md mx-auto">
                <div className="text-red-600 mb-4">
                    <p className="text-lg font-semibold">{error}</p>
                </div>
                <button 
                    onClick={verificarAccesoYcargarTurnos}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
    
    const turnosDisponibles = turnos.filter(t => t.estado !== 'cancelado');
    
    if (turnosDisponibles.length === 0) return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8">
                    <div className="text-8xl mb-6">📅</div>
                    <h3 className="text-4xl font-bold text-gray-800 mb-4">No tienes turnos publicados</h3>
                    <p className="text-xl text-gray-600 mb-2">¡Es momento de comenzar!</p>
                    <p className="text-gray-500 mb-8">
                        Publica tu primer turno y comienza a atender pacientes.
                        Es rápido y sencillo.
                    </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-8 mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Beneficios de publicar tus turnos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-gray-700">Más pacientes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <span className="text-gray-700">Organiza tu agenda</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-gray-700">Recibe valoraciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💼</span>
                            <span className="text-gray-700">Crece profesionalmente</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/publicar-turno')}
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
                >
                    + Publicar mi primer turno
                </button>
                
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 min-h-[calc(100vh-200px)]">
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-bold text-gray-900">Mis Turnos Publicados</h3>
                
                <div className="flex gap-2">
                    <button
                        onClick={deshacerUltimaAccion}
                        disabled={!puedeDeshacer}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${
                            puedeDeshacer 
                                ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-icons text-base">undo</span>
                        Deshacer
                    </button>
                    
                    <button
                        onClick={rehacerUltimaAccion}
                        disabled={!puedeRehacer}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${
                            puedeRehacer 
                                ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-icons text-base">redo</span>
                        Rehacer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {turnosDisponibles.map((turno) => (
                    <div key={turno.id_turno} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-blue-600 h-28 flex items-center justify-center">
                            <div className="text-center text-white">
                                <p className="text-xl font-bold">{formatearFecha(turno.fecha)}</p>
                                <p className="text-md">{formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}</p>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <div className="mb-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${coloresEstado[turno.estado] || 'bg-gray-100 text-gray-800'}`}>
                                    {getEstadoTexto(turno.estado)}
                                </span>
                            </div>
                            
                            {turno.paciente_nombre && (
                                <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="text-sm text-gray-700 font-semibold">Paciente asignado:</p>
                                    <p className="text-gray-800">{turno.paciente_nombre}</p>
                                    {turno.paciente_email && (
                                        <p className="text-xs text-gray-500 mt-1">📧 {turno.paciente_email}</p>
                                    )}
                                    {turno.alergias && (
                                        <p className="text-xs text-red-600 mt-1">Alergias: {turno.alergias}</p>
                                    )}
                                    <p className="text-xs text-orange-600 mt-2">
                                        Si modificas el horario, el paciente será notificado
                                    </p>
                                </div>
                            )}
                            
                            <div className="mb-4 text-sm text-gray-600 space-y-1">
                                <p className="flex items-center gap-1">
                                    <span className="material-icons text-base">calendar_today</span>
                                    Fecha: {formatearFecha(turno.fecha)}
                                </p>
                                <p className="flex items-center gap-1">
                                    <span className="material-icons text-base">schedule</span>
                                    Horario: {formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                {turno.estado === 'disponible' && (
                                    <>
                                        <button
                                            onClick={() => abrirModalModificar(turno)}
                                            className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            <span className="material-icons text-base">edit</span>
                                            Modificar horario
                                        </button>
                                        <button
                                            onClick={() => cancelarTurno(turno.id_turno)}
                                            className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            <span className="material-icons text-base">cancel</span>
                                            Cancelar turno
                                        </button>
                                    </>
                                )}
                                
                                {turno.estado === 'ocupado' && (
                                    <>
                                        <button
                                            onClick={() => abrirModalModificar(turno)}
                                            className="w-full flex items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            <span className="material-icons text-base">edit</span>
                                            Modificar horario
                                        </button>
                                        <button
                                            disabled
                                            className="w-full bg-gray-400 cursor-not-allowed text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-1"
                                        >
                                            <span className="material-icons text-base">block</span>
                                            Turno ocupado (no cancelable)
                                        </button>
                                        
                                        <button
                                            onClick={() => abrirModalHistoria(turno)}
                                            className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            <span className="material-icons text-base">medical_services</span>
                                            Crear Historia Médica
                                        </button>
                                    </>
                                )}
                                
                                {turno.estado === 'completado' && (
                                    <>
                                        <button
                                            disabled
                                            className="w-full bg-gray-400 cursor-not-allowed text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-1"
                                        >
                                            <span className="material-icons text-base">block</span>
                                            Turno completado
                                        </button>
                                        <button
                                            onClick={() => verHistoriaMedica(turno.id_historia_medica)}
                                            className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            <span className="material-icons text-base">visibility</span>
                                            Ver Historia Médica
                                        </button>
                                    </>
                                )}
                                        </div>
                                    </div>
                                </div>
                                ))}
            </div>

            {/* Modal para modificar horario */}
            {modalAbierto && turnoEditando && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="material-icons">edit</span>
                                Modificar Horario
                            </h3>
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {turnoEditando.paciente_nombre && (
                            <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Atención:</span> Este turno tiene un paciente asignado 
                                    (<strong>{turnoEditando.paciente_nombre}</strong>). 
                                    Al modificar el horario, se le notificará automáticamente.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Fecha *
                                </label>
                                <input
                                    type="date"
                                    value={nuevoHorario.fecha}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, fecha: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora Inicio *
                                    </label>
                                    <select
                                        value={nuevoHorario.hora_inicio}
                                        onChange={(e) => setNuevoHorario({...nuevoHorario, hora_inicio: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar hora</option>
                                        {horasDisponibles.map((hora) => (
                                            <option key={`editar-inicio-${hora}`} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora Fin *
                                    </label>
                                    <select
                                        value={nuevoHorario.hora_fin}
                                        onChange={(e) => setNuevoHorario({...nuevoHorario, hora_fin: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar hora</option>
                                        {horasDisponibles.map((hora) => (
                                            <option key={`editar-fin-${hora}`} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleModificarSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear historia médica */}
            {mostrarModalHistoria && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="material-icons">medical_services</span>
                                Crear Historia Médica
                            </h3>
                            <button
                                onClick={() => setMostrarModalHistoria(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Síntomas <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={historiaData.sintomas}
                                    onChange={(e) => setHistoriaData({...historiaData, sintomas: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe los síntomas del paciente..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Diagnóstico <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={historiaData.diagnostico}
                                    onChange={(e) => setHistoriaData({...historiaData, diagnostico: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Gripe, Hipertensión, etc."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tratamiento <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={historiaData.tratamiento}
                                    onChange={(e) => setHistoriaData({...historiaData, tratamiento: e.target.value})}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tratamiento recetado..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receta <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={historiaData.receta}
                                    onChange={(e) => setHistoriaData({...historiaData, receta: e.target.value})}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Medicamentos recetados..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas adicionales
                                </label>
                                <textarea
                                    value={historiaData.notas}
                                    onChange={(e) => setHistoriaData({...historiaData, notas: e.target.value})}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Información adicional..."
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={() => setMostrarModalHistoria(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCrearHistoria}
                                disabled={creandoHistoria}
                                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <span className="material-icons text-base">save</span>
                                {creandoHistoria ? 'Guardando...' : 'Guardar Historia Médica'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver historia médica (solo lectura) */}
            {mostrarModalHistoriaVer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="material-icons">visibility</span>
                                Historia Médica
                            </h3>
                            <button
                                onClick={() => setMostrarModalHistoriaVer(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Síntomas
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">{historiaData.sintomas || 'No especificado'}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Diagnóstico
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">{historiaData.diagnostico || 'No especificado'}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tratamiento
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">{historiaData.tratamiento || 'No especificado'}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Receta
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">{historiaData.receta || 'No especificado'}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notas adicionales
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">{historiaData.notas || 'No especificado'}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end p-6 border-t bg-gray-50">
                            <button
                                onClick={() => setMostrarModalHistoriaVer(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                            >
                                <span className="material-icons text-base">close</span>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};