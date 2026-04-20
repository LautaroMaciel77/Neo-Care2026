import { useState, useEffect } from "react";
import Icon from "../../components/Icon/Icon";
import API from '../../../services/axiosInstance';

export default function BuscarTurno() {
    const [seleccionada, setSeleccionada] = useState(null);
    const [search, setSearch] = useState("");
    const [filtroUbicacion, setFiltroUbicacion] = useState("");
    const [filtroContrato, setFiltroContrato] = useState("");
    const [ofertas, setOfertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [postulando, setPostulando] = useState(false);
    const [postulacionMensaje, setPostulacionMensaje] = useState(null);
    const [postulacionError, setPostulacionError] = useState(false);

    useEffect(() => {
        const obtenerOfertas = async () => {
            try {
                const response = await API.get('/ofertas');
                setOfertas(response.data);
                if (response.data.length > 0) {
                    setSeleccionada(response.data[0]);
                }
                setCargando(false);
            } catch (err) {
                console.error('Error al obtener ofertas:', err);
                setError('Error al cargar las ofertas. Por favor, inténtalo de nuevo más tarde.');
                setCargando(false);
            }
        };

        obtenerOfertas();
    }, []);

    /* const ubicaciones = [...new Set(ofertas.map((o) => o.ubicacion))]; */
    const contratos = [...new Set(ofertas.map((o) => o.tipo_contrato))];

    const ofertasFiltradas = ofertas.filter((oferta) => {
        const coincideTitulo = oferta.titulo.toLowerCase().includes(search.toLowerCase());
        const coincideUbicacion = filtroUbicacion
            ? oferta.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase())
            : true;
        const coincideContrato = filtroContrato ? oferta.tipo_contrato === filtroContrato : true;
        return coincideTitulo && coincideUbicacion && coincideContrato;
    });

    const handlePostularse = async () => {
        if (!seleccionada) return;

        setPostulando(true);
        setPostulacionMensaje(null);
        setPostulacionError(false);

        try {
            const response = await API.post('/postulaciones', {
                id_oferta: seleccionada.id_oferta
            });
            if (response.status === 201) {
                setPostulacionMensaje('¡Postulación realizada exitosamente!');
            } else {
                throw new Error(response.data.message || 'Error al postularse');
            }
        } catch (error) {
            console.error('Error postulando:', error);
            setPostulacionError(true);
            setPostulacionMensaje(
                error.response?.data?.message ||
                'Error al procesar la postulación'
            );
        } finally {
            setPostulando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg">Cargando ofertas...</p>
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

    if (ofertas.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-lg text-gray-700">No hay ofertas disponibles en este momento.</p>
                    <p className="text-gray-500 mt-2">Vuelve a intentarlo más tarde.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen container mx-auto py-10">
            {/* Columna izquierda - Lista de ofertas */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto px-4">
                {/* Input de búsqueda por título */}
                <div className="relative mb-4">
                    <label htmlFor="filtroEmpleo" className="block text-sm font-medium text-gray-700 mb-1">
                        Empleo:
                    </label>
                    <div className="relative">
                        <input
                            id="filtroEmpleo"
                            type="text"
                            placeholder="Buscar empleo..."
                            className="w-full py-2 pl-10 pr-4 border border-gray-400 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500">
                            <Icon name="search" />
                        </div>
                    </div>
                </div>

                {/* Filtro de ubicación tipo input */}
                <div className="mb-3">
                    <label htmlFor="filtroUbicacion" className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación:
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="filtroUbicacion"
                            placeholder="Buscar ubicación..."
                            value={filtroUbicacion}
                            onChange={(e) => setFiltroUbicacion(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-400 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500">
                            <Icon name="search" />
                        </div>
                    </div>
                </div>

                {/* Filtro por contrato tipo chip */}
                <p className="text-sm font-medium text-gray-700 mb-1">Tipo de contrato:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {contratos.map((tipo, idx) => (
                        <button
                            key={idx}
                            onClick={() => setFiltroContrato(filtroContrato === tipo ? "" : tipo)}
                            className={`px-3 py-1 rounded-full text-sm border transition ${filtroContrato === tipo
                                ? "bg-gray-800 text-white border-gray-800"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>

                {/* Lista de ofertas */}
                {ofertasFiltradas.map((oferta) => (
                    <div
                        key={oferta.id_oferta}
                        onClick={() => setSeleccionada(oferta)}
                        className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${seleccionada && seleccionada.id_oferta === oferta.id_oferta ? "bg-blue-100" : ""
                            }`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">{oferta.titulo}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Icon name="pointmap" /> {oferta.ubicacion} · {oferta.tipo_contrato}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Publicado el {new Date(oferta.fecha_publicacion).toLocaleDateString('sv-SE').replaceAll('-', '/')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Columna derecha - Detalle de oferta */}
            {seleccionada && (
                <div className="w-2/3 p-8 overflow-y-auto">
                    <h3 className="text-4xl font-bold text-gray-900 mb-8">{seleccionada.titulo}</h3>
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <p className="flex items-center gap-1">
                            <Icon name="calendar" /> Publicación: {new Date(seleccionada.fecha_publicacion).toLocaleDateString('sv-SE').replaceAll('-', '/')}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="pointmap" /> {seleccionada.ubicacion}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="folder" /> Tipo de contrato: {seleccionada.tipo_contrato}
                        </p>
                        <p className="flex items-center gap-1">
                            <Icon name="money" /> Salario: <b>${seleccionada.salario}</b>
                        </p>
                    </div>
                    <hr className="my-4" />
                    <p className="text-gray-700 leading-relaxed mb-8">{seleccionada.descripcion}</p>

                    <button
                        onClick={handlePostularse}
                        disabled={postulando}
                        className={`${postulando
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-900 hover:cursor-pointer'
                            } text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-2xl`}
                    >
                        {postulando ? 'Postulando...' : 'Postularme'}
                    </button>

                    {postulacionMensaje && (
                        <div className={`mt-4 p-3 rounded-lg ${postulacionError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {postulacionMensaje}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
