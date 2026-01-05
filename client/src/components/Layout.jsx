import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Layout({ children }) {
  const navigate = useNavigate();
  const usuario = localStorage.getItem('authUser');

  const cerrarSesion = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTime');
    navigate('/');
  };

  // Validación de expiración de sesión
  useEffect(() => {
    const authTime = localStorage.getItem('authTime');

    if (authTime) {
      const tiempoTranscurrido = Date.now() - parseInt(authTime, 10);
      const minutosTranscurridos = tiempoTranscurrido / (1000 * 60);

      if (minutosTranscurridos > 25) {
        alert('Tu sesión ha expirado por inactividad.');
        cerrarSesion();
      }
    }
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/home">Phoenix</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/gestion">Descarga Gestión</Nav.Link>
            <Nav.Link as={Link} to="/gestion-compromiso">Gestión +  Comp</Nav.Link>
            <Nav.Link as={Link} to="/fecha-compromiso">Fecha Compromiso</Nav.Link>
            <Nav.Link as={Link} to="/contacto-directo">Contacto Directo</Nav.Link>
            {/* <Nav.Link as={Link} to="/upload">Consolidado</Nav.Link> */}
            <Nav.Link as={Link} to="/consulta-email">Mails</Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            <Navbar.Text className="me-3 text-white">
              Bienvenido, <strong>{usuario}</strong>
            </Navbar.Text>
            <Nav.Link onClick={cerrarSesion}>Cerrar sesión</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">{children}</Container>
    </>
  );
}

export default Layout;
