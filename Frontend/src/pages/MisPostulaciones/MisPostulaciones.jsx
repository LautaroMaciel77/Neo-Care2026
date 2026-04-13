import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance';

export const MisPostulaciones = () => {
    const [postulaciones, setPostulaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    
    const imagenes = ['JB-pink.jpg', 'JB-blue.jpg', 'JB-green.jpg'];

    useEffect(() => {
        const obtenerPostulaciones = async () => {
            try {
                const response = await API.get('/postulaciones');
                
                // Agregar imagen aleatoria a cada postulación
                const postulacionesConImagen = response.data.map(post => ({
                    ...post,
                    imagen: imagenes[Math.floor(Math.random() * imagenes.length)]
                }));
                
                setPostulaciones(postulacionesConImagen);
                setCargando(false);
            } catch (err) {
                console.error('Error al obtener postulaciones:', err);
                setError('Error al cargar tus postulaciones');
                setCargando(false);
            }
        };

        obtenerPostulaciones();
    }, []);

    const eliminarPostulacion = async (idPostulacion) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta postulación?')) {
            return;
        }

        try {
            await API.delete(`/postulaciones/${idPostulacion}`);
            setPostulaciones(postulaciones.filter(p => p.id_postulacion !== idPostulacion));
        } catch (err) {
            console.error('Error al eliminar postulación:', err);
            alert('No se pudo eliminar la postulación');
        }
    };

    if (cargando) return <p className="text-center mt-10 text-gray-600">Cargando postulaciones...</p>;
    if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
    if (postulaciones.length === 0) return <p className="text-center mt-10 text-gray-600">No tienes postulaciones</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h3 className="text-5xl font-bold text-gray-900 mb-16">Mis Postulaciones</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {postulaciones.map(post => (
                    <div key={post.id_postulacion} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <img
                            src={post.imagen}
                            alt="Fondo de postulación"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                {post.titulo_oferta}
                            </h3>
                            <p className="text-gray-700 text-sm mb-1">
                                {post.nombre_empresa}
                            </p>
                            <div className="flex justify-between text-gray-600 text-sm mb-1">
                                <span>Fecha: {new Date(post.fecha_postulacion).toLocaleDateString('es-ES')}</span>
                                <span className={`font-semibold ${
                                    post.estado === 'Aceptada' ? 'text-green-600' : 
                                    post.estado === 'Rechazada' ? 'text-red-600' : 
                                    'text-yellow-600'
                                }`}>
                                    {post.estado}
                                </span>
                            </div>
                            
                            <button
                                onClick={() => eliminarPostulacion(post.id_postulacion)}
                                className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                            >
                                Eliminar postulación
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};