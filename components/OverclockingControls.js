import React, { useState, useEffect, useCallback, useRef } from 'react';

function OverclockingControls({ constructorInfo, constructorsData, onOverclockingChange }) {
  const [constructors, setConstructors] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [globalOverclocking, setGlobalOverclocking] = useState(100);

  useEffect(() => {
    if (constructorInfo && constructorInfo.constructoresNecesarios > 0 && constructors.length === 0) {
      // Obtener consumo base del constructor desde constructorsData
      let basePowerConsumption = 4; // Valor por defecto para Constructor
      if (constructorInfo.constructorData && constructorInfo.constructorData.power_consumption) {
        basePowerConsumption = constructorInfo.constructorData.power_consumption;
      }
      
      // Inicializar constructores con overclocking por defecto (100%)
      const initialConstructors = Array.from({ length: constructorInfo.constructoresNecesarios }, (_, index) => ({
        id: index + 1,
        overclocking: 100,
        basePowerConsumption,
        powerConsumption: basePowerConsumption,
        efficiency: 1.0
      }));
      setConstructors(initialConstructors);
      setGlobalOverclocking(100);
    }
  }, [constructorInfo, constructors.length]);



  const updateConstructorOverclocking = (constructorId, newOverclocking) => {
    const updatedConstructors = constructors.map(constructor => {
      if (constructor.id === constructorId) {
        const efficiency = newOverclocking / 100;
        const powerMultiplier = Math.pow(efficiency, 1.6); // Fórmula de Satisfactory
        return {
          ...constructor,
          overclocking: newOverclocking,
          efficiency,
          powerConsumption: constructor.basePowerConsumption * powerMultiplier
        };
      }
      return constructor;
    });
    
    setConstructors(updatedConstructors);
    
    // La notificación al padre se maneja en useEffect
  };

  const setAllOverclocking = useCallback((percentage) => {
    setGlobalOverclocking(percentage);
    
    setConstructors(prevConstructors => {
      if (prevConstructors.length === 0) {
        return prevConstructors;
      }
      
      // Actualizar todos los constructores directamente
      const updatedConstructors = prevConstructors.map(constructor => {
        const efficiency = percentage / 100;
        const powerMultiplier = Math.pow(efficiency, 1.6); // Fórmula de Satisfactory
        return {
          ...constructor,
          overclocking: percentage,
          efficiency,
          powerConsumption: constructor.basePowerConsumption * powerMultiplier
        };
      });
      
      return updatedConstructors;
    });
  }, []);

  // Usar useRef para evitar bucles infinitos
  const onOverclockingChangeRef = useRef(onOverclockingChange);
  onOverclockingChangeRef.current = onOverclockingChange;

  // Notificar al componente padre cuando cambien los constructors
  useEffect(() => {
    if (constructors.length > 0 && onOverclockingChangeRef.current) {
      const totalEfficiency = constructors.reduce((sum, c) => sum + c.efficiency, 0);
      const totalPowerConsumption = constructors.reduce((sum, c) => sum + c.powerConsumption, 0);
      
      onOverclockingChangeRef.current({
        totalEfficiency,
        totalPowerConsumption,
        constructors
      });
    }
  }, [constructors]);

  if (!constructorInfo || constructorInfo.constructoresNecesarios === 0) {
    return null;
  }

  // Recalcular valores totales cada vez que cambie el estado
  const totalEfficiency = constructors.reduce((sum, c) => sum + c.efficiency, 0);
  const totalProduction = Math.round(constructorInfo.productosPorConstructor * totalEfficiency);
  const totalPowerConsumption = constructors.reduce((sum, c) => sum + c.powerConsumption, 0);
  const averageEfficiency = constructors.length > 0 ? Math.round((totalEfficiency / constructors.length) * 100) : 100;

  return (
    <div className="mt-3 p-3 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Controles de Overclocking</h6>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Ocultar Detalles' : 'Mostrar Detalles'}
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <small className="text-muted">Producción Total</small>
            <div className="fw-bold">{totalProduction} {constructorInfo.constructorData?.production_rates ? Object.keys(constructorInfo.constructorData.production_rates)[0]?.replace('_', ' ') : 'productos'}/min</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <small className="text-muted">Consumo Total</small>
            <div className="fw-bold">{Math.round(totalPowerConsumption)} MW</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <small className="text-muted">Eficiencia Promedio</small>
            <div className="fw-bold">{averageEfficiency}%</div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Configuración Global de Overclocking:</label>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">50%</span>
          <div className="flex-grow-1 position-relative">
            <input
              type="range"
              className="form-range"
              min="50"
              max="250"
              value={globalOverclocking}
              onChange={(e) => setAllOverclocking(parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, 
                  #6c757d 0%, #6c757d 20%, 
                  #0d6efd 20%, #0d6efd 40%, 
                  #ffc107 40%, #ffc107 60%, 
                  #6f42c1 60%, #6f42c1 100%)`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
            <div className="d-flex justify-content-between position-absolute w-100" style={{ top: '20px', fontSize: '10px' }}>
              <span style={{ color: '#6c757d' }}>Under</span>
              <span style={{ color: '#0d6efd' }}>Normal</span>
              <span style={{ color: '#ffc107' }}>Over</span>
              <span style={{ color: '#6f42c1' }}>Max</span>
            </div>
          </div>
          <span className="text-muted small">250%</span>
        </div>
        <div className="text-center mt-2">
          <span className={`badge fs-6 ${
             globalOverclocking < 100 ? 'bg-secondary' :
             globalOverclocking === 100 ? 'bg-primary' :
             globalOverclocking <= 200 ? 'bg-warning' : 'bg-purple'
           }`} style={{
             backgroundColor: globalOverclocking > 200 ? '#6f42c1' : undefined
           }}>
             {globalOverclocking}%
           </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3">
          <h6>Control Individual de Constructores:</h6>
          {constructors.map(constructor => (
            <div key={constructor.id} className="row align-items-center mb-2 p-2 border rounded">
              <div className="col-md-3">
                <strong>Constructor {constructor.id}</strong>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center">
                  <input
                    type="range"
                    className="form-range me-2"
                    min="1"
                    max="250"
                    value={constructor.overclocking}
                    onChange={(e) => updateConstructorOverclocking(constructor.id, parseInt(e.target.value))}
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: '70px' }}
                    min="1"
                    max="250"
                    value={constructor.overclocking}
                    onChange={(e) => updateConstructorOverclocking(constructor.id, parseInt(e.target.value) || 100)}
                  />
                  <span className="ms-1">%</span>
                </div>
              </div>
              <div className="col-md-2 text-center">
                <small className="text-muted">Producción</small>
                <div>{Math.round(constructorInfo.productosPorConstructor * constructor.efficiency)}/min</div>
              </div>
              <div className="col-md-2 text-center">
                <small className="text-muted">Consumo</small>
                <div>{Math.round(constructor.powerConsumption)} MW</div>
              </div>
              <div className="col-md-1 text-center">
                <span className={`badge ${
                  constructor.overclocking < 100 ? 'bg-info' : 
                  constructor.overclocking === 100 ? 'bg-success' : 
                  constructor.overclocking <= 150 ? 'bg-warning' : 'bg-danger'
                }`}>
                  {constructor.overclocking < 100 ? 'Under' : 
                   constructor.overclocking === 100 ? 'Normal' : 'Over'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
        <small className="text-muted">
          <strong>Nota:</strong> El overclocking aumenta la producción pero también el consumo de energía exponencialmente. 
          El underclocking reduce tanto la producción como el consumo de energía.
        </small>
      </div>
    </div>
  );
}

export default OverclockingControls;