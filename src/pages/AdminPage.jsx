import { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, CheckCircle2, Circle, Download, LogOut, Ghost, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function AdminPage() {
  const [asistentes, setAsistentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('default');
  
  // Estados para el panel de Alias
  const [mostrarAlias, setMostrarAlias] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [form, setForm] = useState({
    nombre: '', apellido: '', tipo: 'Manada', pago: 'Preventa 1x'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "asistentes_halloween"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAsistentes(datos);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const copiarAlias = () => {
    navigator.clipboard.writeText("matias-sosa.mp");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const exportarACSV = () => {
    if (asistentes.length === 0) return alert("No hay asistentes para exportar.");
    const cabeceras = ["Nombre", "Apellido", "Tipo", "Pago", "Asistio"];
    const filas = asistentes.map(a => [`"${a.nombre}"`, `"${a.apellido}"`, `"${a.tipo}"`, `"${a.pago}"`, a.asistio ? "SI" : "NO"]);
    const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    link.setAttribute("download", `Lista_Halloween_${fecha}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const agregarAsistente = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido) return;
    try { 
      await addDoc(collection(db, "asistentes_halloween"), { ...form, asistio: false }); 
      setForm({ nombre: '', apellido: '', tipo: 'Manada', pago: 'Preventa 1x' }); 
    } catch (error) { console.error(error); alert("Error al guardar. Se guardará cuando vuelva la conexión."); }
  };

  const eliminarAsistente = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a esta persona?')) { 
      try { await deleteDoc(doc(db, "asistentes_halloween", id)); } catch (error) { console.error(error); } 
    }
  };

  const toggleAsistio = async (id, estadoActual) => {
    try { await updateDoc(doc(db, "asistentes_halloween", id), { asistio: !estadoActual }); } catch (error) { console.error(error); }
  };

  const cambiarPago = async (id, nuevoPago) => {
    try { await updateDoc(doc(db, "asistentes_halloween", id), { pago: nuevoPago }); } catch (error) { console.error(error); }
  };

  const asistentesFiltradosYOrdenados = asistentes.filter(a => {
    const texto = busqueda.toLowerCase();
    return a.nombre.toLowerCase().includes(texto) || a.apellido.toLowerCase().includes(texto);
  }).sort((a, b) => {
    if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (orden === 'apellido') return a.apellido.localeCompare(b.apellido);
    return 0;
  });

  const calcularTotal = () => {
    let total = 0;
    asistentes.forEach(a => {
      if (a.pago === 'Preventa 1x') total += 7000;
      if (a.pago === 'Preventa 2x') total += 12000;
      if (a.pago === 'Puerta 1x') total += 10000;
      if (a.pago === 'Puerta 2x') total += 15000;
    });
    return total;
  };

  const getColorTipo = (tipo) => {
    switch(tipo) {
      case 'Manada': return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'Tropa': return 'bg-green-900/50 text-green-400 border-green-700';
      case 'Caminantes': return 'bg-sky-900/50 text-sky-400 border-sky-700';
      case 'Amigo': return 'bg-orange-900/50 text-orange-400 border-orange-700';
      case 'Padre': return 'bg-purple-900/50 text-purple-400 border-purple-700';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const stats = {
    manada: asistentes.filter(a => a.tipo === 'Manada').length,
    tropa: asistentes.filter(a => a.tipo === 'Tropa').length,
    caminantes: asistentes.filter(a => a.tipo === 'Caminantes').length,
    amigos: asistentes.filter(a => a.tipo === 'Amigo').length,
    padres: asistentes.filter(a => a.tipo === 'Padre').length,
    deudores: asistentes.filter(a => a.pago === 'Debe').length
  };

  if (cargando) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xl text-orange-500 font-bold">
      Cargando datos... 🎃
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        
        {/* Encabezado */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg border-b-4 border-orange-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500 flex items-center gap-2 justify-center md:justify-start">
              <Ghost /> Panel de Halloween
            </h1>
            <p className="text-slate-400 text-sm md:text-base">Control de Entradas</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="text-center md:text-right w-full md:w-auto bg-green-900/50 p-3 rounded-lg border border-green-500">
              <p className="text-xs text-green-400 uppercase font-bold">Recaudación Total</p>
              <p className="text-2xl md:text-3xl font-bold text-green-400">${calcularTotal().toLocaleString('es-AR')}</p>
            </div>
            <button 
              onClick={() => signOut(auth)} 
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors w-full md:w-auto"
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>

        {/* Botón y Panel de Alias */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMostrarAlias(!mostrarAlias)}
            className="w-full md:w-auto self-start bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-600 transition-colors shadow-lg"
          >
            {mostrarAlias ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {mostrarAlias ? 'Ocultar Alias de Pago' : 'Mostrar Alias de Pago'}
          </button>

          {mostrarAlias && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-md border-2 border-dashed border-orange-500/50">
              <h3 className="text-orange-400 font-semibold mb-4 text-center text-lg">Alias para Transferencias</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <span className="font-mono text-2xl md:text-3xl font-bold text-white select-all bg-slate-900 px-6 py-3 rounded-lg border border-slate-700 tracking-wider shadow-inner">
                  matias-sosa.mp
                </span>
                <button
                  onClick={copiarAlias}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors w-full md:w-auto justify-center ${
                    copiado ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiado ? <Check size={20} /> : <Copy size={20} />}
                  {copiado ? '¡Copiado!' : 'Copiar Alias'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-yellow-400 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Manada</p><p className="text-lg md:text-xl font-bold text-yellow-400">{stats.manada}</p></div>
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-green-500 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Tropa</p><p className="text-lg md:text-xl font-bold text-green-500">{stats.tropa}</p></div>
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-sky-400 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Caminantes</p><p className="text-lg md:text-xl font-bold text-sky-400">{stats.caminantes}</p></div>
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-orange-400 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Amigos</p><p className="text-lg md:text-xl font-bold text-orange-400">{stats.amigos}</p></div>
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-purple-400 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Padres</p><p className="text-lg md:text-xl font-bold text-purple-400">{stats.padres}</p></div>
          <div className="bg-slate-800 p-2 md:p-3 rounded-lg border-l-4 border-red-500 text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Deben</p><p className="text-lg md:text-xl font-bold text-red-500">{stats.deudores}</p></div>
        </div>

        {/* Formulario */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-md border-t-4 border-orange-500">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-orange-400 flex items-center gap-2"><UserPlus size={20} /> Agregar Asistente</h2>
          <form onSubmit={agregarAsistente} className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <input type="text" placeholder="Nombre" required className="bg-slate-700 border border-slate-600 text-white p-2 rounded focus:outline-orange-500 text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <input type="text" placeholder="Apellido" required className="bg-slate-700 border border-slate-600 text-white p-2 rounded focus:outline-orange-500 text-sm" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            
            <select className="bg-slate-700 border border-slate-600 text-white p-2 rounded focus:outline-orange-500 text-sm" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="Manada">Manada (Amarillo)</option>
              <option value="Tropa">Tropa (Verde)</option>
              <option value="Caminantes">Caminantes (Celeste)</option>
              <option value="Amigo">Amigo del Scout</option>
              <option value="Padre">Padre/Madre (Gratis)</option>
            </select>

            <select className="bg-slate-700 border border-slate-600 text-white p-2 rounded focus:outline-orange-500 text-sm" value={form.pago} onChange={e => setForm({...form, pago: e.target.value})} disabled={form.tipo === 'Padre'}>
              <option value="Preventa 1x">Preventa 1x ($7.000)</option>
              <option value="Preventa 2x">Preventa 2x ($12.000)</option>
              <option value="Puerta 1x">Puerta 1x ($10.000)</option>
              <option value="Puerta 2x">Puerta 2x ($15.000)</option>
              <option value="Debe">Debe</option>
              {form.tipo === 'Padre' && <option value="Gratis">Gratis</option>}
            </select>
            <button type="submit" className="md:col-span-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
              Agregar a la lista
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-slate-700 p-2 rounded border border-slate-600 focus-within:border-orange-500">
              <Search className="text-slate-400" size={18} />
              <input type="text" placeholder="Buscar..." className="w-full bg-transparent focus:outline-none text-sm text-white" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select value={orden} onChange={e => setOrden(e.target.value)} className="bg-slate-700 border border-slate-600 text-white p-2 rounded text-xs md:text-sm flex-1 md:flex-none">
                <option value="default">Orden de carga</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="apellido">Apellido (A-Z)</option>
              </select>
              <button onClick={exportarACSV} className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-3 md:px-4 rounded text-xs md:text-sm flex-1 md:flex-none">
                <Download size={16} /> <span className="hidden md:inline">Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-orange-400 text-xs md:text-sm">
                  <th className="p-2 md:p-3 rounded-tl-lg">Asistió</th>
                  <th className="p-2 md:p-3">Nombre</th>
                  <th className="p-2 md:p-3 hidden md:table-cell">Tipo</th>
                  <th className="p-2 md:p-3">Pago</th>
                  <th className="p-2 md:p-3 text-center rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentesFiltradosYOrdenados.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-6 text-slate-500 text-sm">No hay asistentes.</td></tr>
                ) : (
                  asistentesFiltradosYOrdenados.map(a => (
                    <tr key={a.id} className="border-b border-slate-700 hover:bg-slate-700/50 text-sm">
                      <td className="p-2 md:p-3">
                        <button onClick={() => toggleAsistio(a.id, a.asistio)} className="text-slate-500 hover:text-orange-500">
                          {a.asistio ? <CheckCircle2 className="text-green-500" size={22} /> : <Circle size={22} />}
                        </button>
                      </td>
                      <td className="p-2 md:p-3 font-medium text-white">
                        {a.nombre} {a.apellido}
                        <span className="md:hidden block mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getColorTipo(a.tipo)}`}>{a.tipo}</span>
                        </span>
                      </td>
                      <td className="p-2 md:p-3 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${getColorTipo(a.tipo)}`}>{a.tipo}</span>
                      </td>
                      <td className="p-2 md:p-3">
                        <select value={a.pago} onChange={(e) => cambiarPago(a.id, e.target.value)} disabled={a.tipo === 'Padre'} className={`p-1 rounded border text-xs font-semibold ${a.pago === 'Debe' ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-green-900/50 text-green-400 border-green-700'}`}>
                          {a.tipo === 'Padre' ? (<option value="Gratis">Gratis</option>) : (
                            <>
                              <option value="Preventa 1x">Prev 1x ($7k)</option>
                              <option value="Preventa 2x">Prev 2x ($12k)</option>
                              <option value="Puerta 1x">Puer 1x ($10k)</option>
                              <option value="Puerta 2x">Puer 2x ($15k)</option>
                              <option value="Debe">Debe</option>
                              <option value="Pagado x2">Pagado x2</option>
                            </>
                          )}
                        </select>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <button onClick={() => eliminarAsistente(a.id)} className="text-red-500 hover:text-red-400">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;