import React, { useEffect, useState } from 'react';
import { OfertaCard } from '../OfertaCard/OfertaCard';
import API from '../../../services/axiosInstance';
import './Ofertas.css';

export const Ofertas = () => {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const response = await API.get('/ofertas');
        console.log(response.data);

        // Solo las últimas 3 ofertas (invirtiendo si es necesario)
        const ultimasOfertas = response.data.slice(-3).reverse();
        setOfertas(ultimasOfertas);
      } catch (error) {
        console.error('Error al cargar ofertas:', error);
      }
    };

    fetchOfertas();
  }, []);

  const imagenes = ['JB-pink.jpg', 'JB-blue.jpg', 'JB-green.jpg'];

  return (
    <div className='section-ofertas'>
      <section className='max-w-screen-xl mx-auto p-4 py-6'>
        <h3 className='ofertas-destacadas__titulo text-5xl font-bold mt-20 mb-20 relative'>
          Últimas ofertas
        </h3>

        <section className='ofertas-container flex flex-wrap gap-6'>
          {ofertas.length > 0 ? (
            ofertas.map((oferta, index) => (
              <OfertaCard
                key={index}
                img={imagenes[index % imagenes.length]}
                titulo={oferta.titulo}
                descripcion={`${oferta.ubicacion} - ${oferta.nombre_empresa}`}
              />
            ))
          ) : (
            <p className="text-gray-500">No hay ofertas disponibles.</p>
          )}
        </section>
      </section>
    </div>
  );
};
