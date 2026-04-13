import React, { useState } from 'react';
import { Login } from '../Login/Login';
import { Register } from '../Register/Register'; // <-- Asegúrate de importar Register también

export const ButtonNavbar = ({ children, modalType }) => {
    const [isOpen, setIsOpen] = useState(false);

    const renderModalContent = () => {
        if (modalType === 'login') {
            return <Login />;
        }
        if (modalType === 'register') {
            return <Register />;
        }
        return null;
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex gap-1 items-center text-bold text-white border hover:bg-white hover:text-black transition-all focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm px-4 py-2 text-center hover:cursor-pointer"
            >
                {children}
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative rounded-lg shadow-lg max-w-md">
                        {/* Botón para cerrar */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute m-6 right-0 font-bold text-2xl hover:cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        {/* Contenido dinámico */}
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </>
    );
};
