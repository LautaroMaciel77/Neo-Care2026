import React from 'react'
import './Hero.css'
import { Link } from 'react-router-dom'

export const Hero = () => {
    return (
        <div className='hero-section'>
            <section className='hero-container max-w-screen-xl flex flex-col justify-center flex-wrap mx-auto p-4'>
                <h1 className='text-7xl font-[800] text-left mb-4 leading-tight'>
                    Descubre nuevas <br /> oportunidades <br /> en salud
                </h1>

                <p className='mb-16 max-w-[550px]'>
                    Descubre tu próximo empleo ideal con JobMatch. Nuestra plataforma inteligente conecta profesionales cualificados con empresas destacadas del mercado.
                </p>

                <div className="buttons-container flex gap-2 z-10">
                    <Link
                        to="buscar-empleo"
                        type="button"
                        className="text-white text-xl bg-gradient-to-r from-cyan-500 to-blue-500  transition-all duration-200 ease-in-out hover:brightness-110 hover:scale-105 focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg px-8 py-4 text-center me-2 mb-2"
                    >
                        Buscar turno
                    </Link>


                    <Link to={"publicar-empleo"} type="button" class="text-white text-xl bg-gradient-to-br from-green-400 to-blue-600 transition-all duration-200 ease-in-out hover:brightness-110 hover:scale-105 focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-semibold rounded-lg px-5 py-4 text-center me-2 mb-2">Publicar oferta</Link>
                    {/* <Link to={"publicar-empleo"} type="button" class="text-white text-xl bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-semibold rounded-lg px-5 py-4 text-center me-2 mb-2">Publicar oferta</Link> */}
                </div>
            </section>

            <div className="bg"></div>
            <div class="bg-animation"></div>
        </div>
    )
}
