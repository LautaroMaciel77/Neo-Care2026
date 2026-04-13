import React, { useState, useEffect, useRef } from 'react';
import { ButtonNavbar } from '../ButtonNavbar/ButtonNavbar';
import { Link } from 'react-router-dom';
import { LogoutButton } from '../Buttons/ButtonLogout';
import Icon from '../Icon/Icon';

export const Header = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // null, 'turnos', 'publicaciones'
    const empleoRef = useRef(null);
    const publicacionesRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLogged(!!token);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            setIsLogged(!!token);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                empleoRef.current &&
                !empleoRef.current.contains(event.target) &&
                publicacionesRef.current &&
                !publicacionesRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div>
            <nav className="header-nav bg-gray-900 sticky w-full z-20 top-0 start-0 border-b border-gray-700">
                <div className="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4 py-8">
                    <Link to={'/'} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-4xl whitespace-nowrap text-white font-bold">
                            Job<span className="text-blue-400">Match</span>
                        </span>
                    </Link>

                    <div className="flex gap-4 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse w-max">
                        {isLogged ? (
                            <LogoutButton />
                        ) : (
                            <>
                                <ButtonNavbar modalType="login"><Icon name="login" /> Iniciar Sesión</ButtonNavbar>
                                <ButtonNavbar modalType="register"><Icon name="register" /> Registrarse</ButtonNavbar>
                            </>
                        )}
                    </div>

                    <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-semibold border border-gray-700 rounded-lg bg-gray-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-gray-900">
                            <li>
                                <Link to={'/'} className="flex items-center gap-1 font-bold py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:p-0">
                                    <Icon name="home" /> Inicio
                                </Link>
                            </li>

                            {/* Menú paciente */}
                            <li className="relative" ref={empleoRef}>
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === 'empleo' ? null : 'empleo')}
                                    className="flex items-center gap-1 font-bold py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:p-0 hover:cursor-pointer"
                                >
                                    <Icon name="portafolio" /> Paciente
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openDropdown === 'empleo' && (
                                    <ul className="flex flex-col absolute left-0 mt-2 py-3 bg-gray-800 rounded shadow-lg z-50 w-[250px]">
                                        <li className='py-2 px-2'>
                                            <Link to="/buscar-empleo" className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                                                <Icon name="search" /> Buscar Turno
                                            </Link>
                                        </li>
                                        <li className='py-2 px-2'>
                                            <Link to="/mis-postulaciones" className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                                                <Icon name="misPostulaciones" /> Mis Turnos
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Menú Publicaciones */}
                            <li className="relative" ref={publicacionesRef}>
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === 'publicaciones' ? null : 'publicaciones')}
                                    className="flex items-center gap-1 font-bold py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:p-0 hover:cursor-pointer"
                                >
                                    <Icon name="file" /> Medico
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openDropdown === 'publicaciones' && (
                                    <ul className="flex flex-col absolute left-0 mt-2 py-3 bg-gray-800 rounded shadow-lg z-50 w-[250px]">
                                        <li className='py-2 px-2'>
                                            <Link to="/publicar-empleo" className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                                                <Icon name="añadirOferta" /> Publicar Turno
                                            </Link>
                                        </li>
                                        <li className='py-2 px-2'>
                                            <Link to="/mis-ofertas" className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                                                <Icon name="misPublicaciones" /> Turnos publicados
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};
