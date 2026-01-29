import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Gestion from './pages/Gestion';
import Layout from './components/Layout';
import GestionCompromiso from './pages/GestionCompromiso';
import ContactoDirecto from './pages/ContactoDirecto';
import FechaCompromiso from './pages/FechaCompromiso';
import UploadZip from './pages/UploadZip';
import PrivateRoute from './components/PrivateRoute';
import EmailConsulta from './pages/EmailConsulta';
import CartaAutomatica from './pages/CartaAutomatica';
import GestionPorRut from './pages/GestionPorRut';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Rutas que deben mostrar navbar */}
        <Route path="/home" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/gestion" element={<PrivateRoute><Layout><Gestion /></Layout></PrivateRoute>} />
        <Route path="/gestion-compromiso" element={<PrivateRoute><Layout><GestionCompromiso /></Layout></PrivateRoute>} />
        <Route path="/fecha-compromiso" element={<PrivateRoute><Layout><FechaCompromiso /></Layout></PrivateRoute>} />
        <Route path="/contacto-directo" element={<PrivateRoute><Layout><ContactoDirecto /></Layout></PrivateRoute>}/>
        <Route path="/upload" element={<PrivateRoute><Layout><UploadZip /></Layout></PrivateRoute>}/>
        <Route path="/consulta-email" element={<PrivateRoute><Layout><EmailConsulta /></Layout></PrivateRoute>}/>
        <Route path="/gestion-rut" element={<PrivateRoute><Layout><GestionPorRut /></Layout></PrivateRoute>}/>
      </Routes>
    </Router>
  );
}

export default App;
