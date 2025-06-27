import { useState, useEffect } from 'react';

// Utilidad para obtener la imagen base64 de un producto por nombre
function getImageByName(name, recipesData) {
  for (const receta of recipesData) {
    if (receta.products) {
      const prod = receta.products.find(p => p.name && p.name.toLowerCase().includes(name.toLowerCase()));
      if (prod && prod.image_base64) return prod.image_base64;
    }
    if (receta.ingredients) {
      const ing = receta.ingredients.find(i => i.name && i.name.toLowerCase().includes(name.toLowerCase()));
      if (ing && ing.image_base64) return ing.image_base64;
    }
    if (receta.produced_in && receta.produced_in.name && receta.produced_in.name.toLowerCase().includes(name.toLowerCase())) {
      if (receta.produced_in.image_base64) return receta.produced_in.image_base64;
    }
  }
  return null;
}

export default function IronCalculator() {
  const [lingotes, setLingotes] = useState('');
  const [output, setOutput] = useState('');
  const [recipesData, setRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/recipes.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar recipes.json');
        return res.json();
      })
      .then(data => {
        setRecipesData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function calcular(e) {
    e.preventDefault();
    const l = parseInt(lingotes);
    if (isNaN(l) || l <= 0) return;
    let maxPlanchas = 0, maxBarras = 0, maxTornillos = 0, planchasReforzadas = 0, planchasProducidas = 0, tornillosProducidos = 0, mejorDistribucion = { x: 0, y: 0 };
    for (let x = 0; x <= l; x++) {
      let y = l - x;
      let planchas = (2 / 3) * x;
      let barras = y;
      let tornillos = Math.floor(barras / 10) * 40;
      let posiblesPlanchasReforzadas = Math.min(Math.floor(planchas / 30), Math.floor(tornillos / 60));
      if (posiblesPlanchasReforzadas > planchasReforzadas) {
        planchasReforzadas = posiblesPlanchasReforzadas;
        maxPlanchas = Math.floor(planchas);
        maxBarras = barras;
        maxTornillos = tornillos;
        planchasProducidas = planchas;
        tornillosProducidos = tornillos;
        mejorDistribucion = { x, y };
      }
    }
    setOutput({
      resumen: `🤖 ¡Hola! Con ${l} lingotes de metal, este es el mejor uso posible:\n\n🔧 Usamos ${mejorDistribucion.x} lingotes para producir planchas de metal.\n   ➤ Como 30 lingotes hacen 20 planchas, eso da ${(2/3) * mejorDistribucion.x} planchas de metal.\n\n🔩 Usamos ${mejorDistribucion.y} lingotes para hacer barras de hierro.\n   ➤ Como 1 lingote da 1 barra, obtenemos ${mejorDistribucion.y} barras.\n   ➤ Cada 10 barras producen 40 tornillos, por lo tanto tenemos ${maxTornillos} tornillos.\n\n🏗️ Ahora combinamos:\n   ➤ Cada plancha reforzada necesita 30 planchas y 60 tornillos.\n   ➤ Podemos hacer ${planchasReforzadas} planchas de hierro reforzadas.\n\n🧾 Resumen final:\n- 🔹 Planchas de metal: ${Math.floor(planchasProducidas)}\n- 🔹 Barras de hierro: ${maxBarras}\n- 🔹 Tornillos: ${maxTornillos}\n- 🔹 Planchas de hierro reforzadas: ${planchasReforzadas}`,
      imagenes: {
        lingote: getImageByName('iron ingot', recipesData),
        plancha: getImageByName('iron plate', recipesData),
        barra: getImageByName('iron rod', recipesData),
        tornillo: getImageByName('screw', recipesData),
        reforzada: getImageByName('reinforced iron plate', recipesData)
      }
    });
  }

  function getProducedInImage(producto) {
    const keyToName = {
      planchas: 'Iron Plate',
      barras: 'Iron Rod',
      tornillos: 'Screw',
      reforzadas: 'Reinforced Iron Plate',
      alambre: 'Wire',
      cable: 'Cable',
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

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <form onSubmit={calcular} style={{marginBottom: 32}}>
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
          {/* Imagen de la máquina que produce el producto principal */}
          {lingotes && (() => {
            let productoPrincipal = 'planchas';
            if (output.imagenes.reforzada) productoPrincipal = 'reforzadas';
            else if (output.imagenes.tornillo) productoPrincipal = 'tornillos';
            else if (output.imagenes.barra) productoPrincipal = 'barras';
            const producedIn = getProducedInImage(productoPrincipal);
            return producedIn ? (
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontWeight:600}}>Fabricado en:</span>
                <img src={producedIn.image} alt={producedIn.name} style={{height:32}} />
                <span>{producedIn.name}</span>
              </div>
            ) : null;
          })()}
          <pre style={{margin:0}}>{output.resumen}</pre>
        </div>
      )}
    </form>
  );
}
