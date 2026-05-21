import { useState, useEffect } from "react";
import Icon from "../../components/Icon/Icon";
import API from '../../../services/axiosInstance';
import { useLocation } from 'react-router-dom';

export default function BuscarTurno() {
    const [seleccionado, setSeleccionado] = useState(null);
    const [search, setSearch] = useState("");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const [turnos, setTurnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [inscripcionMensaje, setInscripcionMensaje] = useState(null);
    const [inscripcionError, setInscripcionError] = useState(false);

    const location = useLocation();
    const turnoIdDesdeLink = location.state?.turnoId;

    // Cargar turnos desde la API (ruta pública)
    useEffect(() => {
        const obtenerTurnos = async () => {
            try {
                const response = await API.get('/turnos');
                setTurnos(response.data);
                setCargando(false);
            } catch (err) {
                console.error('Error al obtener turnos:', err);
                setError('Error al cargar los turnos. Por favor, inténtalo de nuevo más tarde.');
                setCargando(false);
            }
        };

        obtenerTurnos();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Seleccionar turno desde navegación o default
    useEffect(() => {
        if (turnos.length > 0) {
            if (turnoIdDesdeLink) {
                const encontrado = turnos.find((t) => String(t.id_turno) === String(turnoIdDesdeLink));
                setSeleccionado(encontrado || turnos[0]);
            } else {
                setSeleccionado(turnos[0]);
            }
        }
    }, [turnos, turnoIdDesdeLink]);

    const especialidades = [...new Set(turnos.map((t) => t.especialidad).filter(Boolean))];

    const turnosFiltrados = turnos.filter((turno) => {
        const coincideEspecialidad = turno.especialidad?.toLowerCase().includes(search.toLowerCase()) || 
                                      turno.medico_nombre?.toLowerCase().includes(search.toLowerCase());
        const coincideFiltroEspecialidad = filtroEspecialidad
            ? turno.especialidad === filtroEspecialidad
            : true;
        const coincideFecha = filtroFecha
            ? turno.fecha === filtroFecha
            : true;
        return coincideEspecialidad && coincideFiltroEspecialidad && coincideFecha;
    });

    const handleInscribirse = async () => {
        if (!seleccionado) return;
    
        setInscribiendo(true);
        setInscripcionMensaje(null);
        setInscripcionError(false);
    
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Existe' : 'NO HAY TOKEN');
            console.log('ID del turno:', seleccionado.id_turno);
            
            const response = await API.post(`/turnos/${seleccionado.id_turno}/inscribirse`);
            
            console.log('Respuesta:', response);
            
            if (response.status === 201) {
                setInscripcionMensaje('¡Inscripción exitosa!');
                setTurnos(turnos.map(t => 
                    t.id_turno === seleccionado.id_turno 
                        ? { ...t, estado: 'ocupado' }
                        : t
                ));
                setTimeout(() => setInscripcionMensaje(null), 3000);
            }
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            
            setInscripcionError(true);
            setInscripcionMensaje(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Error al procesar la inscripción'
            );
        } finally {
            setInscribiendo(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg">Cargando turnos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md text-center">
                    <p className="font-bold text-xl mb-2">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (turnos.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-lg text-gray-700">No hay turnos disponibles en este momento.</p>
                    <p className="text-gray-500 mt-2">Vuelve a intentarlo más tarde.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen container mx-auto py-10">
            {/* Columna izquierda - Lista de turnos */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto px-4">
                <div className="relative mb-4">
                    <label htmlFor="filtroTurno" className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar turno:
                    </label>
                    <div className="relative">
                        <input
                            id="filtroTurno"
                            type="text"
                            placeholder="Buscar por especialidad o médico..."
                            className="w-full py-2 pl-10 pr-4 border border-gray-400 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500">
                            <Icon name="search" />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="filtroEspecialidad" className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad:
                    </label>
                    <select
                        id="filtroEspecialidad"
                        value={filtroEspecialidad}
                        onChange={(e) => setFiltroEspecialidad(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-400 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <option value="">Todas las especialidades</option>
                        {especialidades.map((esp, idx) => (
                            <option key={idx} value={esp}>{esp}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="filtroFecha" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha:
                    </label>
                    <input
                        type="date"
                        id="filtroFecha"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-400 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>

                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Turnos disponibles:</p>
                    {turnosFiltrados.map((turno) => (
                        <div
                            key={turno.id_turno}
                            onClick={() => turno.estado === 'disponible' && setSeleccionado(turno)}
                            className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-blue-50 
                                ${seleccionado && seleccionado.id_turno === turno.id_turno ? "bg-blue-100" : ""}
                                ${turno.estado !== 'disponible' ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}
                            `}
                        >
                            <h3 className="text-lg font-semibold text-gray-800">
                                {turno.especialidad || 'Consulta médica'}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Icon name="calendar" /> {new Date(turno.fecha).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Icon name="clock" /> {turno.hora_inicio} - {turno.hora_fin}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Dr/a. {turno.medico_nombre}
                            </p>
                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                turno.estado === 'disponible' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {turno.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna derecha - Detalle del turno */}
            {seleccionado && (
                <div className="w-2/3 p-8 overflow-y-auto">
                    <h3 className="text-4xl font-bold text-gray-900 mb-8">
                        Turno con {seleccionado.medico_nombre}
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <p className="flex items-center gap-1">
                            <Icon name="stethoscope" /> Especialidad: {seleccionado.especialidad}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="calendar" /> Fecha: {new Date(seleccionado.fecha).toLocaleDateString('es-ES')}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="clock" /> Horario: {seleccionado.hora_inicio} - {seleccionado.hora_fin}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="pointmap" /> Ubicación: {seleccionado.nombre_localidad || 'No especificada'}, {seleccionado.nombre_provincia || ''}
                        </p>
                    </div>
                    <hr className="my-4" />
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Información del médico</h4>
                        <p className="text-gray-700">📧 {seleccionado.medico_email}</p>
                        <p className="text-gray-700">📞 {seleccionado.medico_telefono || 'No disponible'}</p>
                    </div>

                    {seleccionado.estado === 'disponible' ? (
                        <button
                            onClick={handleInscribirse}
                            disabled={inscribiendo}
                            className={`${inscribiendo
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer'
                                } text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-2xl`}
                        >
                            {inscribiendo ? 'Inscribiendo...' : 'Inscribirme'}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="bg-gray-400 cursor-not-allowed text-white px-8 py-4 rounded-lg text-lg font-semibold"
                        >
                            Turno no disponible
                        </button>
                    )}

                    {inscripcionMensaje && (
                        <div className={`mt-4 p-3 rounded-lg ${inscripcionError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {inscripcionMensaje}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}