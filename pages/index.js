import React, { useState, useEffect } from 'react';
import ProductionAnalyzer from '../components/ProductionAnalyzer';
import MetaHead from '../components/MetaHead';
import { getImageByName } from '../utils/imageUtils';
import { getEnglishProductName } from '../utils/productMappings';

export default function Home() {
  const [tipoMaterial, setTipoMaterial] = useState('iron ingot');
  const [cantidad, setCantidad] = useState('');
  const [trigger, setTrigger] = useState(0);
  const [dark, setDark] = useState(false);
  const [producto, setProducto] = useState('iron plate');
  const [recipesData, setRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  useEffect(() => {
    fetch('/data/recipes.json?' + Date.now(), {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar recipes.json');
        return res.json();
      })
      .then(data => {
        setRecipesData(data);
        
        // Extraer todos los productos únicos que se pueden fabricar
        const productos = new Set();
        data.forEach(receta => {
          if (receta.products && Array.isArray(receta.products)) {
            receta.products.forEach(prod => {
              if (prod.name) productos.add(prod.name);
            });
          }
        });
        
        setProductosDisponibles(Array.from(productos).sort());
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Extraer todos los materiales únicos de recipes.json
  const materialesExtractados = React.useMemo(() => {
    const materiales = new Set();
    recipesData.forEach(receta => {
      if (receta.ingredients && Array.isArray(receta.ingredients)) {
        receta.ingredients.forEach(ingrediente => {
          if (ingrediente.name) materiales.add(ingrediente.name);
        });
      }
    });
    return Array.from(materiales).sort();
  }, [recipesData]);

  // Usar materiales extraídos dinámicamente de recipes.json
  const materialesDisponibles = materialesExtractados;

  // Filtrar productos que pueden ser fabricados con el material seleccionado
  const productosFiltrados = React.useMemo(() => {
    if (!tipoMaterial || recipesData.length === 0) return productosDisponibles;
    
    const productosConMaterial = new Set();
    recipesData.forEach(receta => {
      if (receta.ingredients && Array.isArray(receta.ingredients)) {
        const tieneIngrediente = receta.ingredients.some(ing => 
          ing.name && ing.name.toLowerCase() === tipoMaterial.toLowerCase()
        );
        if (tieneIngrediente && receta.products && Array.isArray(receta.products)) {
          receta.products.forEach(prod => {
            if (prod.name) productosConMaterial.add(prod.name);
          });
        }
      }
    });
    
    return Array.from(productosConMaterial).sort();
  }, [tipoMaterial, recipesData, productosDisponibles]);

  // Actualizar producto cuando cambie el filtro
  useEffect(() => {
    if (productosFiltrados.length > 0 && !productosFiltrados.includes(producto)) {
      setProducto(productosFiltrados[0]);
    }
  }, [tipoMaterial, productosDisponibles]);

  // Inicializar el primer material disponible cuando se cargan los datos
  useEffect(() => {
    if (materialesDisponibles.length > 0 && !materialesDisponibles.includes(tipoMaterial)) {
      setTipoMaterial(materialesDisponibles[0]);
    }
  }, [materialesDisponibles]);

  // Función para obtener la imagen de un material o producto
  const obtenerImagenItem = (nombreItem) => {
    for (const receta of recipesData) {
      // Buscar en ingredientes
      if (receta.ingredients && Array.isArray(receta.ingredients)) {
        const ingrediente = receta.ingredients.find(ing => 
          ing.name && ing.name.toLowerCase() === nombreItem.toLowerCase()
        );
        if (ingrediente && ingrediente.image_base64) {
          return ingrediente.image_base64;
        }
      }
      // Buscar en productos
      if (receta.products && Array.isArray(receta.products)) {
        const producto = receta.products.find(prod => 
          prod.name && prod.name.toLowerCase() === nombreItem.toLowerCase()
        );
        if (producto && producto.image_base64) {
          return producto.image_base64;
        }
      }
    }
    return null;
  };

  // Componente selector personalizado con imágenes y búsqueda
  const SelectorConImagenes = ({ id, value, onChange, options, label, className = '' }) => {
    const [mostrarOpciones, setMostrarOpciones] = React.useState(false);
    const [textoBusqueda, setTextoBusqueda] = React.useState('');
    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setMostrarOpciones(false);
          setTextoBusqueda('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Filtrar opciones basado en el texto de búsqueda
    const opcionesFiltradas = options.filter(opcion => 
      opcion.toLowerCase().includes(textoBusqueda.toLowerCase())
    );

    const imagenSeleccionada = obtenerImagenItem(value);

    const handleInputClick = () => {
      setMostrarOpciones(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };

    const handleSeleccion = (opcion) => {
      onChange({ target: { value: opcion } });
      setMostrarOpciones(false);
      setTextoBusqueda('');
    };

    return (
      <div className="position-relative" ref={containerRef}>
        <label className="form-label fw-semibold" htmlFor={id}>{label}</label>
        <div 
          className={`form-control d-flex align-items-center ${className}`}
          style={{ cursor: 'pointer', minHeight: '48px', padding: '8px 12px' }}
          onClick={handleInputClick}
        >
          {imagenSeleccionada && (
            <img 
              src={imagenSeleccionada} 
              alt={value} 
              style={{ height: '32px', marginRight: '8px', flexShrink: 0 }}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={mostrarOpciones ? textoBusqueda : value}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            onFocus={() => setMostrarOpciones(true)}
            placeholder={mostrarOpciones ? 'Buscar...' : value}
            className={`border-0 bg-transparent flex-grow-1 ${dark ? 'text-light' : 'text-dark'}`}
            style={{ outline: 'none' }}
          />
        </div>
        {mostrarOpciones && (
          <div 
            className={`position-absolute w-100 ${dark ? 'bg-dark border-secondary' : 'bg-white border'} border rounded mt-1`}
            style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
          >
            {opcionesFiltradas.length > 0 ? (
              <div className="row g-2 p-2">
                {opcionesFiltradas.map(opcion => {
                  const imagen = obtenerImagenItem(opcion);
                  return (
                    <div key={opcion} className="col-6 col-md-4 col-lg-3">
                      <div
                        className={`d-flex flex-column align-items-center p-2 rounded ${dark ? 'text-light' : 'text-dark'}`}
                        style={{ 
                          cursor: 'pointer',
                          minHeight: '80px',
                          border: `1px solid ${dark ? '#444' : '#dee2e6'}`,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = dark ? '#333' : '#f8f9fa';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onClick={() => handleSeleccion(opcion)}
                      >
                        {imagen && (
                          <img 
                            src={imagen} 
                            alt={opcion} 
                            style={{ height: '32px', width: '32px', objectFit: 'contain', marginBottom: '4px' }}
                          />
                        )}
                        <span className="text-center" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                          {opcion}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-3 text-center ${dark ? 'text-light' : 'text-muted'}`}>
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

  if (loading) return <div className="container py-4">Cargando datos...</div>;
  if (error) return <div className="container py-4" style={{color:'red'}}>Error: {error}</div>;

  return (
    <>
      <MetaHead />
      <div className={dark ? 'bg-dark text-light min-vh-100' : 'bg-light text-dark min-vh-100'} style={{minHeight: '100vh'}}>
        <div className="container py-4">
          <div className="row align-items-center mb-4">
            <div className="col">
              <h1 className="fw-bold mb-0">
                🛠️ Calculadora de Producción
              </h1>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success"
                  onClick={() => alert('¡Botón de prueba funcionando! Los cambios se están aplicando correctamente.')}
                >
                  🔧 Test
                </button>
                <DarkModeToggle />
              </div>
            </div>
          </div>
          
          <div className={`card mb-4 ${dark ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body">
              <h2 className="card-title h4 mb-4">📊 Calculadora de Producción</h2>
              
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setTrigger(trigger + 1);
                }}
              >
                <div className="mb-3">
                  <SelectorConImagenes
                    id="material-select"
                    value={tipoMaterial}
                    onChange={(e) => setTipoMaterial(e.target.value)}
                    options={materialesDisponibles}
                    label="Tipo de material:"
                    className={dark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="cantidad">Cantidad:</label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    required
                    className={`form-control ${dark ? 'bg-dark text-light border-secondary' : ''}`}
                    placeholder="Cantidad de material"
                  />
                </div>
                
                <div className="mb-3">
                  <SelectorConImagenes
                    id="producto-select"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    options={productosFiltrados}
                    label="Producto a fabricar:"
                    className={dark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </div>
                
                <button type="submit" className="btn btn-success w-100 fw-semibold">🚀 Calcular Producción</button>
              </form>
            </div>
          </div>

          {trigger > 0 && (
            <>
              <hr className={dark ? 'border-light' : 'border-dark'} style={{margin: '40px 0'}} />
              <ProductionAnalyzer 
                materiales={cantidad} 
                tipoMaterial={tipoMaterial}
                producto={producto} 
                trigger={trigger} 
                dark={dark} 
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
