import React from 'react'
import './Feature.css'
import { FeatureCard } from '../Feature/FeatureCard'

const FEATURES = [
  {
    titulo: "Algoritmo de coincidencia avanzado",
    descripcion: "Nuestro sistema de IA analiza síntomas, especialidades y disponibilidad para conectar pacientes con el médico ideal en minutos.",
    imagen: "brain.svg",
  },
  {
    titulo: "Médicos verificados",
    descripcion: "Todos los profesionales de la salud en nuestra plataforma pasan por un riguroso proceso de verificación de credenciales y matrículas.",
    imagen: "shield.svg",
  },
  {
    titulo: "Privacidad garantizada",
    descripcion: "Tus datos médicos están protegidos bajo estrictos estándares de confidencialidad. Solo tú decides qué información compartir.",
    imagen: "security.svg",
  },
];

export const Features = () => {
  return (
    <div className='section-feature relative'>
      <section className='max-w-screen-xl mx-auto p-4 py-30'>
        <div className="mb-26 text-center">
          <h3 className="text-5xl sm:text-4xl font-bold text-gray-800 mb-4">
            ¿Por qué elegir Neocare?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simplificamos la gestión de turnos médicos, conectando pacientes con profesionales de confianza.
          </p>
        </div>

        <div className='flex items-center'>
          <div className='features-cards-container flex gap-10'>
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={index}
                titulo={feature.titulo}
                descripcion={feature.descripcion}
                imagen={feature.imagen}
              />
            ))}
          </div>

          {/* <figure className='size-[900px]'>
            <img src="./team.svg" alt="" />
          </figure> */}
        </div>
      </section>

      {/* <div className="bg"></div> */}
    </div>
  )
}