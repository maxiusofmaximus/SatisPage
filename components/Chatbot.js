import { useState, useEffect, useRef } from 'react';

// Utilidad para obtener la imagen base64 de un producto por nombre
function getImageByName(name, recipesData) {
  if (!recipesData || recipesData.length === 0) return null;
  // Coincidencia exacta primero
  for (const receta of recipesData) {
    if (receta.products) {
      const prod = receta.products.find(
        p => p.name && p.name.toLowerCase() === name.toLowerCase()
      );
      if (prod && prod.image_base64) return prod.image_base64;
    }
    if (receta.ingredients) {
      const ing = receta.ingredients.find(
        i => i.name && i.name.toLowerCase() === name.toLowerCase()
      );
      if (ing && ing.image_base64) return ing.image_base64;
    }
    if (
      receta.produced_in &&
      receta.produced_in.name &&
      receta.produced_in.name.toLowerCase() === name.toLowerCase()
    ) {
      if (receta.produced_in.image_base64) return receta.produced_in.image_base64;
    }
  }
  // Si no hay coincidencia exacta, buscar por includes
  for (const receta of recipesData) {
    if (receta.products) {
      const prod = receta.products.find(
        p => p.name && p.name.toLowerCase().includes(name.toLowerCase())
      );
      if (prod && prod.image_base64) return prod.image_base64;
    }
    if (receta.ingredients) {
      const ing = receta.ingredients.find(
        i => i.name && i.name.toLowerCase().includes(name.toLowerCase())
      );
      if (ing && ing.image_base64) return ing.image_base64;
    }
    if (
      receta.produced_in &&
      receta.produced_in.name &&
      receta.produced_in.name.toLowerCase().includes(name.toLowerCase())
    ) {
      if (receta.produced_in.image_base64) return receta.produced_in.image_base64;
    }
  }
  return null;
}

function getConstructorImage(producto, recipesData) {
  // Busca la imagen del constructor (produced_in) según el producto
  const keyToName = {
    planchas: 'Iron Plate',
    barras: 'Iron Rod',
    tornillos: 'Screw',
    reforzadas: 'Reinforced Iron Plate',
    alambre: 'Wire',
    cable: 'Cable',
    lamina: 'Copper Sheet',
    lamina_cobre: 'Copper Sheet'
  };
  const nombreProducto = keyToName[producto] || producto;
  for (const receta of recipesData) {
    if (
      receta.products &&
      receta.products.some(p => p.name && p.name.toLowerCase() === nombreProducto.toLowerCase())
    ) {
      if (receta.produced_in && receta.produced_in.image_base64) {
        return {
          image: receta.produced_in.image_base64,
          name: receta.produced_in.name
        };
      }
    }
  }
  return null;
}

// Mapeo robusto de nombres español-inglés para productos principales
const nombreProductoMap = {
  'planchas': 'iron plate',
  'barras': 'iron rod',
  'tornillos': 'screw',
  'reforzadas': 'reinforced iron plate',
  'lingote': 'iron ingot',
  'cobre': 'copper ingot',
  'alambre': 'wire',
  'cable': 'cable',
  'lamina': 'copper sheet',
};

function normalizaNombreProducto(producto) {
  return nombreProductoMap[producto] || producto;
}

function calcularProduccion(lingotes, producto, recipesData) {
  lingotes = parseInt(lingotes);
  if (isNaN(lingotes) || lingotes <= 0) return null;
  const nombreBuscado = normalizaNombreProducto(producto);
  const receta = recipesData.find(r => r.product && r.product.toLowerCase().includes(nombreBuscado));
  if (!receta) return null;
  const lingoteIngred = receta.ingredients.find(i => i.item && i.item.toLowerCase().includes('lingote'));
  if (!lingoteIngred) return null;
  const lotes = Math.floor(lingotes / lingoteIngred.qty);
  const totalProducto = lotes * receta.amount;
  let resumen = `Con ${lingotes} lingotes puedes fabricar ${totalProducto} ${receta.product} (${lotes} lote(s)).`;
  resumen += `\nSe usan ${lotes * lingoteIngred.qty} lingotes. Sobrante: ${lingotes - lotes * lingoteIngred.qty} lingotes.`;
  resumen += `\n\nIngredientes por lote:`;
  receta.ingredients.forEach(ing => {
    resumen += `\n- ${ing.item}: ${ing.qty}`;
  });
  // Añadir imágenes relevantes
  const imagenes = {
    lingote: getImageByName('iron ingot', recipesData),
    plancha: getImageByName('iron plate', recipesData),
    barra: getImageByName('iron rod', recipesData),
    tornillo: getImageByName('screw', recipesData),
    reforzada: getImageByName('reinforced iron plate', recipesData),
    cobre: getImageByName('copper ingot', recipesData),
    alambre: getImageByName('wire', recipesData),
    cable: getImageByName('cable', recipesData),
    lamina: getImageByName('copper sheet', recipesData),
  };
  return { resumen, imagenes };
}

