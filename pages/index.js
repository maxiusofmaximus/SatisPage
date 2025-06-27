import { useState, useEffect } from 'react';
import Chatbot from '../components/Chatbot';

const productosPorIngot = {
  iron_ingot: [
    { key: 'planchas', label: 'Planchas de hierro', icon: <img src="/iron_plate.webp" alt="Planchas de hierro" style={{width: 32, height: 32}} /> },
    { key: 'barras', label: 'Barras de hierro', icon: <img src="/iron_rod.webp" alt="Barras de hierro" style={{width: 32, height: 32}} /> },
    { key: 'tornillos', label: 'Tornillos', icon: <img src="/screws.webp" alt="Tornillos" style={{width: 32, height: 32}} /> },
    { key: 'reforzadas', label: 'Planchas reforzadas', icon: <img src="/reinforced_plate.webp" alt="Planchas reforzadas" style={{width: 32, height: 32}} /> },
  ],
  copper_ingot: [
    { key: 'alambre', label: 'Alambre', icon: <img src="/wire.webp" alt="Alambre" style={{width: 32, height: 32}} /> },
    { key: 'cable', label: 'Cable', icon: <img src="/cable.webp" alt="Cable" style={{width: 32, height: 32}} /> },
    { key: 'lamina_cobre', label: 'Lámina de cobre', icon: <img src="/copper_sheet.webp" alt="Lámina de cobre" style={{width: 32, height: 32}} /> },
  ]
};

export default function Home() {
  const [ingot, setIngot] = useState('iron_ingot');
  const [cantidad, setCantidad] = useState('');
  const [trigger, setTrigger] = useState(0);
  const [dark, setDark] = useState(false);
  const [producto, setProducto] = useState(productosPorIngot[ingot][0].key);

  useEffect(() => {
    setProducto(productosPorIngot[ingot][0].key);
  }, [ingot]);

  useEffect(() => {
    // Cargar Bootstrap desde CDN solo si no está ya cargado
    if (!document.querySelector('link[href*="bootstrap.min.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
      link.id = 'bootstrap-css';
      document.head.appendChild(link);
      return () => {
        if (document.getElementById('bootstrap-css')) {
          document.head.removeChild(link);
        }
      };
    }
  }, []);

  // Botón de modo oscuro moderno
  function DarkModeToggle() {
    return (
      <button
        onClick={() => setDark(d => !d)}
        aria-label="Cambiar modo oscuro"
        style={{
          background: 'none',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 0,
          userSelect: 'none',
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 48,
          height: 28,
          borderRadius: 20,
          background: dark ? '#222' : '#ccc',
          position: 'relative',
          transition: 'background 0.3s',
        }}>
          <span style={{
            position: 'absolute',
            left: dark ? 24 : 4,
            top: 4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: dark ? '#fff' : '#222',
            boxShadow: dark ? '0 0 6px #fff8' : '0 0 6px #0002',
            transition: 'left 0.3s, background 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Luna */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 8.5A4.5 4.5 0 0 1 7.5 4c0-.5.1-1 .3-1.5A6 6 0 1 0 14 12c-.5.2-1 .3-1.5.3A4.5 4.5 0 0 1 12 8.5Z" fill={dark ? '#222' : '#fff'} />
            </svg>
          </span>
        </span>
        <span style={{fontWeight: 600, color: dark ? '#fff' : '#222', fontSize: 16}}>Modo {dark ? 'Oscuro' : 'Claro'}</span>
      </button>
    );
  }

  return (
    <div className={dark ? 'bg-dark text-light min-vh-100' : 'bg-light text-dark min-vh-100'} style={{minHeight: '100vh'}}>
      <div className="container py-4">
        <div className="row align-items-center mb-4">
          <div className="col">
            <h1 className="fw-bold mb-0">
              🛠️ Calculadora de Producción
            </h1>
          </div>
          <div className="col-auto">
            <DarkModeToggle />
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            setTrigger(trigger + 1);
          }}
          className="d-flex flex-wrap align-items-center gap-3 mb-4"
        >
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">Tipo de lingote:</span>
            <div className="btn-group" role="group" aria-label="Selector de lingote">
              <button
                type="button"
                className={'btn d-flex align-items-center ' + (ingot === 'iron_ingot' ? (dark ? 'btn-info' : 'btn-primary') : (dark ? 'btn-outline-info' : 'btn-outline-primary'))}
                onClick={() => setIngot('iron_ingot')}
                title="Lingote de hierro"
                style={{padding: 2, width: 48, height: 48, background: ingot === 'iron_ingot' ? '' : 'transparent'}}
              >
                <img src="/iron_ingot.webp" alt="Lingote de hierro" style={{width: 32, height: 32}} />
              </button>
              <button
                type="button"
                className={'btn d-flex align-items-center ' + (ingot === 'copper_ingot' ? (dark ? 'btn-info' : 'btn-primary') : (dark ? 'btn-outline-info' : 'btn-outline-primary'))}
                onClick={() => setIngot('copper_ingot')}
                title="Lingote de cobre"
                style={{padding: 2, width: 48, height: 48, background: ingot === 'copper_ingot' ? '' : 'transparent'}}
              >
                <img src="/copper_ingot.webp" alt="Lingote de cobre" style={{width: 32, height: 32}} />
              </button>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="col-form-label fw-semibold mb-0" htmlFor="cantidad">Cantidad:</label>
            <input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              required
              className="form-control"
              style={{width: 220, minWidth: 120}}
              placeholder="Cantidad de lingotes"
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">Producto:</span>
            <div className="btn-group" role="group" aria-label="Selector de producto">
              {productosPorIngot[ingot].map(p => (
                <button
                  key={p.key}
                  type="button"
                  className={
                    'btn d-flex align-items-center ' + (producto === p.key ? (dark ? 'btn-info' : 'btn-primary') : (dark ? 'btn-outline-info' : 'btn-outline-primary'))
                  }
                  title={p.label}
                  onClick={() => setProducto(p.key)}
                  style={{fontSize: 20, padding: 2, width: 48, height: 48, background: producto === p.key ? '' : 'transparent'}}
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-success">Calcular Producción</button>
        </form>
        <hr className={dark ? 'border-light' : 'border-dark'} style={{margin: '40px 0'}} />
        <div className="d-flex align-items-center mb-3">
          <span style={{fontSize: 28, marginRight: 8}}>🤖</span>
          <h2 className="fw-bold mb-0">Chatbot de IA</h2>
        </div>
        <Chatbot lingotes={cantidad} trigger={trigger} dark={dark} producto={producto} ingot={ingot} onToggleDark={() => setDark(d => !d)} />
      </div>
    </div>
  );
}
