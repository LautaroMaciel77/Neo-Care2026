import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance';

export const MisInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    
    const imagenes = ['JB-pink.jpg', 'JB-blue.jpg', 'JB-green.jpg'];

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
        switch(estado) {
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

    useEffect(() => {
        const obtenerInscripciones = async () => {
            try {
                const response = await API.get('/turnos/mis-inscripciones');
                
                const inscripcionesConImagen = response.data.map(inscripcion => ({
                    ...inscripcion,
                    imagen: imagenes[Math.floor(Math.random() * imagenes.length)],
                    hora_inicio_formateada: formatearHora(inscripcion.hora_inicio),
                    hora_fin_formateada: formatearHora(inscripcion.hora_fin),
                    fecha_formateada: formatearFecha(inscripcion.fecha_turno)
                }));
                
                setInscripciones(inscripcionesConImagen);
                setCargando(false);
            } catch (err) {
                console.error('Error al obtener inscripciones:', err);
                setError('Error al cargar tus inscripciones');
                setCargando(false);
            }
        };

        obtenerInscripciones();
    }, []);

    const cancelarInscripcion = async (idInscripcion) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar esta inscripción?')) {
            return;
        }

        try {
            await API.delete(`/turnos/inscripciones/${idInscripcion}`);
            setInscripciones(inscripciones.filter(i => i.id_inscripcion !== idInscripcion));
        } catch (err) {
            console.error('Error al cancelar inscripción:', err);
            alert('No se pudo cancelar la inscripción');
        }
    };

    if (cargando) return <p className="text-center mt-10 text-gray-600">Cargando tus inscripciones...</p>;
    if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
    if (inscripciones.length === 0) return <p className="text-center mt-10 text-gray-600">No estás inscrito en ningún turno</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h3 className="text-4xl font-bold text-gray-900 mb-12">Mis Inscripciones</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {inscripciones.map(inscripcion => {
                    const estadoInfo = getEstadoInfo(inscripcion.estado_turno);
                    
                    return (
                        <div key={inscripcion.id_inscripcion} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <img
                                src={inscripcion.imagen}
                                alt="Turno médico"
                                className="w-full h-36 object-cover"
                            />
                            <div className="p-5">
                                {/* Especialidad */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {inscripcion.especialidad || 'Consulta médica'}
                                </h3>
                                
                                {/* Médico */}
                                <div className="flex items-center gap-2 text-gray-700 mb-4 pb-3 border-b border-gray-100">
                                    <span className="material-icons text-gray-500">badge</span>
                                    <span className="font-medium">Dr/a. {inscripcion.medico_nombre}</span>
                                </div>
                                
                                {/* Fecha */}
                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                                    <span className="material-icons text-gray-500 text-base">calendar_today</span>
                                    <span>{inscripcion.fecha_formateada}</span>
                                </div>
                                
                                {/* Horario */}
                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                    <span className="material-icons text-gray-500 text-base">schedule</span>
                                    <span>{inscripcion.hora_inicio_formateada} - {inscripcion.hora_fin_formateada}</span>
                                </div>
                                
                                {/* Estado */}
                                <div className="flex items-center gap-2 mt-3 pt-2">
                                    <span className="material-icons text-gray-500 text-base">{estadoInfo.icono}</span>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                                        {estadoInfo.texto}
                                    </span>
                                </div>
                                
                                {/* Botón cancelar */}
                                <button
                                    onClick={() => cancelarInscripcion(inscripcion.id_inscripcion)}
                                    className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 cursor-pointer"
                                >
                                    Cancelar inscripción
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};