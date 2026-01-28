import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.1.75:5555/login', {
        username,
        password
      });

      if (res.data.success) {
        localStorage.setItem('authUser', res.data.user); // almacena usuario
        localStorage.setItem('authTime', Date.now());  // ⏱️ Aquí agregas el tiempo
        navigate('/home');
      }
    } catch (error) {
      alert('Usuario o contraseña incorrectos');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="mb-4 text-center">Intranet Phoenix</h3>
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="dark" className="w-100">Ingresar</Button>
      </Form>
    </Container>
  );
}

export default Login;
