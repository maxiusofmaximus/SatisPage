import { useState, useEffect } from 'react';
import { loadConstructorsData } from '../utils/constructorUtils';
import { getImageByName } from '../utils/imageUtils';
import { getEnglishProductName } from '../utils/productMappings';

export default function Calculator() {
  const [materials, setMaterials] = useState('');
  const [output, setOutput] = useState('');
  const [recipesData, setRecipesData] = useState([]);
  const [constructorsData, setConstructorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState('planchas');

  useEffect(() => {
    Promise.all([
      fetch('/data/recipes.json?' + Date.now(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).then(res => {
        if (!res.ok) throw new Error('No se pudo cargar recipes.json');
        return res.json();
      }),
      loadConstructorsData()
    ])
      .then(([recipes, constructors]) => {
        setRecipesData(recipes);
        setConstructorsData(constructors);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const products = [
    { key: 'planchas', label: 'Planchas de hierro', icon: getImageByName(getEnglishProductName('planchas'), recipesData) },
    { key: 'barras', label: 'Barras de hierro', icon: getImageByName(getEnglishProductName('barras'), recipesData) },
    { key: 'tornillos', label: 'Tornillos', icon: getImageByName(getEnglishProductName('tornillos'), recipesData) },
    { key: 'reforzadas', label: 'Planchas reforzadas', icon: getImageByName(getEnglishProductName('placas reforzadas'), recipesData) }
  ];

  function calculate(e) {
    e.preventDefault();
    const materialCount = parseInt(materials);
    if (isNaN(materialCount) || materialCount <= 0) return;

    // Cálculo simplificado basado en el producto seleccionado
    const productionRates = {
      planchas: { ratio: 2/3, name: 'Planchas de hierro' },
      barras: { ratio: 1, name: 'Barras de hierro' },
      tornillos: { ratio: 4, name: 'Tornillos' }, // 1 barra = 4 tornillos
      reforzadas: { ratio: 1/15, name: 'Planchas reforzadas' } // Aproximado
    };

    const rate = productionRates[product];
    if (!rate) return;

    const totalProduction = Math.floor(materialCount * rate.ratio);
    const constructorType = getConstructorType(product);
    const constructorData = constructorsData?.constructors?.[constructorType];
    const constructorsNeeded = Math.ceil(materialCount / (constructorData?.production_rates?.[product]?.input_per_minute || 30));

    setOutput({
      resumen: `🤖 Análisis de producción:\n\n` +
        `📦 Materiales: ${materialCount} lingotes de hierro\n` +
        `🏭 Producto: ${rate.name}\n` +
        `📈 Producción total: ${totalProduction} ${rate.name}\n` +
        `🔧 Constructores necesarios: ${constructorsNeeded}\n` +
        `⚡ Consumo de energía: ${(constructorData?.power_consumption || 4) * constructorsNeeded} MW`,
      imagenes: {
        material: getImageByName('iron_ingot', recipesData),
        producto: getImageByName(getEnglishProductName(product), recipesData)
      }
    });
  }

  function getConstructorType(productKey) {
    const mapping = {
      planchas: 'constructor',
      barras: 'constructor',
      tornillos: 'constructor',
      reforzadas: 'assembler'
    };
    return mapping[productKey] || 'constructor';
  }

  function getConstructorForProduct(producto) {
    const keyToRecipe = {
      planchas: 'iron_plate',
      barras: 'iron_rod',
      tornillos: 'screw',
      reforzadas: 'reinforced_iron_plate',
      alambre: 'wire',
      cable: 'cable',
      lamina_cobre: 'copper_sheet'
    };
    
    const recipeKey = keyToRecipe[producto] || producto;
    const constructorInfo = getConstructorInfoByRecipe(recipeKey, constructorsData);
    
    if (constructorInfo) {
      return {
        image: constructorInfo.image,
        name: formatConstructorName(constructorInfo, 'es')
      };
    }
    
    return null;
  }

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <form onSubmit={calcular} style={{marginBottom: 32}}>
      <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16}}>
        <span style={{fontWeight:600}}>Producto:</span>
        {productos.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProducto(p.key)}
            style={{
              border: producto === p.key ? '2px solid #007bff' : '1px solid #ccc',
              background: producto === p.key ? '#e9f5ff' : '#fff',
              borderRadius: 8,
              padding: 4,
              cursor: 'pointer',
              outline: 'none',
              height: 48,
              width: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8
            }}
            title={p.label}
          >
            {p.icon && <img src={p.icon} alt={p.label} style={{height:32}} />}
          </button>
        ))}
      </div>
      <label>
        Cantidad de lingotes de metal:
        <input type="number" min="1" value={lingotes} onChange={e => setLingotes(e.target.value)} required style={{marginLeft: 8}} />
      </label>
      <button type="submit" style={{marginLeft: 16}}>Calcular Producción</button>
      {output && output.resumen && (
        <div style={{marginTop: 24, background: '#f8f9fa', padding: 16, borderRadius: 8}}>
          <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:8}}>
            {output.imagenes.lingote && <img src={output.imagenes.lingote} alt="Lingote" style={{height:32}} />}
            {output.imagenes.plancha && <img src={output.imagenes.plancha} alt="Plancha" style={{height:32}} />}
            {output.imagenes.barra && <img src={output.imagenes.barra} alt="Barra" style={{height:32}} />}
            {output.imagenes.tornillo && <img src={output.imagenes.tornillo} alt="Tornillo" style={{height:32}} />}
            {output.imagenes.reforzada && <img src={output.imagenes.reforzada} alt="Reforzada" style={{height:32}} />}
          </div>
          {/* Imagen del constructor específico que produce el producto principal */}
          {(() => {
            const constructor = getConstructorForProduct(producto);
            return constructor ? (
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontWeight:600}}>Fabricado en:</span>
                <img src={constructor.image} alt={constructor.name} style={{height:32}} />
                <span>{constructor.name}</span>
              </div>
            ) : null;
          })()}
          <pre style={{margin:0}}>{output.resumen}</pre>
        </div>
      )}
    </form>
  );
}
