import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Estadisticas } from './components/Estadisticas/Estadisticas';
import { Features } from './components/Features/Features';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Ofertas } from './components/Ofertas/Ofertas';
import PublicarEmpleo from './pages/PublicarEmpleo/PublicarEmpleo';
import BuscarEmpleo from './pages/BuscarEmpleo/BucarEmpleo';
import { MisPostulaciones } from './pages/MisPostulaciones/MisPostulaciones';
import { MisOfertas } from './pages/Mispublicaciones/MisPublicaciones';
import './App.css';


function App() {
  return (
    <BrowserRouter>

      <Header />


      

      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Ofertas />
            <Estadisticas />
            <Features />
          </>
        } />


        <Route path="/publicar-empleo" element={<PublicarEmpleo />} />
        <Route path="/buscar-empleo" element={<BuscarEmpleo />} />
        <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
        <Route path="/mis-ofertas" element={<MisOfertas />} />
      </Routes>



      <Footer />
    </BrowserRouter>
  );
}

export default App;
