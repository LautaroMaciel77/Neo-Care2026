import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Estadisticas } from './components/Estadisticas/Estadisticas';
import { Features } from './components/Features/Features';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Turnos } from './components/Turnos/Turnos';
import PublicarTurno from './pages/PublicarTurno/PublicarTurno';
import BuscarTurno from './pages/BuscarTurno/BucarTurno';
import { MisPostulaciones } from './pages/MisPostulaciones/MisPostulaciones';
import { MisTurnos } from './pages/Mispublicaciones/MisPublicaciones';
import './App.css';


function App() {
  return (
    <BrowserRouter>

      <Header />


      

      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Turnos />
            <Estadisticas />
            <Features />
          </>
        } />


        <Route path="/publicar-turno" element={<PublicarTurno />} />
        <Route path="/buscar-turno" element={<BuscarTurno />} />
        <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
        <Route path="/mis-publicaciones" element={<MisTurnos />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
