import React, { useState, useEffect } from 'react';
import API from '../../../services/axiosInstance.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    direccion: '',
    rol: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    genero: '',
    nombre_empresa: '',
    descripcion_empresa: '',
    id_localidad: ''
  });

  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const response = await API.get('/localidades');
        setLocalidades(response.data);
      } catch (error) {
        console.error('Error al cargar localidades:', error);
      }
    };

    fetchLocalidades();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const { email, password, direccion, rol } = formData;

      const response = await API.post('/auth/registerUsuario', {
        email,
        password,
        direccion,
      });

      const { id_usuario } = response.data;

      if (rol === 'candidato') {
        await API.post('/auth/registerEmpleado', {
          nombre: formData.nombre,
          apellido: formData.apellido,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          id_usuario: id_usuario,
          preferencia_empleo: '',
          curriculum: '',
          desc_habilidad: ''
        });
        toast.success('Candidato registrado exitosamente');
      } else if (rol === 'empleador') {
        await API.post('/auth/registerEmpleador', {
          nombre_empresa: formData.nombre_empresa,
          descripcion_empresa: formData.descripcion_empresa,
          id_usuario: id_usuario,
          id_localidad: formData.id_localidad
        });
        toast.success('Empleador registrado exitosamente');
      }

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
          />
        </div>

        <div className="input-group">
          <label htmlFor="register-direccion">Dirección</label>
          <input
            type="text"
            id="register-direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Tu dirección completa"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="register-password">Contraseña</label>
          <input
            type="password"
            id="register-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Crea una contraseña"
            required
          />
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
          />
        </div>

        <div className="input-group flex justify-center gap-10">
          <div>
            <input
              type="radio"
              id="candidato"
              name="rol"
              value="candidato"
              checked={formData.rol === 'candidato'}
              onChange={handleChange}
              required
            />
            <label htmlFor="candidato">Candidato</label>
          </div>
          <div>
            <input
              type="radio"
              id="empleador"
              name="rol"
              value="empleador"
              checked={formData.rol === 'empleador'}
              onChange={handleChange}
              required
            />
            <label htmlFor="empleador">Empleador</label>
          </div>
        </div>

        {formData.rol === 'candidato' && (
          <>
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Género</label>
              <input type="text" name="genero" value={formData.genero} onChange={handleChange} required />
            </div>
          </>
        )}

        {formData.rol === 'empleador' && (
          <>
            <div className="input-group">
              <label>Nombre de la empresa</label>
              <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Descripción de la empresa</label>
              <textarea className='border border-gray-300' name="descripcion_empresa" value={formData.descripcion_empresa} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Localidad</label>
              <select
                name="id_localidad"
                value={formData.id_localidad}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Selecciona una localidad</option>
                {localidades.map((loc) => (
                  <option key={loc.id_localidad} value={loc.id_localidad}>
                    {loc.nombre_localidad}
                  </option>
                ))}
              </select>
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
