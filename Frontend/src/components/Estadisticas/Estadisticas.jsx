import React from 'react'
import { NumberTicker } from "@/components/magicui/NumberTicker";

export const Estadisticas = () => {
    return (
        <div className='bg-gray-900'>
            <section className="py-25 mt-30 max-w-screen-xl flex flex-wrap justify-center mx-auto p-4 gap-12">
                <div className="max-w-6xl flex items-center">
                    <div className="w-full gap-14 text-center flex justify-between">
                        <div className="flex flex-col items-center">
                            <h3 className="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={500}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /></h3>
                            <p className="text-gray-400 text-sm">Médicos activos</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <h3 className="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={25}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /> mil</h3>
                            <p className="text-gray-400 text-sm">Pacientes registrados</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <h3 className="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={150}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /> mil</h3>
                            <p className="text-gray-400 text-sm">Turnos gestionados</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <h3 className="text-5xl font-bold text-white mb-2"><NumberTicker
                                value={98}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            />%</h3>
                            <p className="text-gray-400 text-sm">Tasa de satisfacción</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}