import { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PublicarTurno() {
    const [formData, setFormData] = useState({
        fecha: '',
        hora_inicio: '',
        hora_fin: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Verificar autenticación y rol al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            toast.error('🔒 Debes iniciar sesión para acceder a esta página');
            setTimeout(() => navigate('/'), 2000);
            return;
        }
        
        if (userRole !== 'medico') {
            toast.warning('👨‍⚕️ Esta sección es solo para médicos');
            setTimeout(() => navigate('/'), 2500);
        }
    }, [navigate]);

    // Generar opciones de horas cada 30 minutos
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

    const validateField = (name, value, allData) => {
        let error = '';

        if (name === 'fecha') {
            if (!value) {
                error = 'La fecha es obligatoria';
            } else {
                const fechaSeleccionada = new Date(value);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                
                if (fechaSeleccionada < hoy) {
                    error = 'La fecha no puede ser anterior a hoy';
                }
            }
        }

        if (name === 'hora_inicio') {
            if (!value) {
                error = 'La hora de inicio es obligatoria';
            }
        }

        if (name === 'hora_fin') {
            if (!value) {
                error = 'La hora de fin es obligatoria';
            } else if (allData.hora_inicio && value <= allData.hora_inicio) {
                error = 'La hora de fin debe ser mayor a la hora de inicio';
            }
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value, formData);
        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (name === 'hora_inicio' && formData.hora_fin) {
            const horaFinError = validateField('hora_fin', formData.hora_fin, { ...formData, hora_inicio: value });
            setFormErrors(prev => ({
                ...prev,
                hora_fin: horaFinError
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            toast.error('🔒 Sesión expirada. Por favor, inicia sesión nuevamente.');
            setTimeout(() => navigate('/'), 1500);
            return;
        }

        if (userRole !== 'medico') {
            toast.error('👨‍⚕️ Acceso denegado. Solo los médicos pueden publicar turnos.');
            setTimeout(() => navigate('/'), 1500);
            return;
        }

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key], formData);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            toast.error('❌ Por favor corrige los errores del formulario');
            return;
        }

        setIsLoading(true);

        try {
            const { fecha, hora_inicio, hora_fin } = formData;

            const response = await API.post('/turnos',
                {
                    fecha,
                    hora_inicio,
                    hora_fin,
                    estado: 'disponible'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success('✅ ¡Turno publicado exitosamente!');

            setFormData({
                fecha: '',
                hora_inicio: '',
                hora_fin: ''
            });

            setTimeout(() => navigate('/mis-publicaciones'), 2000);

        } catch (error) {
            console.error('Error al publicar turno:', error);
            
            if (error.response) {
                const errorMessage = error.response.data.message || 'Error desconocido';
                
                if (error.response.status === 401) {
                    toast.error('🔒 Token inválido o expirado. Por favor, inicia sesión nuevamente.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    setTimeout(() => navigate('/'), 2000);
                } else if (error.response.status === 403) {
                    toast.error('⛔ No tienes permisos para realizar esta acción.');
                } else {
                    toast.error(`❌ Error: ${errorMessage}`);
                }
            } else if (error.request) {
                toast.error('🌐 Error de conexión. Verifica tu internet.');
            } else {
                toast.error('❌ Error: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    };

    const getInputClass = (field) => {
        let baseClass = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500";
        
        if (formErrors[field]) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        
        if (formData[field]) {
            return `${baseClass} border-green-500 bg-green-50`;
        }
        
        return `${baseClass} border-gray-300 bg-white`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
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
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h3 className="text-4xl font-bold text-gray-800 mb-2">Publicar Turno Médico</h3>
                    <p className="text-gray-600">Selecciona la fecha y hora para tu disponibilidad</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Fecha */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                📅 Fecha del turno
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={getInputClass('fecha')}
                                required
                            />
                            {formErrors.fecha && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.fecha}</p>
                            )}
                            {formData.fecha && !formErrors.fecha && (
                                <p className="text-green-600 text-sm mt-1">
                                    ✓ Fecha seleccionada: {formatearFecha(formData.fecha)}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Hora de inicio */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    🕐 Hora de inicio
                                </label>
                                <select
                                    name="hora_inicio"
                                    value={formData.hora_inicio}
                                    onChange={handleChange}
                                    className={getInputClass('hora_inicio')}
                                    required
                                >
                                    <option value="">Seleccionar hora</option>
                                    {horasDisponibles.map((hora) => (
                                        <option key={`inicio-${hora}`} value={hora}>
                                            {hora}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.hora_inicio && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.hora_inicio}</p>
                                )}
                            </div>

                            {/* Hora de fin */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    🕐 Hora de fin
                                </label>
                                <select
                                    name="hora_fin"
                                    value={formData.hora_fin}
                                    onChange={handleChange}
                                    className={getInputClass('hora_fin')}
                                    required
                                >
                                    <option value="">Seleccionar hora</option>
                                    {horasDisponibles.map((hora) => (
                                        <option key={`fin-${hora}`} value={hora}>
                                            {hora}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.hora_fin && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.hora_fin}</p>
                                )}
                            </div>
                        </div>

                        {/* Resumen del turno */}
                        {formData.fecha && formData.hora_inicio && formData.hora_fin && 
                         !formErrors.fecha && !formErrors.hora_inicio && !formErrors.hora_fin && (
                            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-semibold text-blue-800 mb-2">📋 Resumen del turno:</p>
                                <p className="text-gray-700">
                                    Turno agendado para el <span className="font-bold">{formatearFecha(formData.fecha)}</span>
                                    <br />
                                    Horario: <span className="font-bold">{formData.hora_inicio}</span> a <span className="font-bold">{formData.hora_fin}</span>
                                </p>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        fecha: '',
                                        hora_inicio: '',
                                        hora_fin: ''
                                    });
                                    setFormErrors({});
                                    toast.info('🧹 Formulario limpiado');
                                }}
                                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Limpiar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Publicando...' : 'Publicar Turno'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}