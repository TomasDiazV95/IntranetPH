import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const user = localStorage.getItem('authUser');
  const authTime = localStorage.getItem('authTime');

  if (!user || !authTime) return <Navigate to="/" />;

  const tiempoTranscurrido = Date.now() - parseInt(authTime, 10);
  const limite = 25 * 60 * 1000; // 25 minutos en milisegundos

  if (tiempoTranscurrido > limite) {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTime');
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
