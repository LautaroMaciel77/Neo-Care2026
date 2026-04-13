import React from 'react'


export const Footer = () => {
    return (



        <footer class="bg-gray-900 text-white py-12" id="contacto">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div class="flex items-center space-x-2 mb-4">
                            <i class="fas fa-briefcase text-2xl"></i>
                            <a href="https://flowbite.com/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                                <span class="self-center text-4xl whitespace-nowrap dark:text-white font-bold">Job<span className='text-blue-400'>Match</span> </span>
                            </a>
                        </div>
                        <p class="text-gray-400 mb-4">Conectando talento con oportunidades desde 2020.</p>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-400 hover:text-white transition-all"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition-all"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition-all"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition-all"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-4">Para candidatos</h4>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Buscar empleo</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Crear perfil</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Alertas de empleo</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Guía de CV</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-4">Para empleadores</h4>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Publicar empleo</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Buscar candidatos</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Planes y precios</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-all">Recursos</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-4">Contacto</h4>
                        <ul class="space-y-2">
                            <li class="flex items-center text-gray-400"><i class="fas fa-map-marker-alt mr-2"></i> Ciudad de Corintios</li>
                            <li class="flex items-center text-gray-400"><i class="fas fa-phone mr-2"></i> +123 456 7890</li>
                            <li class="flex items-center text-gray-400"><i class="fas fa-envelope mr-2"></i> hola@jobmatch.com</li>
                        </ul>
                    </div>
                </div>

                <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p class="text-gray-400 mb-4 md:mb-0">© 2025 JobMatch. Todos los derechos reservados.</p>
                    <div class="flex space-x-6">
                        <a href="#" class="text-gray-400 hover:text-white transition-all">Términos y condiciones</a>
                        <a href="#" class="text-gray-400 hover:text-white transition-all">Política de privacidad</a>
                        <a href="#" class="text-gray-400 hover:text-white transition-all">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>


    )
}
