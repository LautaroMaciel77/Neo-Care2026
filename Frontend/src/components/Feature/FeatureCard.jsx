import React from 'react'
import './FeatureCard.css'

export const FeatureCard = ({ titulo, descripcion, imagen }) => {

    const imgURL = `./${imagen}`

    return (

        <div href="#" class="feature-card bg-gray-50 max-w-[350px] flex flex-col items-center justify-center gap-4 rounded-2xl md:max-w-xl py-10">

            <img class="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src={imgURL} alt="" />

            <div class="flex flex-col justify-between p-4 leading-normal">
                <h5 class="mb-2 text-2xl text-center font-bold tracking-tight text-gray-900">{titulo}</h5>
                <p class="mb-3 font-normal text-center text-gray-900"> {descripcion} </p>
            </div>
        </div>

    )
}
