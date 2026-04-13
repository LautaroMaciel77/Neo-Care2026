import React from 'react';
import { useNavigate } from 'react-router-dom';

export const OfertaCard = ({ id_oferta, img, titulo, descripcion }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/buscar-empleo', { state: { ofertaId: id_oferta } });
    };

    return (
        <div className="max-w-sm bg-white border-gray-200 rounded-lg shadow-xl">
            <a onClick={handleClick} className="cursor-pointer block">
                <img className="rounded-t-lg w-full" src={img} alt="" />
            </a>
            <div className="p-5">
                <a onClick={handleClick} className="cursor-pointer block">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{titulo}</h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-600">{descripcion}</p>

                <a
                    onClick={handleClick}
                    className="inline-flex mt-6 items-center font-[600] text-xl hover:text-blue-600 text-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 cursor-pointer"
                >
                    Ver más
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </a>
            </div>
        </div>
    );
};
