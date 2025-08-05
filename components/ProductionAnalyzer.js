import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getConstructorImageByRecipe, 
  getConstructorInfoByRecipe, 
  loadConstructorsData,
  formatConstructorName 
} from '../utils/constructorUtils';
import { getImageByName } from '../utils/imageUtils';
import { getEnglishProductName, nombreProductoMap } from '../utils/productMappings';
import OverclockingControls from './OverclockingControls';

// Función simplificada para calcular producción
function calculateProduction(materials, materialType, product, recipesData, constructorsData) {
  if (!recipesData?.length) return null;
  
  const materialEnglish = getEnglishProductName(materialType);
  const productEnglish = getEnglishProductName(product);
  
  // Buscar receta
  const recipe = recipesData.find(r => 
    r.products?.some(p => p.name === productEnglish)
  );
  
  if (!recipe) return null;
  
  // Buscar ingrediente
  const ingredient = recipe.ingredients.find(i => i.name === materialEnglish);
  if (!ingredient) return null;
  
  const productInfo = recipe.products.find(p => p.name === productEnglish);
  
  // Cálculos básicos
  const batches = Math.floor(materials / ingredient.qty);
  const totalProduct = batches * productInfo.qty;
  
  // Información del constructor
  const constructorType = getConstructorType(recipe.name);
  const constructorData = constructorsData?.constructors?.[constructorType];
  
  const resumen = `🤖 Análisis de producción:\n\n` +
    `📦 Materiales: ${materials} ${materialType}\n` +
    `🏭 Receta: ${recipe.display_name || recipe.name}\n` +
    `⚡ Lotes: ${batches}\n` +
    `📈 Producción: ${totalProduct} ${product}\n` +
    `🔧 Constructores: ${batches}\n` +
    `⚡ Energía: ${(constructorData?.power_consumption || 4) * batches} MW`;
  
  return {
    resumen,
    imagenes: {
      material: getImageByName(materialEnglish, recipesData),
      producto: getImageByName(productEnglish, recipesData)
    },
    receta: recipe,
    lotes: batches,
    totalProducto: totalProduct,
    constructorInfo: {
      name: constructorData?.name || 'Constructor',
      productosPorConstructor: productInfo.qty,
      materialPorConstructor: ingredient.qty,
      constructoresNecesarios: batches,
      constructorData
    }
  };
}

// Mapeo simplificado de recetas a constructores
function getConstructorType(recipeName) {
  const mapping = {
    'iron_plate': 'constructor',
    'iron_rod': 'constructor',
    'screw': 'constructor',
    'reinforced_iron_plate': 'assembler',
    'wire': 'constructor',
    'cable': 'constructor',
    'copper_sheet': 'constructor',
    'iron_ingot': 'smelter',
    'steel_ingot': 'foundry'
  };
  return mapping[recipeName] || 'constructor';
}

// Componente simplificado para mostrar constructores
function ConstructorDisplay({ materials, materialType, product, recipesData, constructorsData }) {
  const materials_num = parseInt(materials);
  if (isNaN(materials_num) || materials_num <= 0) return null;
  
  const result = calculateProduction(materials_num, materialType, product, recipesData, constructorsData);
  if (!result) return null;
  
  const { constructorInfo } = result;
  
  return (
    <div className="d-flex justify-content-center align-items-center mb-3">
      <div className="d-flex flex-column align-items-center p-2 rounded" style={{ 
        border: '1px solid #dee2e6',
        minWidth: '80px',
        minHeight: '80px'
      }}>
        <img 
          src={constructorInfo.constructorData?.image || '/favicon.ico'} 
          alt={constructorInfo.name} 
          style={{height: 32, width: 32, objectFit: 'contain', marginBottom: 4}} 
        /> 
        <span className="text-center" style={{ fontSize: '12px', lineHeight: '1.2' }}>
          {constructorInfo.constructoresNecesarios} {constructorInfo.name}
        </span>
      </div>
    </div>
  );
}

// Componente simplificado para mostrar el flujo de producción
function ProductionFlow({ materials, materialType, product, recipesData, constructorsData }) {
  const materials_num = parseInt(materials);
  if (isNaN(materials_num) || materials_num <= 0) return null;
  
  const result = calculateProduction(materials_num, materialType, product, recipesData, constructorsData);
  if (!result) return null;
  
  const { receta, totalProducto, imagenes } = result;
  const productInfo = receta.products[0];
  
  return (
    <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap my-3">
      <div className="d-flex flex-column align-items-center p-2 rounded" style={{ 
        border: '1px solid #dee2e6',
        minWidth: '80px',
        minHeight: '80px'
      }}>
        <img 
          src={imagenes.material} 
          alt={materialType} 
          style={{height: 32, width: 32, objectFit: 'contain', marginBottom: 4}} 
        />
        <span className="text-center" style={{ fontSize: '12px', lineHeight: '1.2' }}>
          {materials_num} {materialType}
        </span>
      </div>
      <span style={{fontSize: 24}}>→</span>
      <div className="d-flex flex-column align-items-center p-2 rounded" style={{ 
        border: '1px solid #dee2e6',
        minWidth: '80px',
        minHeight: '80px'
      }}>
        <img 
          src={imagenes.producto} 
          alt={productInfo.name} 
          style={{height: 32, width: 32, objectFit: 'contain', marginBottom: 4}} 
        />
        <span className="text-center" style={{ fontSize: '12px', lineHeight: '1.2' }}>
          {totalProducto} {productInfo.name}
        </span>
      </div>
    </div>
  );
}

