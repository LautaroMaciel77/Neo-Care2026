import Icon from '../Icon/Icon';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const LogoutButton = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');

        toast.success('Sesión cerrada exitosamente');

        // Esperar un segundo antes de redirigir para que el toast se vea
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    };

    return (
        <>
            <ToastContainer />
            <button
                onClick={handleLogout}
                className="button alt-button flex gap-2 font-bold"
            >
                <Icon name="logout" />
                Cerrar Sesión
            </button>
        </>
    );
};
