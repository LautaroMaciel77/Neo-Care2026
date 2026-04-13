import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    // Campos base de usuario
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    // Rol seleccionado
    rol: '',
    // Campos específicos para médico
    especialidad: '',
    especialidadPersonalizada: '',
    // Campos específicos para paciente
    fecha_nacimiento: '',
    alergias: ''
  });

  const [edadCalculada, setEdadCalculada] = useState(null);
  const [errores, setErrores] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: ''
  });

  const [especialidadesPredefinidas] = useState([
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Ginecología',
    'Traumatología',
    'Neurología',
    'Oftalmología',
    'Otorrinolaringología',
    'Psiquiatría',
    'Radiología',
    'Anestesiología',
    'Cirugía General',
    'Medicina Interna',
    'Medicina Familiar',
    'Oncología'
  ]);

  const [mostrarInputPersonalizado, setMostrarInputPersonalizado] = useState(false);

  // Función para calcular edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Validar que solo contenga letras y espacios
  const validarSoloLetras = (texto) => {
    const regex = /^[a-zA-ZáéíóúñÑüÜ\s]*$/;
    return regex.test(texto);
  };

  // Validar teléfono (solo números)
  const validarTelefono = (telefono) => {
    const regex = /^\d*$/;
    return regex.test(telefono);
  };

  // Validar email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validar contraseña (mínimo 6 caracteres)
  const validarPassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevoValue = value;
    let error = '';

    // Validaciones en tiempo real
    if (name === 'nombre') {
      if (!validarSoloLetras(value) && value !== '') {
        error = 'El nombre solo puede contener letras y espacios';
      } else {
        nuevoValue = value.replace(/[^a-zA-ZáéíóúñÑüÜ\s]/g, '');
      }
    }

    if (name === 'telefono') {
      if (!validarTelefono(value) && value !== '') {
        error = 'El teléfono solo puede contener números';
      } else {
        nuevoValue = value.replace(/\D/g, '');
        if (nuevoValue.length > 15) nuevoValue = nuevoValue.slice(0, 15);
      }
    }

    if (name === 'email') {
      if (value !== '' && !validarEmail(value)) {
        error = 'Ingresa un email válido (ejemplo@dominio.com)';
      }
    }

    if (name === 'password') {
      if (value !== '' && !validarPassword(value)) {
        error = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrores(prev => ({
      ...prev,
      [name]: error
    }));

    setFormData({
      ...formData,
      [name]: nuevoValue,
    });

    // Calcular edad cuando cambia la fecha de nacimiento
    if (name === 'fecha_nacimiento' && value) {
      const edad = calcularEdad(value);
      setEdadCalculada(edad);
    }

    // Si selecciona "otro" en especialidad, mostrar input personalizado
    if (name === 'especialidad' && value === 'otro') {
      setMostrarInputPersonalizado(true);
    } else if (name === 'especialidad' && value !== 'otro') {
      setMostrarInputPersonalizado(false);
      setFormData(prev => ({
        ...prev,
        especialidadPersonalizada: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales
    if (!formData.nombre.trim()) {
      toast.error('Por favor ingresa tu nombre completo');
      return;
    }

    if (!validarSoloLetras(formData.nombre)) {
      toast.error('El nombre solo puede contener letras y espacios');
      return;
    }

    if (!formData.email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    if (!validarEmail(formData.email)) {
      toast.error('Ingresa un email válido');
      return;
    }

    if (!formData.telefono) {
      toast.error('Por favor ingresa tu teléfono');
      return;
    }

    if (!validarTelefono(formData.telefono)) {
      toast.error('El teléfono solo puede contener números');
      return;
    }

    if (!formData.password) {
      toast.error('Por favor ingresa una contraseña');
      return;
    }

    if (!validarPassword(formData.password)) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.rol) {
      toast.error('Por favor selecciona un rol (Médico o Paciente)');
      return;
    }

    // Validaciones específicas por rol
    if (formData.rol === 'paciente') {
      if (!formData.fecha_nacimiento) {
        toast.error('Por favor ingresa tu fecha de nacimiento');
        return;
      }
      
      const edad = calcularEdad(formData.fecha_nacimiento);
      if (edad < 0 || edad > 150) {
        toast.error('Fecha de nacimiento inválida');
        return;
      }
    }

    try {
      // 1. Registrar usuario base
      const usuarioData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono
      };

      const usuarioResponse = await API.post('/auth/registerUsuario', usuarioData);
      const { id_usuario } = usuarioResponse.data;

      // 2. Registrar según el rol seleccionado
      if (formData.rol === 'medico') {
        // Determinar la especialidad final (seleccionada o personalizada)
        let especialidadFinal = '';
        if (formData.especialidad === 'otro') {
          if (!formData.especialidadPersonalizada.trim()) {
            toast.error('Por favor ingresa el nombre de tu especialidad');
            return;
          }
          especialidadFinal = formData.especialidadPersonalizada.trim();
        } else {
          if (!formData.especialidad) {
            toast.error('Por favor selecciona una especialidad');
            return;
          }
          especialidadFinal = formData.especialidad;
        }

        await API.post('/auth/registerMedico', {
          id_usuario: id_usuario,
          especialidad: especialidadFinal
        });
        
        toast.success('Médico registrado exitosamente');
        
      } else if (formData.rol === 'paciente') {
        const edad = calcularEdad(formData.fecha_nacimiento);
        
        await API.post('/auth/registerPaciente', {
          id_usuario: id_usuario,
          edad: edad,
          alergias: formData.alergias || null
        });
        
        toast.success('Paciente registrado exitosamente');
      }

      // Redirigir al login después de 2.5 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);

    } catch (error) {
      console.error('Error al registrar:', error);
      if (error.response) {
        toast.error('Error: ' + (error.response.data.message || 'Error desconocido'));
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="form-box overflow-y-scroll h-[650px]">
      <ToastContainer />
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        {/* Campos comunes para todos los usuarios */}
        <div className="input-group">
          <label htmlFor="register-nombre">Nombre completo</label>
          <input
            type="text"
            id="register-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo (solo letras)"
            required
            className={`border ${errores.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
          />
          {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}
        </div>

        <div className="input-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            type="email"
            id="register-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@email.com"
            required
            className={`border ${errores.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
          />
          {errores.email && <small className="text-red-500">{errores.email}</small>}
        </div>

        <div className="input-group">
          <label htmlFor="register-telefono">Teléfono</label>
          <input
            type="tel"
            id="register-telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Solo números (ej: 123456789)"
            required
            className={`border ${errores.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
          />
          {errores.telefono && <small className="text-red-500">{errores.telefono}</small>}
          <small className="text-gray-500">Máximo 15 dígitos</small>
        </div>

        <div className="input-group">
          <label htmlFor="register-password">Contraseña</label>
          <input
            type="password"
            id="register-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            required
            className={`border ${errores.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
          />
          {errores.password && <small className="text-red-500">{errores.password}</small>}
        </div>

        <div className="input-group">
          <label htmlFor="register-confirm">Confirmar contraseña</label>
          <input
            type="password"
            id="register-confirm"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirma tu contraseña"
            required
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Selección de rol */}
        <div className="input-group flex justify-center gap-10">
          <div>
            <input
              type="radio"
              id="medico"
              name="rol"
              value="medico"
              checked={formData.rol === 'medico'}
              onChange={handleChange}
              required
            />
            <label htmlFor="medico">Médico</label>
          </div>
          <div>
            <input
              type="radio"
              id="paciente"
              name="rol"
              value="paciente"
              checked={formData.rol === 'paciente'}
              onChange={handleChange}
              required
            />
            <label htmlFor="paciente">Paciente</label>
          </div>
        </div>

        {/* Campos específicos para médicos */}
        {formData.rol === 'medico' && (
          <>
            <div className="input-group">
              <label htmlFor="especialidad">Especialidad</label>
              <select
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              >
                <option value="">Selecciona una especialidad</option>
                {especialidadesPredefinidas.map((esp, index) => (
                  <option key={index} value={esp}>
                    {esp}
                  </option>
                ))}
                <option value="otro">Otro (Ingresar especialidad)</option>
              </select>
            </div>

            {mostrarInputPersonalizado && (
              <div className="input-group">
                <label htmlFor="especialidadPersonalizada">Especifica tu especialidad</label>
                <input
                  type="text"
                  id="especialidadPersonalizada"
                  name="especialidadPersonalizada"
                  value={formData.especialidadPersonalizada}
                  onChange={handleChange}
                  placeholder="Ej: Medicina Deportiva, Genética, etc."
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
                <small className="text-gray-500">Ingresa el nombre de tu especialidad médica</small>
              </div>
            )}
          </>
        )}

        {/* Campos específicos para pacientes */}
        {formData.rol === 'paciente' && (
          <>
            <div className="input-group">
              <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              {formData.fecha_nacimiento && (
                <small className="text-green-600">
                  Edad calculada: {calcularEdad(formData.fecha_nacimiento)} años
                </small>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="alergias">Alergias</label>
              <textarea
                id="alergias"
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                placeholder="Describe tus alergias (si tienes)"
                rows="3"
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              <small className="text-gray-500">Opcional: Especifica cualquier alergia que tengas</small>
            </div>
          </>
        )}

        <button type="submit" className="button alt-button">
          Crear Cuenta
        </button>

        <div className="form-footer">
          ¿Ya tienes una cuenta? <a href="#" modalType="login">Inicia sesión</a>
        </div>
      </form>
    </div>
  );
};