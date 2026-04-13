import React from 'react'
import './Feature.css'
import { FeatureCard } from '../Feature/FeatureCard'

const FEATURES = [
  {
    titulo: "Algoritmo de coincidencia avanzado",
    descripcion: "Nuestro sistema de IA analiza tu perfil y preferencias para encontrar las oportunidades que mejor se adaptan a tus habilidades y experiencia.",
    imagen: "brain.svg",
  },
  {
    titulo: "Empresas verificadas",
    descripcion: "Todas las empresas en nuestra plataforma pasan por un proceso de verificación para garantizar ofertas legítimas y de calidad.",
    imagen: "shield.svg",
  },
  {
    titulo: "Privacidad garantizada",
    descripcion: "Controla quién puede ver tu perfil y mantén la confidencialidad de tu búsqueda de empleo con nuestras opciones de privacidad avanzadas.",
    imagen: "security.svg",
  },
];

export const Features = () => {
  return (
    <div className='section-feature relative'>
      <section className='max-w-screen-xl mx-auto p-4 py-30'>
        <div className="mb-26 text-center">
          <h3 className="text-5xl sm:text-4xl font-bold text-gray-800 mb-4">
            ¿Por qué elegir JobMatch?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ofrecemos herramientas avanzadas que simplifican tu búsqueda de empleo o la contratación de talento.
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
