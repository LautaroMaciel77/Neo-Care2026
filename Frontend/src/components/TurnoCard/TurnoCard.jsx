// components/TurnoCard/TurnoCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TurnoCard = ({ id_oferta, img, especialidad, fecha, hora_inicio, hora_fin }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/buscar-turno', { state: { ofertaId: id_oferta } });
    };

    // Formatear fecha
    const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-AR') : 'Fecha a confirmar';
    
    // Formatear hora
    const formatearHora = (horaISO) => {
        if (!horaISO) return '--:--';
        const fecha = new Date(horaISO);
        return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const horaInicioFormateada = formatearHora(hora_inicio);
    const horaFinFormateada = formatearHora(hora_fin);
    const horarioFormateado = `${horaInicioFormateada} - ${horaFinFormateada}`;

    return (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div onClick={handleClick} className="cursor-pointer">
                <img 
                    className="rounded-t-lg w-full h-56 object-cover" 
                    src={`/images/${img}`} 
                    alt={especialidad}
                    onError={(e) => {
                        e.target.src = '/images/JB-pink.jpg';
                    }}
                />
            </div>
            <div className="p-5">
                <div onClick={handleClick} className="cursor-pointer">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                        {especialidad || 'Turno médico'}
                    </h5>
                </div>
                
                <div className="mb-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{fechaFormateada}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{horarioFormateado}</span>
                    </div>
                </div>

                <button
                    onClick={handleClick}
                    className="inline-flex w-full justify-center items-center mt-4 px-4 py-2 font-semibold text-lg hover:text-white text-blue-400 hover:bg-blue-500 border border-blue-400 hover:border-transparent rounded-lg transition-all duration-300"
                >
                    Ver más
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </button>
            </div>
        </div>
    );
};