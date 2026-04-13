import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const MisOfertas = () => {
    const [turnos, setTurnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const coloresEstado = {
        disponible: 'bg-green-100 text-green-800',
        ocupado: 'bg-yellow-100 text-yellow-800',
        cancelado: 'bg-red-100 text-red-800',
        completado: 'bg-blue-100 text-blue-800'
    };

    useEffect(() => {
        obtenerMisTurnos();
    }, []);

    const obtenerMisTurnos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Debes iniciar sesión para ver tus turnos');
                setCargando(false);
                return;
            }

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
            setError('Error al cargar tus turnos');
            setCargando(false);
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
        } catch (err) {
            console.error('Error al cancelar turno:', err);
            toast.error('No se pudo cancelar el turno');
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
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando tus turnos...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="text-center text-red-600 mt-10 p-4 bg-red-50 rounded-lg max-w-md mx-auto">
            <p>{error}</p>
            <button 
                onClick={obtenerMisTurnos}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Reintentar
            </button>
        </div>
    );
    
    const turnosDisponibles = turnos.filter(t => t.estado !== 'cancelado');
    
    if (turnosDisponibles.length === 0) return (
        <div className="text-center mt-10 p-8 bg-gray-50 rounded-lg max-w-md mx-auto">
            <p className="text-gray-600 mb-4">No has creado ningún turno disponible.</p>
            <button 
                onClick={() => window.location.href = '/publicar-empleo'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Publicar mi primer turno
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <ToastContainer />
            <h3 className="text-5xl font-bold text-gray-900 mb-16">Mis Turnos Publicados</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {turnosDisponibles.map((turno) => (
                    <div key={turno.id_turno} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 flex items-center justify-center">
                            <div className="text-center text-white">
                                <p className="text-2xl font-bold">{formatearFecha(turno.fecha)}</p>
                                <p className="text-lg">{formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}</p>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${coloresEstado[turno.estado] || 'bg-gray-100 text-gray-800'}`}>
                                    {getEstadoTexto(turno.estado)}
                                </span>
                            </div>
                            
                            {turno.paciente_nombre && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 font-semibold">Paciente asignado:</p>
                                    <p className="text-gray-800">{turno.paciente_nombre}</p>
                                    {turno.paciente_email && (
                                        <p className="text-xs text-gray-500 mt-1">{turno.paciente_email}</p>
                                    )}
                                    {turno.alergias && (
                                        <p className="text-xs text-red-600 mt-1">Alergias: {turno.alergias}</p>
                                    )}
                                </div>
                            )}
                            
                            <div className="mb-4 text-sm text-gray-600">
                                <p>📅 Fecha: {formatearFecha(turno.fecha)}</p>
                                <p>🕐 Horario: {formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}</p>
                            </div>
                            
                            {turno.estado === 'disponible' && (
                                <button
                                    onClick={() => cancelarTurno(turno.id_turno)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                                >
                                    Cancelar turno
                                </button>
                            )}
                            
                            {turno.estado === 'ocupado' && (
                                <button
                                    disabled
                                    className="w-full bg-gray-400 cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg"
                                >
                                    Turno ocupado
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};