// Agrega la imagen del constructor
const imagenEnsambladora = '/assembler.webp';

function ConstructoresProduccion({ lingotes, producto, recipesData }) {
  lingotes = parseInt(lingotes);
  if (isNaN(lingotes) || lingotes <= 0) return null;
  // Reutiliza la lógica de calcularProduccion
  const lingotesPorPlanchas = 30, planchasPorLote = 20;
  const lingotesPorBarras = 15, barrasPorLote = 15;
  const tornillosPorLote = 40;
  // Recetas cobre
  const lingotesPorAlambre = 15, alambrePorLote = 30;
  const alambrePorCable = 24, cablePorLote = 8;
  const lingotesPorLamina = 20, laminaPorLote = 10;

  const constructor = getConstructorImage(producto, recipesData);

  if (producto === 'reforzadas') {
    const lingotesPorPaquete = 45 + 15;
    const paquetes = Math.floor(lingotes / lingotesPorPaquete);
    const totalPlanchas = paquetes * 30;
    const totalTornillos = paquetes * 60;
    const barrasNecesarias = Math.ceil(totalTornillos / 4);
    const constructoresPlanchas = Math.ceil(totalPlanchas / planchasPorLote);
    const constructoresBarras = Math.ceil(barrasNecesarias / barrasPorLote);
    const constructoresTornillos = Math.ceil(totalTornillos / tornillosPorLote);
    const ensambladoras = paquetes;
    return (
      <div className="d-flex flex-wrap gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de planchas"><img src={getImageByName('iron plate', recipesData)} alt="Plancha" style={{height:28,verticalAlign:'middle'}} /> × {constructoresPlanchas} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
        <span title="Constructores de barras"><img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:28,verticalAlign:'middle'}} /> × {constructoresBarras} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
        <span title="Constructores de tornillos"><img src={getImageByName('screw', recipesData)} alt="Tornillo" style={{height:28,verticalAlign:'middle'}} /> × {constructoresTornillos} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
        <span title="Ensambladoras de reforzadas"><img src={getImageByName('reinforced iron plate', recipesData)} alt="Reforzada" style={{height:28,verticalAlign:'middle'}} /> × {ensambladoras} <img src={imagenEnsambladora} alt="Ensambladora" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'planchas') {
    const constructoresPlanchas = (lingotes / lingotesPorPlanchas);
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de planchas"><img src={getImageByName('iron plate', recipesData)} alt="Plancha" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresPlanchas))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'barras') {
    const constructoresBarras = (lingotes / lingotesPorBarras);
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de barras"><img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresBarras))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'tornillos') {
    const barras = Math.floor(lingotes / lingotesPorBarras) * barrasPorLote;
    const maxTornillos = barras * 4;
    const constructoresBarras = Math.ceil(barras / barrasPorLote);
    const constructoresTornillos = Math.ceil(maxTornillos / tornillosPorLote);
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de barras"><img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:28,verticalAlign:'middle'}} /> × {constructoresBarras} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
        <span title="Constructores de tornillos"><img src={getImageByName('screw', recipesData)} alt="Tornillo" style={{height:28,verticalAlign:'middle'}} /> × {constructoresTornillos} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'alambre') {
    const constructoresAlambre = lingotes / lingotesPorAlambre;
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de alambre"><img src={getImageByName('wire', recipesData)} alt="Alambre" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresAlambre))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'cable') {
    const maxAlambre = Math.floor((lingotes / lingotesPorAlambre) * alambrePorLote);
    const constructoresAlambre = lingotes / lingotesPorAlambre;
    const constructoresCable = maxAlambre / alambrePorCable;
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de alambre"><img src={getImageByName('wire', recipesData)} alt="Alambre" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresAlambre))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
        <span title="Constructores de cable"><img src={getImageByName('cable', recipesData)} alt="Cable" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresCable))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  } else if (producto === 'lamina') {
    const constructoresLamina = lingotes / lingotesPorLamina;
    return (
      <div className="d-flex gap-4 justify-content-center align-items-center mb-3">
        <span title="Constructores de lámina de cobre"><img src={getImageByName('copper sheet', recipesData)} alt="Lámina de cobre" style={{height:28,verticalAlign:'middle'}} /> × {Math.max(1,Math.floor(constructoresLamina))} <img src={imagenEnsambladora} alt="Constructor" style={{height:28,marginLeft:4}} /></span>
      </div>
    );
  }
  return null;
}

