import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function RutaProtegida({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-orange-500 font-bold">Verificando acceso... 🎃</div>;
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <RutaProtegida>
              <AdminPage />
            </RutaProtegida>
          } 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;