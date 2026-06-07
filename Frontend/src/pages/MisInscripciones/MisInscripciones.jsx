import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const MisInscripciones = () => {
    const navigate = useNavigate();
    
    // Estados principales
    const [inscripciones, setInscripciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estado para el modal de historia médica
    const [historiaModal, setHistoriaModal] = useState({
        open: false,
        data: null,
        loading: false,
        error: null
    });

    // Estado para el botón Deshacer
    const [puedeDeshacer, setPuedeDeshacer] = useState(false);

    // Imágenes por defecto para las tarjetas
    const imagenes = ['JB-pink.jpg', 'JB-blue.jpg', 'JB-green.jpg'];

    // ==================== FUNCIONES AUXILIARES ====================
    const formatearHora = (horaCompleta) => {
        if (!horaCompleta) return '';
        if (typeof horaCompleta === 'string' && horaCompleta.includes('T')) {
            return horaCompleta.split('T')[1].substring(0, 5);
        }
        if (horaCompleta instanceof Date) {
            return horaCompleta.toTimeString().substring(0, 5);
        }
        return horaCompleta;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string') {
            const fechaParte = fecha.split('T')[0];
            const [year, month, day] = fechaParte.split('-');
            return `${day}/${month}/${year}`;
        }
        if (fecha instanceof Date) {
            const day = fecha.getDate().toString().padStart(2, '0');
            const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const year = fecha.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return fecha;
    };

    const getEstadoInfo = (estado) => {
        switch (estado) {
            case 'disponible':
                return { texto: 'Disponible', color: 'text-green-600 bg-green-100', icono: 'check_circle' };
            case 'ocupado':
                return { texto: 'Reservado', color: 'text-yellow-600 bg-yellow-100', icono: 'schedule' };
            case 'completado':
                return { texto: 'Completado', color: 'text-blue-600 bg-blue-100', icono: 'done_all' };
            case 'cancelado':
                return { texto: 'Cancelado', color: 'text-red-600 bg-red-100', icono: 'cancel' };
            default:
                return { texto: estado || 'Pendiente', color: 'text-gray-600 bg-gray-100', icono: 'help' };
        }
    };

    // ==================== VERIFICAR AUTENTICACIÓN Y ROL ====================
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            toast.error('🔒 Debes iniciar sesión para acceder a esta página');
            setTimeout(() => navigate('/'), 2000);
            return;
        }
        
        if (userRole !== 'paciente') {
            toast.warning('👤 Esta sección es solo para pacientes. Los médicos no tienen inscripciones como pacientes.');
            setTimeout(() => navigate('/'), 2500);
        }
    }, [navigate]);

    // ==================== VERIFICAR HISTORIAL DE COMANDOS ====================
    useEffect(() => {
        const verificarHistorial = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await API.get('/comandos/estado', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPuedeDeshacer(response.data.canUndo);
            } catch (err) {
                console.error('Error al verificar historial:', err);
            }
        };
        verificarHistorial();
    }, []);

    // ==================== CARGAR INSCRIPCIONES ====================
    const cargarInscripciones = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await API.get('/turnos/mis-inscripciones', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const inscripcionesConImagen = response.data.map(inscripcion => ({
                ...inscripcion,
                imagen: imagenes[Math.floor(Math.random() * imagenes.length)],
                hora_inicio_formateada: formatearHora(inscripcion.hora_inicio),
                hora_fin_formateada: formatearHora(inscripcion.hora_fin),
                fecha_formateada: formatearFecha(inscripcion.fecha_turno)
            }));
            setInscripciones(inscripcionesConImagen);
        } catch (err) {
            console.error('Error al cargar inscripciones:', err);
            toast.error('No se pudieron cargar las inscripciones');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        if (token && userRole === 'paciente') {
            cargarInscripciones();
        }
    }, []);

    // ==================== CANCELAR INSCRIPCIÓN ====================
    const cancelarInscripcion = async (idInscripcion) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar esta inscripción?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await API.delete(`/turnos/inscripciones/${idInscripcion}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.message || 'Inscripción cancelada');
            await cargarInscripciones();
            
            // Actualizar estado del historial
            const estadoRes = await API.get('/comandos/estado', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPuedeDeshacer(estadoRes.data.canUndo);
        } catch (err) {
            console.error('Error al cancelar:', err);
            toast.error(err.response?.data?.message || 'No se pudo cancelar la inscripción');
        }
    };

    // ==================== VER HISTORIA MÉDICA ====================
    const verHistoriaMedica = async (idInscripcion) => {
        setHistoriaModal({ open: true, data: null, loading: true, error: null });
        try {
            const token = localStorage.getItem('token');
            const response = await API.get(`/historia/inscripcion/${idInscripcion}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistoriaModal({ open: true, data: response.data, loading: false, error: null });
        } catch (err) {
            console.error('Error al obtener historia médica:', err);
            setHistoriaModal({
                open: true,
                data: null,
                loading: false,
                error: err.response?.data?.message || 'No se pudo cargar la historia médica'
            });
        }
    };

    const cerrarModal = () => {
        setHistoriaModal({ open: false, data: null, loading: false, error: null });
    };

    // ==================== DESHACER ÚLTIMA ACCIÓN ====================
    const deshacerUltimaAccion = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.post('/comandos/deshacer', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.message || 'Acción deshecha');
            await cargarInscripciones();
            
            // Actualizar estado del botón
            const estadoRes = await API.get('/comandos/estado', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPuedeDeshacer(estadoRes.data.canUndo);
        } catch (err) {
            console.error('Error al deshacer:', err);
            toast.error(err.response?.data?.message || 'No se pudo deshacer la acción');
        }
    };

    // ==================== RENDER ====================
    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando tus inscripciones...</p>
                </div>
            </div>
        );
    }

    if (inscripciones.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <ToastContainer position="top-center" autoClose={3000} />
                <div className="flex justify-end mb-4">
                    <button
                        onClick={deshacerUltimaAccion}
                        disabled={!puedeDeshacer}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition ${
                            puedeDeshacer
                                ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-icons text-base">undo</span>
                        Deshacer
                    </button>
                </div>
                <div className="text-center py-20">
                    <span className="material-icons text-6xl text-gray-400 mb-4">event_busy</span>
                    <p className="text-gray-500 text-lg">No estás inscrito en ningún turno</p>
                    <button
                        onClick={() => navigate('/turnos')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                        Ver turnos disponibles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <ToastContainer position="top-center" autoClose={3000} />

            {/* Botón Deshacer */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={deshacerUltimaAccion}
                    disabled={!puedeDeshacer}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition ${
                        puedeDeshacer
                            ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <span className="material-icons text-base">undo</span>
                    Deshacer
                </button>
            </div>

            <h3 className="text-4xl font-bold text-gray-900 mb-12">Mis Inscripciones</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {inscripciones.map((inscripcion) => {
                    const estadoInfo = getEstadoInfo(inscripcion.estado_turno);
                    return (
                        <div key={inscripcion.id_inscripcion} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <img
                                src={inscripcion.imagen}
                                alt="Turno médico"
                                className="w-full h-36 object-cover"
                            />
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {inscripcion.especialidad || 'Consulta médica'}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-700 mb-4 pb-3 border-b border-gray-100">
                                    <span className="material-icons text-gray-500">badge</span>
                                    <span className="font-medium">Dr/a. {inscripcion.medico_nombre}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                                    <span className="material-icons text-gray-500 text-base">calendar_today</span>
                                    <span>{inscripcion.fecha_formateada}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                    <span className="material-icons text-gray-500 text-base">schedule</span>
                                    <span>{inscripcion.hora_inicio_formateada} - {inscripcion.hora_fin_formateada}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-2">
                                    <span className="material-icons text-gray-500 text-base">{estadoInfo.icono}</span>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                                        {estadoInfo.texto}
                                    </span>
                                </div>

                                {inscripcion.estado_turno !== 'completado' ? (
                                    <button
                                        onClick={() => cancelarInscripcion(inscripcion.id_inscripcion)}
                                        className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 cursor-pointer"
                                    >
                                        Cancelar inscripción
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => verHistoriaMedica(inscripcion.id_inscripcion)}
                                        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons text-base">history</span>
                                        Ver historia médica
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Historia Médica */}
            {historiaModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Historia Médica</h2>
                            <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            {historiaModal.loading && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Cargando historia médica...</p>
                                </div>
                            )}
                            {historiaModal.error && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                                    {historiaModal.error}
                                </div>
                            )}
                            {historiaModal.data && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Síntomas</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{historiaModal.data.sintomas || 'No registrados'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Diagnóstico</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{historiaModal.data.diagnostico || 'No registrado'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Tratamiento</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{historiaModal.data.tratamiento || 'No indicado'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Receta</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{historiaModal.data.receta || 'No indicada'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Notas adicionales</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{historiaModal.data.notas || 'Sin notas'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Fecha de atención</h3>
                                        <p className="text-gray-600">{new Date(historiaModal.data.fecha_atencion).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};