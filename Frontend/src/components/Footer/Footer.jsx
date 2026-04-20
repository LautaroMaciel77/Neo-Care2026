import React from 'react'

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12" id="contacto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <i className="fas fa-briefcase text-2xl"></i>
                            <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                                <span className="self-center text-4xl whitespace-nowrap dark:text-white font-bold">Neo<span className='text-blue-400'>Care</span> </span>
                            </a>
                        </div>
                        <p className="text-gray-400 mb-4">Plataforma de gestión de turnos médicos conectando pacientes con profesionales desde 2026.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-all"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-all"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Para Pacientes</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Buscar turno médico</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Crear perfil</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Alertas de turnos</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Guía del paciente</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Para Médicos</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Publicar turno</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Gestionar agenda</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Planes y precios</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-all">Recursos médicos</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Contacto</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-400"><i className="fas fa-map-marker-alt mr-2"></i> Ciudad de Corintios</li>
                            <li className="flex items-center text-gray-400"><i className="fas fa-phone mr-2"></i> +123 456 7890</li>
                            <li className="flex items-center text-gray-400"><i className="fas fa-envelope mr-2"></i> hola@solosoyplaceholder.com</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 mb-4 md:mb-0">© 2026 Neocare. Todos los derechos reservados.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-all">Términos y condiciones</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-all">Política de privacidad</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-all">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}