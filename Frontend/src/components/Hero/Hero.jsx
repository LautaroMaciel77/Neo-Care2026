import React from 'react'
import './Hero.css'
import { Link } from 'react-router-dom'

export const Hero = () => {
    return (
        <div className='hero-section'>
            <section className='hero-container max-w-screen-xl flex flex-col justify-center flex-wrap mx-auto p-4'>
                <h1 className='text-7xl font-[800] text-left mb-4 leading-tight'>
                    Tu salud, <br /> nuestra prioridad <br /> en cada turno
                </h1>

                <p className='mb-16 max-w-[550px]'>
                    Encuentra y agenda turnos médicos de forma rápida y segura con NeoCare. Conectamos pacientes con profesionales de la salud verificados.
                </p>

                <div className="buttons-container flex gap-2 z-10">
                    <Link
                        to="buscar-turno"
                        type="button"
                        className="text-white text-xl bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200 ease-in-out hover:brightness-110 hover:scale-105 focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg px-8 py-4 text-center me-2 mb-2"
                    >
                        Buscar turno
                    </Link>

                    <Link 
                        to={"publicar-turno"} 
                        type="button" 
                        className="text-white text-xl bg-gradient-to-br from-green-400 to-blue-600 transition-all duration-200 ease-in-out hover:brightness-110 hover:scale-105 focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-semibold rounded-lg px-5 py-4 text-center me-2 mb-2"
                    >
                        Publicar turno
                    </Link>
                </div>
            </section>

            <div className="bg"></div>
            <div className="bg-animation"></div>
        </div>
    )
}