export default function Chatbot({ materiales, tipoMaterial, trigger, dark, producto }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [recipesData, setRecipesData] = useState([]);
  const [constructorsData, setConstructorsData] = useState(null);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [errorRecipes, setErrorRecipes] = useState(null);
  const [overclockingData, setOverclockingData] = useState(null);

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
        setLoadingRecipes(false);
      })
      .catch(err => {
        setErrorRecipes(err.message);
        setLoadingRecipes(false);
      });
  }, []);

  // Scroll automático al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Prompt automático al cambiar trigger
  useEffect(() => {
    if (trigger > 0 && materiales && !isNaN(parseInt(materiales)) && parseInt(materiales) > 0 && tipoMaterial && producto) {
      const pregunta = `¿Cuántos ${producto} puedo fabricar con ${materiales} ${tipoMaterial} por minuto?`;
      const datos = calculateProduction(materiales, tipoMaterial, producto, recipesData, constructorsData);
      if (!datos) return;
      setMessages(msgs => [...msgs, { role: 'user', content: pregunta }]);
      setLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Explica en lenguaje humano y de forma clara y resumida el siguiente resumen de producción de Satisfactory:\n${datos.resumen}` })
      })
        .then(res => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then(data => {
          let reply = data.reply || '';
          if (reply.startsWith(datos.resumen)) {
            reply = reply.slice(datos.resumen.length).trimStart();
          }
          setMessages(msgs => [...msgs, { role: 'assistant', content: reply }]);
          setLoading(false);
        })
        .catch(() => {
          setMessages(msgs => [...msgs, { role: 'assistant', content: '⚠️ No se pudo contactar con la IA. Aquí tienes el resumen generado localmente:\n\n' + datos.resumen }]);
          setLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [trigger, producto, tipoMaterial]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);
    // Mejor reconocimiento de producto
    let productoDetectado = null;
    const inputLower = input.toLowerCase();
    if (inputLower.includes('planchas reforzadas') || inputLower.includes('reforzadas')) {
      productoDetectado = 'reforzadas';
    } else if (inputLower.includes('planchas')) {
      productoDetectado = 'planchas';
    } else if (inputLower.includes('barras')) {
      productoDetectado = 'barras';
    } else if (inputLower.includes('tornillos')) {
      productoDetectado = 'tornillos';
    }
    let datos = null;
    if (productoDetectado && tipoMaterial) {
      datos = calculateProduction(materiales, tipoMaterial, productoDetectado, recipesData, constructorsData);
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      let reply = data.reply || '';
      if (reply.startsWith(input)) {
        reply = reply.slice(input.length).trimStart();
      }
      setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: reply }]);
    } catch {
      // Si la API falla, mostrar el resumen local si es relevante
      if (datos && datos.resumen) {
        setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: '⚠️ No se pudo contactar con la IA. Aquí tienes el resumen generado localmente:\n\n' + datos.resumen }]);
      } else {
        setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: '⚠️ No se pudo contactar con la IA y no se pudo generar un resumen local para tu consulta.' }]);
      }
    }
    setInput('');
    setLoading(false);
  }

  const handleOverclockingChange = useCallback((data) => {
    setOverclockingData(data);
  }, []);

  if (loadingRecipes) return <div>Cargando datos...</div>;
  if (errorRecipes) return <div style={{color:'red'}}>Error: {errorRecipes}</div>;

  const productionResult = materiales && tipoMaterial && producto ? 
    calculateProduction(materiales, tipoMaterial, producto, recipesData, constructorsData) : null;

  return (
    <div className={dark ? 'bg-secondary text-light rounded p-3 shadow' : 'bg-white text-dark rounded p-3 shadow'} style={{maxWidth: 700, margin: 'auto'}}>
      <ProductionFlow materials={materiales} materialType={tipoMaterial} product={producto} recipesData={recipesData} constructorsData={constructorsData} />
      <ConstructorDisplay materials={materiales} materialType={tipoMaterial} product={producto} recipesData={recipesData} constructorsData={constructorsData} />
      
      {productionResult && productionResult.constructorInfo && (
        <OverclockingControls 
          constructorInfo={productionResult.constructorInfo}
          constructorsData={constructorsData}
          onOverclockingChange={handleOverclockingChange}
        />
      )}
      
      {overclockingData && (
        <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
          <h6>Resumen de Producción con Overclocking:</h6>
          <p><strong>Producción Total:</strong> {Math.round(productionResult.constructorInfo.productosPorConstructor * overclockingData.totalEfficiency)} productos/min</p>
          <p><strong>Consumo Total de Energía:</strong> {Math.round(overclockingData.totalPowerConsumption)} MW</p>
          <p><strong>Eficiencia Promedio:</strong> {Math.round((overclockingData.totalEfficiency / overclockingData.constructors.length) * 100)}%</p>
        </div>
      )}
    </div>
  );
}
