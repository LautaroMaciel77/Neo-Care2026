import { useState } from 'react';
import API from '../../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PublicarEmpleo.css';

export default function PublicarEmpleo() {
    const [formData, setFormData] = useState({
        fecha: '',
        hora_inicio: '',
        hora_fin: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key], formData);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            toast.error('Por favor corrige los errores del formulario');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            
            if (!token) {
                toast.error('Debes iniciar sesión para publicar un turno.');
                navigate('/login');
                return;
            }

            if (userRole !== 'medico') {
                toast.error('Solo los médicos pueden publicar turnos.');
                navigate('/publicar-empleo');
                return;
            }

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

            console.log('Turno publicado:', response.data);
            toast.success('¡Turno publicado exitosamente!');

            // Limpiar formulario después de publicar
            setFormData({
                fecha: '',
                hora_inicio: '',
                hora_fin: ''
            });

            setTimeout(() => navigate('/publicar-empleo'), 2000);

        } catch (error) {
            console.error('Error al publicar turno:', error);
            if (error.response) {
                toast.error('Error: ' + (error.response.data.message || 'Error desconocido'));
            } else {
                toast.error('Error: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Formatear fecha para mostrar
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    };

    // Clase para inputs
    const getInputClass = (field) => {
        let baseClass = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";
        
        if (formErrors[field]) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        
        if (formData[field]) {
            return `${baseClass} border-green-500 bg-green-50`;
        }
        
        return `${baseClass} border-gray-300 bg-white hover:border-gray-400`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <ToastContainer />
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h3 className="text-4xl font-bold text-gray-800 mb-2">Publicar Turno Médico</h3>
                    <p className="text-gray-600">Selecciona la fecha y hora para tu disponibilidad</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
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
                            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
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
                                }}
                                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                            >
                                Limpiar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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