function GraficoProduccion({ lingotes, producto, recipesData }) {
  lingotes = parseInt(lingotes);
  if (isNaN(lingotes) || lingotes <= 0) return null;
  // Hierro
  if (producto === 'reforzadas') {
    const lingotesPorPaquete = 45 + 15;
    const paquetes = Math.floor(lingotes / lingotesPorPaquete);
    const totalReforzadas = paquetes * 5;
    const totalPlanchas = paquetes * 30;
    const totalTornillos = paquetes * 60;
    const barrasNecesarias = Math.ceil(totalTornillos / 4);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap my-3">
        <span>{lingotes} × <img src={getImageByName('iron ingot', recipesData)} alt="Lingote" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{totalPlanchas} × <img src={getImageByName('iron plate', recipesData)} alt="Plancha" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>+</span>
        <span>{barrasNecesarias} × <img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{totalTornillos} × <img src={getImageByName('screw', recipesData)} alt="Tornillo" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{totalReforzadas} × <img src={getImageByName('reinforced iron plate', recipesData)} alt="Pl. Reforzada" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'planchas') {
    const maxPlanchas = Math.floor((lingotes / 30) * 20);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('iron ingot', recipesData)} alt="Lingote" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxPlanchas} × <img src={getImageByName('iron plate', recipesData)} alt="Plancha" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'barras') {
    const maxBarras = Math.floor((lingotes / 15) * 15);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('iron ingot', recipesData)} alt="Lingote" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxBarras} × <img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'tornillos') {
    const barras = Math.floor(lingotes / 15) * 15;
    const maxTornillos = barras * 4;
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('iron ingot', recipesData)} alt="Lingote" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{barras} × <img src={getImageByName('iron rod', recipesData)} alt="Barra" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxTornillos} × <img src={getImageByName('screw', recipesData)} alt="Tornillo" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'alambre') {
    const lingotesPorAlambre = 15, alambrePorLote = 30;
    const maxAlambre = Math.floor((lingotes / lingotesPorAlambre) * alambrePorLote);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('copper ingot', recipesData)} alt="Lingote de cobre" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxAlambre} × <img src={getImageByName('wire', recipesData)} alt="Alambre" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'cable') {
    const lingotesPorAlambre = 15, alambrePorLote = 30;
    const alambrePorCable = 24, cablePorLote = 8;
    const maxAlambre = Math.floor((lingotes / lingotesPorAlambre) * alambrePorLote);
    const maxCable = Math.floor((maxAlambre / alambrePorCable) * cablePorLote);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('copper ingot', recipesData)} alt="Lingote de cobre" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxAlambre} × <img src={getImageByName('wire', recipesData)} alt="Alambre" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxCable} × <img src={getImageByName('cable', recipesData)} alt="Cable" style={{height:32}} /></span>
      </div>
    );
  } else if (producto === 'lamina') {
    const lingotesPorLamina = 20, laminaPorLote = 10;
    const maxLamina = Math.floor((lingotes / lingotesPorLamina) * laminaPorLote);
    return (
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <span>{lingotes} × <img src={getImageByName('copper ingot', recipesData)} alt="Lingote de cobre" style={{height:32}} /></span>
        <span style={{fontSize: 24}}>→</span>
        <span>{maxLamina} × <img src={getImageByName('copper sheet', recipesData)} alt="Lámina de cobre" style={{height:32}} /></span>
      </div>
    );
  }
  return null;
}

