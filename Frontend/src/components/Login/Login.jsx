import React, { useState } from 'react';
import API from '../../../services/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Login.css';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = formData;

      const response = await API.post('/auth/login', {
        email,
        password,
      });

      console.log('Login exitoso:', response.data);
      console.log('Rol del usuario:', response.data.usuario.rol); // Para depurar
      
      // Guardar token y rol del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.usuario.rol); // 'medico' o 'paciente'
      localStorage.setItem('userName', response.data.usuario.nombre);
      localStorage.setItem('userId', response.data.usuario.id_usuario);

      toast.success('¡Login exitoso!');

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error: ' + (error.response?.data?.message || 'Credenciales incorrectas'));
    }
  };

  return (
    <div className="form-box">
      <ToastContainer />
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            type="email"
            id="login-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@email.com"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            type="password"
            id="login-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Tu contraseña"
            required
          />
        </div>

        <div className="remember-forgot">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">Recordarme</label>
          </div>
          <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" className="button">Iniciar Sesión</button>

        <div className="divider">
          <span>O continúa con</span>
        </div>

        <div className="social-login">
          <a href="#" className="social-btn">G</a>
          <a href="#" className="social-btn">f</a>
          <a href="#" className="social-btn">in</a>
        </div>

        <div className="form-footer">
          ¿No tienes una cuenta? <a href="#">Regístrate</a>
        </div>
      </form>
    </div>
  );
};