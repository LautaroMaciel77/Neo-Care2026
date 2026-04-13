import React from 'react'
import { NumberTicker } from "@/components/magicui/NumberTicker";



/* <div className='bg-gray-900'> */

export const Estadisticas = () => {
    return (
        <div className='bg-gray-900'>
            <section class=" py-25 mt-30 max-w-screen-xl flex flex-wrap justify-center mx-auto p-4 gap-12">

                <div class="max-w-6xl flex items-center">
                    <div class="w-full gap-14 text-center flex justify-between">

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={10000}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /></h3>
                            <p class="text-gray-400 text-sm">Empresas activas</p>
                        </div>

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={2}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /> millones</h3>
                            <p class="text-gray-400 text-sm">Profesionales registrados</p>
                        </div>

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+<NumberTicker
                                value={50000}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            /></h3>
                            <p class="text-gray-400 text-sm">Ofertas de empleo</p>
                        </div>


                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2"><NumberTicker
                                value={92}
                                startValue={0}
                                decimalPlaces={0}
                                className="text-6xl font-bold text-white"
                            />%</h3>
                            <p class="text-gray-400 text-sm">Tasa de satisfacción</p>
                        </div>

                    </div>
                </div>
                {/* <div class="max-w-6xl flex items-center mr-40">
                    <div class="gap-14 text-center grid grid-cols-2">

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+10,000</h3>
                            <p class="text-gray-400 text-sm">Empresas activas</p>
                        </div>

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+2 millones</h3>
                            <p class="text-gray-400 text-sm">Profesionales registrados</p>
                        </div>

                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">+50,000</h3>
                            <p class="text-gray-400 text-sm">Ofertas de empleo</p>
                        </div>


                        <div class="flex flex-col items-center">
                            <h3 class="text-5xl font-bold text-white mb-2">92%</h3>
                            <p class="text-gray-400 text-sm">Tasa de satisfacción</p>
                        </div>

                    </div>
                </div> */}

                {/* <figure className='w-[400px]'>
                    <img src="./stats2.svg" alt="" className='w-full h-full' />
                </figure> */}
            </section>
        </div>

    )
}