export default function Chatbot({ lingotes, trigger, dark, producto }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [recipesData, setRecipesData] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [errorRecipes, setErrorRecipes] = useState(null);

  useEffect(() => {
    fetch('/data/recipes.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar recipes.json');
        return res.json();
      })
      .then(data => {
        setRecipesData(data);
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
    if (trigger > 0 && lingotes && !isNaN(parseInt(lingotes)) && parseInt(lingotes) > 0) {
      let pregunta = '';
      if (producto === 'reforzadas') {
        pregunta = `¿Cuántas planchas de hierro reforzadas puedo fabricar con ${lingotes} lingotes de hierro por minuto?`;
      } else if (producto === 'planchas') {
        pregunta = `¿Cuántas planchas de hierro puedo fabricar con ${lingotes} lingotes de hierro por minuto?`;
      } else if (producto === 'barras') {
        pregunta = `¿Cuántas barras de hierro puedo fabricar con ${lingotes} lingotes de hierro por minuto?`;
      } else if (producto === 'tornillos') {
        pregunta = `¿Cuántos tornillos puedo fabricar con ${lingotes} lingotes de hierro por minuto?`;
      }
      const datos = calcularProduccion(lingotes, producto, recipesData);
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
  }, [trigger, producto]);

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
    if (productoDetectado) {
      datos = calcularProduccion(lingotes, productoDetectado, recipesData);
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

  if (loadingRecipes) return <div>Cargando datos...</div>;
  if (errorRecipes) return <div style={{color:'red'}}>Error: {errorRecipes}</div>;

  return (
    <div className={dark ? 'bg-secondary text-light rounded p-3 shadow' : 'bg-white text-dark rounded p-3 shadow'} style={{maxWidth: 700, margin: 'auto'}}>
      <GraficoProduccion lingotes={lingotes} producto={producto} recipesData={recipesData} />
      <ConstructoresProduccion lingotes={lingotes} producto={producto} recipesData={recipesData} />
      <div style={{height: 320, overflowY: 'auto', background: dark ? '#23272b' : '#f8f9fa', borderRadius: 8, padding: 16, marginBottom: 16, border: dark ? '1px solid #444' : '1px solid #ddd'}}>
        {messages.length === 0 && (
          <div className="text-muted text-center">¡Haz una pregunta o calcula la producción para ver la respuesta del bot!</div>
        )}
        {messages.map((msg, i) => (
          msg.role === 'user' ? (
            <div key={i} className="d-flex flex-column align-items-end" style={{margin: '16px 0'}}>
              <span className="mb-1" style={{fontSize: 13, color: dark ? '#b3d7ff' : '#1976d2', fontWeight: 600}}>Tú</span>
              <div style={{background: dark ? '#1976d2' : '#0d6efd', color: '#fff', borderRadius: '18px 18px 4px 18px', padding: '10px 16px', maxWidth: 400, wordBreak: 'break-word', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="d-flex flex-column align-items-start" style={{margin: '16px 0'}}>
              <span className="mb-1" style={{fontSize: 13, color: dark ? '#b3ffb3' : '#388e3c', fontWeight: 600}}>Bot</span>
              <div style={{background: dark ? '#343a40' : '#e9ecef', color: dark ? '#fff' : '#222', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', maxWidth: 400, wordBreak: 'break-word', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
                {(() => {
                  // Reemplazo completo de imágenes en el renderizado:
                  // En todos los <img src={imagenes.X} ... />
                  // Cambia a <img src={getImageByName('nombre')} ... />
                  // Ejemplo:
                  // <img src={getImageByName('iron plate')} alt="Plancha" style={{height:28,verticalAlign:'middle'}} />
                  const lines = msg.content.split(/\r?\n/);
                  const items = [];
                  let buffer = [];
                  lines.forEach((line, idx) => {
                    if (line.trim().startsWith('- ')) {
                      if (buffer.length > 0) {
                        items.push(buffer);
                        buffer = [];
                      }
                      const text = line.replace(/^- /, '').trim();
                      const imgMatch = text.match(/!\\[.*?\\]\\((.*?)\\)/);
                      if (imgMatch) {
                        const imgSrc = imgMatch[1];
                        const imgName = imgSrc.split('/').pop().split('.')[0];
                        const imgBase64 = getImageByName(imgName, recipesData);
                        if (imgBase64) {
                          items.push([{ type: 'image', src: imgBase64, alt: imgName }]);
                        }
                      } else {
                        buffer.push({ type: 'text', content: text });
                      }
                    } else if (line.trim() !== '') {
                      buffer.push({ type: 'text', content: line.trim() });
                    }
                  });
                  if (buffer.length > 0) {
                    items.push(buffer);
                  }
                  return items.map((item, idx) => (
                    <div key={idx} style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8}}>
                      {item.map((part, j) => {
                        if (part.type === 'image') {
                          return <img key={j} src={part.src} alt={part.alt} style={{height: 32, borderRadius: 4, flexShrink: 0}} />;
                        } else {
                          return <span key={j} style={{fontSize: 14, lineHeight: 1.5}}>{part.content}</span>;
                        }
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{display: 'flex', gap: 8}}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu pregunta o comando..."
          className="form-control rounded-pill shadow"
          style={{flex: 1}}
        />
        <button type="submit" className="btn btn-primary rounded-pill shadow" disabled={loading}>
          {loading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
