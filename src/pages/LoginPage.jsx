import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ghost } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-4 border-orange-500">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-900/50 p-4 rounded-full">
            <Ghost className="text-orange-500" size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-orange-500 mb-2">Acceso Halloween</h1>
        <p className="text-slate-400 text-sm mb-6">Solo para organizadores</p>
        
        {error && <p className="bg-red-900/50 text-red-400 p-2 rounded mb-4 text-sm font-medium border border-red-700">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-400"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Contraseña" required 
            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-400"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-900">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;