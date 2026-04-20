// components/Turnos/Turnos.js
import React, { useEffect, useState } from 'react';
import { TurnoCard } from '../TurnoCard/TurnoCard';
import API from '../../../services/axiosInstance';
import './Turnos.css';

export const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        setLoading(true);
        const response = await API.get('/turnos');
        const ultimosTurnos = response.data.slice(-3).reverse();
        setTurnos(ultimosTurnos);
      } catch (error) {
        console.error('Error al cargar turnos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, []);

  const imagenes = ['JB-pink.jpg', 'JB-blue.jpg', 'JB-green.jpg'];

  if (loading) {
    return (
      <div className="section-turnos">
        <div className="text-center py-10">
          <p>Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-turnos">
      <section className="max-w-screen-xl mx-auto p-4 py-6">
        <h3 className="text-5xl font-bold mt-20 mb-20 relative text-center">
          Turnos creados recientemente
        </h3>

        <section className="flex flex-wrap justify-center gap-6">
          {turnos.length > 0 ? (
            turnos.map((turno, index) => (
              <TurnoCard
                key={turno.id_turno || index}
                id_oferta={turno.id_turno}
                img={imagenes[index % imagenes.length]}
                especialidad={turno.especialidad}
                fecha={turno.fecha}
                hora_inicio={turno.hora_inicio}
                hora_fin={turno.hora_fin}
              />
            ))
          ) : (
            <p className="text-gray-500">No hay turnos disponibles.</p>
          )}
        </section>
      </section>
    </div>
  );
};