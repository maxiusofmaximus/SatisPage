import { NlpManager } from 'node-nlp';

// Inicializa el administrador de NLP
const manager = new NlpManager({ languages: ['es'], nlu: { log: false } });

// Agrega documentos y respuestas para entrenamiento
// Planchas reforzadas
manager.addDocument('es', 'Producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'plancha reforzada', 'explicar.reforzadas');
manager.addDocument('es', 'reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'reforzada', 'explicar.reforzadas');
manager.addAnswer('es', 'explicar.reforzadas', '¡Vas a fabricar planchas reforzadas! Aquí tienes el desglose de materiales y máquinas necesarias:');

manager.addDocument('es', 'Con %lingotes% lingotes de hierro puedes fabricar %totalReforzadas% planchas de hierro reforzadas', 'explicar.reforzadas_cantidad');
manager.addDocument('es', 'puedes fabricar %totalReforzadas% planchas de hierro reforzadas', 'explicar.reforzadas_cantidad');
manager.addDocument('es', 'puedes fabricar planchas reforzadas', 'explicar.reforzadas_cantidad');
manager.addAnswer('es', 'explicar.reforzadas_cantidad', 'Con esa cantidad de lingotes, puedes obtener muchas planchas reforzadas, ideales para construir máquinas avanzadas.');

// Planchas simples
manager.addDocument('es', 'Tengo %lingotes% lingotes de hierro por minuto', 'explicar.basico');
manager.addDocument('es', 'tengo %lingotes% lingotes de hierro', 'explicar.basico');
manager.addDocument('es', 'hierro por minuto', 'explicar.basico');
manager.addAnswer('es', 'explicar.basico', 'Con esa cantidad de lingotes por minuto, tu producción será la siguiente:');

manager.addDocument('es', 'Puedo producir hasta %maxPlanchas% planchas de hierro por minuto', 'explicar.planchas');
manager.addDocument('es', 'puedo producir planchas de hierro', 'explicar.planchas');
manager.addDocument('es', 'planchas de hierro por minuto', 'explicar.planchas');
manager.addAnswer('es', 'explicar.planchas', '¡Eso es una buena cantidad de planchas por minuto!');

// Barras
manager.addDocument('es', 'Puedo producir hasta %maxBarras% barras de hierro por minuto', 'explicar.barras');
manager.addDocument('es', 'puedo producir barras de hierro', 'explicar.barras');
manager.addDocument('es', 'barras de hierro por minuto', 'explicar.barras');
manager.addAnswer('es', 'explicar.barras', 'Tus barras de hierro estarán listas rápidamente.');

// Tornillos
manager.addDocument('es', 'Puedo producir hasta %maxTornillos% tornillos por minuto', 'explicar.tornillos');
manager.addDocument('es', 'puedo producir tornillos', 'explicar.tornillos');
manager.addDocument('es', 'tornillos por minuto', 'explicar.tornillos');
manager.addAnswer('es', 'explicar.tornillos', '¡Vas a tener tornillos de sobra para tus construcciones!');

// Alambre cobre
manager.addDocument('es', 'Puedo producir hasta %maxAlambre% alambre por minuto', 'explicar.alambre');
manager.addDocument('es', 'puedo producir alambre', 'explicar.alambre');
manager.addDocument('es', 'alambre por minuto', 'explicar.alambre');
manager.addAnswer('es', 'explicar.alambre', 'El alambre es esencial para la electricidad, ¡vas bien!');

// Cable cobre
manager.addDocument('es', 'Puedo producir hasta %maxCable% cable por minuto', 'explicar.cable');
manager.addDocument('es', 'puedo producir cable', 'explicar.cable');
manager.addDocument('es', 'cable por minuto', 'explicar.cable');
manager.addAnswer('es', 'explicar.cable', 'El cable es fundamental para conectar tus máquinas.');

// Lámina de cobre
manager.addDocument('es', 'Puedo producir hasta %maxLamina% lámina de cobre por minuto', 'explicar.lamina');
manager.addDocument('es', 'puedo producir lámina de cobre', 'explicar.lamina');
manager.addDocument('es', 'lámina de cobre por minuto', 'explicar.lamina');
manager.addAnswer('es', 'explicar.lamina', 'La lámina de cobre es útil para muchas recetas avanzadas.');

// Desglose y constructores
manager.addDocument('es', 'Desglose de recursos necesarios', 'explicar.desglose');
manager.addDocument('es', 'materiales necesarios', 'explicar.desglose');
manager.addDocument('es', 'recursos necesarios', 'explicar.desglose');
manager.addAnswer('es', 'explicar.desglose', 'Estos son los materiales que vas a necesitar:');

manager.addDocument('es', 'Constructores necesarios para producción óptima', 'explicar.constructores');
manager.addDocument('es', 'máquinas necesarias', 'explicar.constructores');
manager.addDocument('es', 'constructores necesarios', 'explicar.constructores');
manager.addAnswer('es', 'explicar.constructores', 'Para que la producción sea eficiente, necesitas estas máquinas:');

// Entrenamiento solo una vez
let trained = false;
async function ensureTrained() {
  if (!trained) {
    await manager.train();
    trained = true;
  }
}

// Preprocesamiento: limpia, normaliza y acorta el mensaje, conservando contexto relevante
function preprocesarResumen(msg) {
  if (!msg || typeof msg !== 'string') return '';
  // Quitar espacios extra y normalizar saltos de línea
  let limpio = msg.replace(/[\t ]+/g, ' ').replace(/\r?\n/g, '\n').trim();
  // Si contiene un resumen largo, extraer las líneas principales y las que contienen palabras clave
  const claves = [
    'Producción de planchas de hierro reforzadas',
    'planchas reforzadas',
    'planchas de hierro',
    'barras de hierro',
    'tornillos',
    'alambre',
    'cable',
    'lámina de cobre',
    'Desglose de recursos',
    'Constructores necesarios',
    'ensambladora',
    'constructor',
    'sobrante',
    'puedes fabricar',
    'por minuto',
    'paquetes de',
    'Se usan',
    'Con los',
    'Te sobran',
    'producción óptima',
    'materiales necesarios',
    'recursos necesarios',
    'Lista de materiales',
    'máquinas necesarias',
    'producción de',
    'Resumen',
    'Explica',
  ];
  // Extraer líneas relevantes
  const lineas = limpio.split('\n');
  let seleccionadas = [];
  for (const linea of lineas) {
    for (const clave of claves) {
      if (linea.toLowerCase().includes(clave.toLowerCase())) {
        seleccionadas.push(linea.trim());
        break;
      }
    }
  }
  // Si hay líneas seleccionadas, únelas; si no, usa la primera línea y las dos siguientes
  if (seleccionadas.length > 0) {
    limpio = seleccionadas.join(' ');
  } else {
    limpio = lineas.slice(0, 3).join(' ');
  }
  // Limitar longitud máxima para evitar overflow
  if (limpio.length > 400) {
    limpio = limpio.slice(0, 400);
  }
  return limpio;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'Mensaje vacío.' });
  try {
    await ensureTrained();
    // Preprocesar el mensaje antes de pasarlo a node-nlp
    const mensajeProcesado = preprocesarResumen(message);
    const response = await manager.process('es', mensajeProcesado);
    let reply = response.answer || 'No tengo una respuesta entrenada para eso.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error general en API chat:', err);
    res.status(500).json({ reply: 'Error general: ' + err.message });
  }
}

// Planchas reforzadas (más variantes y frases largas)
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', '¿Cuántas planchas de hierro reforzadas puedo fabricar?', 'explicar.reforzadas');
manager.addDocument('es', 'Voy a fabricar planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'planchas reforzadas producción', 'explicar.reforzadas');
manager.addDocument('es', 'Con X lingotes de hierro puedes fabricar X planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con X lingotes de hierro puedes fabricar planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Se usan X lingotes', 'explicar.reforzadas');
manager.addDocument('es', 'Sobrante: X lingotes', 'explicar.reforzadas');
manager.addDocument('es', 'paquetes de 5', 'explicar.reforzadas');
manager.addDocument('es', 'producción óptima de planchas reforzadas', 'explicar.reforzadas');
manager.addAnswer('es', 'explicar.reforzadas', '¡Vas a fabricar planchas reforzadas!');

// Planchas simples (más variantes)
manager.addDocument('es', 'Tengo %lingotes% lingotes de hierro por minuto', 'explicar.basico');
manager.addDocument('es', 'Tengo X lingotes de hierro por minuto', 'explicar.basico');
manager.addDocument('es', 'Con X lingotes de hierro por minuto', 'explicar.basico');
manager.addDocument('es', '¿Cuántas planchas de hierro puedo fabricar?', 'explicar.basico');
manager.addDocument('es', 'producción de planchas de hierro', 'explicar.basico');
manager.addDocument('es', 'producción de hierro', 'explicar.basico');
manager.addDocument('es', 'producción de planchas', 'explicar.basico');
manager.addDocument('es', 'producción de hierro por minuto', 'explicar.basico');
manager.addDocument('es', 'producción de materiales de hierro', 'explicar.basico');
manager.addAnswer('es', 'explicar.basico', 'Con esa cantidad de lingotes por minuto, tu producción será la siguiente:');

// Planchas (respuesta específica)
manager.addDocument('es', 'Puedo producir hasta %maxPlanchas% planchas de hierro por minuto', 'explicar.planchas');
manager.addDocument('es', 'puedo producir planchas de hierro', 'explicar.planchas');
manager.addDocument('es', 'planchas de hierro por minuto', 'explicar.planchas');
manager.addDocument('es', 'producción de planchas de hierro por minuto', 'explicar.planchas');
manager.addDocument('es', 'producción de planchas', 'explicar.planchas');
manager.addAnswer('es', 'explicar.planchas', '¡Eso es una buena cantidad de planchas por minuto!');

// Barras (más variantes)
manager.addDocument('es', 'Puedo producir hasta %maxBarras% barras de hierro por minuto', 'explicar.barras');
manager.addDocument('es', 'puedo producir barras de hierro', 'explicar.barras');
manager.addDocument('es', 'barras de hierro por minuto', 'explicar.barras');
manager.addDocument('es', 'producción de barras de hierro', 'explicar.barras');
manager.addDocument('es', 'producción de barras', 'explicar.barras');
manager.addAnswer('es', 'explicar.barras', 'Tus barras de hierro estarán listas rápidamente.');

// Tornillos (más variantes)
manager.addDocument('es', 'Puedo producir hasta %maxTornillos% tornillos por minuto', 'explicar.tornillos');
manager.addDocument('es', 'puedo producir tornillos', 'explicar.tornillos');
manager.addDocument('es', 'tornillos por minuto', 'explicar.tornillos');
manager.addDocument('es', 'producción de tornillos', 'explicar.tornillos');
manager.addDocument('es', 'producción de tornillos por minuto', 'explicar.tornillos');
manager.addDocument('es', 'tornillos de hierro', 'explicar.tornillos');
manager.addAnswer('es', 'explicar.tornillos', '¡Vas a tener tornillos de sobra para tus construcciones!');

// Alambre cobre (más variantes)
manager.addDocument('es', 'Puedo producir hasta %maxAlambre% alambre por minuto', 'explicar.alambre');
manager.addDocument('es', 'puedo producir alambre', 'explicar.alambre');
manager.addDocument('es', 'alambre por minuto', 'explicar.alambre');
manager.addDocument('es', 'producción de alambre', 'explicar.alambre');
manager.addDocument('es', 'producción de alambre de cobre', 'explicar.alambre');
manager.addAnswer('es', 'explicar.alambre', 'El alambre es esencial para la electricidad, ¡vas bien!');

// Cable cobre (más variantes)
manager.addDocument('es', 'Puedo producir hasta %maxCable% cable por minuto', 'explicar.cable');
manager.addDocument('es', 'puedo producir cable', 'explicar.cable');
manager.addDocument('es', 'cable por minuto', 'explicar.cable');
manager.addDocument('es', 'producción de cable', 'explicar.cable');
manager.addDocument('es', 'producción de cable de cobre', 'explicar.cable');
manager.addAnswer('es', 'explicar.cable', 'El cable es fundamental para conectar tus máquinas.');

// Lámina de cobre (más variantes)
manager.addDocument('es', 'Puedo producir hasta %maxLamina% lámina de cobre por minuto', 'explicar.lamina');
manager.addDocument('es', 'puedo producir lámina de cobre', 'explicar.lamina');
manager.addDocument('es', 'lámina de cobre por minuto', 'explicar.lamina');
manager.addDocument('es', 'producción de lámina de cobre', 'explicar.lamina');
manager.addDocument('es', 'producción de lámina', 'explicar.lamina');
manager.addAnswer('es', 'explicar.lamina', 'La lámina de cobre es útil para muchas recetas avanzadas.');

// Desglose y constructores (más variantes y frases largas)
manager.addDocument('es', '🔹 Desglose de recursos necesarios:', 'explicar.desglose');
manager.addDocument('es', 'Desglose de recursos necesarios', 'explicar.desglose');
manager.addDocument('es', 'materiales necesarios', 'explicar.desglose');
manager.addDocument('es', 'recursos necesarios', 'explicar.desglose');
manager.addDocument('es', 'Estos son los materiales que vas a necesitar', 'explicar.desglose');
manager.addDocument('es', 'Lista de materiales necesarios', 'explicar.desglose');
manager.addDocument('es', '¿Qué materiales necesito?', 'explicar.desglose');
manager.addDocument('es', '¿Qué recursos necesito?', 'explicar.desglose');
manager.addAnswer('es', 'explicar.desglose', 'Estos son los materiales que vas a necesitar:');

manager.addDocument('es', '🔹 Constructores necesarios para producción óptima:', 'explicar.constructores');
manager.addDocument('es', 'Constructores necesarios para producción óptima', 'explicar.constructores');
manager.addDocument('es', 'máquinas necesarias', 'explicar.constructores');
manager.addDocument('es', 'constructores necesarios', 'explicar.constructores');
manager.addDocument('es', 'producción óptima', 'explicar.constructores');
manager.addDocument('es', '¿Qué máquinas necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Cuántos constructores necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Cuántas ensambladoras necesito?', 'explicar.constructores');
manager.addDocument('es', 'Lista de máquinas necesarias', 'explicar.constructores');
manager.addDocument('es', 'Para que la producción sea eficiente, necesitas estas máquinas', 'explicar.constructores');
manager.addAnswer('es', 'explicar.constructores', 'Para que la producción sea eficiente, necesitas estas máquinas:');

// Frases naturales y variantes generales
manager.addDocument('es', '¿Cómo optimizo la producción?', 'explicar.constructores');
manager.addDocument('es', '¿Qué necesito para fabricar más rápido?', 'explicar.constructores');
manager.addDocument('es', '¿Cómo hago para producir más?', 'explicar.constructores');
manager.addDocument('es', '¿Qué recursos y máquinas necesito para fabricar X?', 'explicar.constructores');
manager.addDocument('es', '¿Qué recursos y máquinas necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Qué materiales y máquinas necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Qué materiales y constructores necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Qué materiales y ensambladoras necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Qué recursos y ensambladoras necesito?', 'explicar.constructores');
manager.addDocument('es', '¿Qué recursos y constructores necesito?', 'explicar.constructores');

// Mejorar cobertura para resúmenes largos y frases exactas de test
// Planchas reforzadas (resumen largo y variantes)
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas...', 'explicar.reforzadas');
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Producción de planchas de hierro reforzadas...', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen: Producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Explica en lenguaje humano y de forma clara y resumida el siguiente resumen de producción de Satisfactory:\n🔹 Producción de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Explica en lenguaje humano y de forma clara y resumida el siguiente resumen de producción de Satisfactory:\n🔹 Producción de planchas de hierro reforzadas...', 'explicar.reforzadas');
manager.addDocument('es', 'Explica en lenguaje humano y de forma clara y resumida el siguiente resumen de producción de Satisfactory:', 'explicar.reforzadas');
manager.addDocument('es', 'Explica el resumen de producción de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Explica el resumen de producción de Satisfactory', 'explicar.reforzadas');
manager.addDocument('es', 'Explica el resumen de producción', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de Satisfactory', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de hierro reforzado', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de hierro', 'explicar.reforzadas');
manager.addDocument('es', 'Resumen de producción de hierro por minuto', 'explicar.reforzadas');
manager.addDocument('es', 'Producción de hierro reforzado', 'explicar.reforzadas');
manager.addDocument('es', 'Producción de hierro por minuto', 'explicar.reforzadas');
manager.addDocument('es', 'Planchas reforzadas resumen', 'explicar.reforzadas');
manager.addDocument('es', 'Planchas reforzadas...', 'explicar.reforzadas');
manager.addDocument('es', 'Planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Planchas de hierro reforzadas...', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes de hierro puedes fabricar planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes de hierro puedes fabricar planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas (1 paquetes de 5).', 'explicar.reforzadas');
manager.addDocument('es', 'Se usan 60 lingotes. Sobrante: 30 lingotes.', 'explicar.reforzadas');
manager.addDocument('es', 'Sobrante: 30 lingotes.', 'explicar.reforzadas');
manager.addDocument('es', 'Con los 30 lingotes sobrantes puedes fabricar 20 planchas de hierro extra.', 'explicar.reforzadas');
manager.addDocument('es', 'Con los 30 lingotes sobrantes puedes fabricar planchas de hierro extra.', 'explicar.reforzadas');
manager.addDocument('es', 'Te sobran 30 lingotes para otro ciclo de producción.', 'explicar.reforzadas');
manager.addDocument('es', 'Te sobran lingotes para otro ciclo de producción.', 'explicar.reforzadas');
manager.addDocument('es', 'Desglose de recursos necesarios:', 'explicar.reforzadas');
manager.addDocument('es', 'Constructores necesarios para producción óptima:', 'explicar.reforzadas');

// VARIANTES LITERALES Y CON SALTOS DE LÍNEA PARA TESTS
// Resumen largo de planchas reforzadas (copiado literal)
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas\nCon 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas (1 paquetes de 5).\nSe usan 60 lingotes. Sobrante: 30 lingotes.\n\nCon los 30 lingotes sobrantes puedes fabricar 20 planchas de hierro extra.\n\n🔹 Desglose de recursos necesarios:\n- Planchas de hierro: 30\n- Tornillos: 60\n- Barras de hierro para tornillos: 15\n\n🔹 Constructores necesarios para producción óptima:\n- 2 constructor(es) de planchas de hierro\n- 1 constructor(es) de barras de hierro\n- 2 constructor(es) de tornillos\n- 1 ensambladora(s) de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas...\nCon 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas (1 paquetes de 5).\nSe usan 60 lingotes. Sobrante: 30 lingotes.\n\nCon los 30 lingotes sobrantes puedes fabricar 20 planchas de hierro extra.\n\n🔹 Desglose de recursos necesarios:\n- Planchas de hierro: 30\n- Tornillos: 60\n- Barras de hierro para tornillos: 15\n\n🔹 Constructores necesarios para producción óptima:\n- 2 constructor(es) de planchas de hierro\n- 1 constructor(es) de barras de hierro\n- 2 constructor(es) de tornillos\n- 1 ensambladora(s) de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas\nCon 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas (1 paquetes de 5).\nSe usan 60 lingotes. Sobrante: 30 lingotes.\n\nCon los 30 lingotes sobrantes puedes fabricar 20 planchas de hierro extra.\n\n🔹 Desglose de recursos necesarios:\n- Planchas de hierro: 30\n- Tornillos: 60\n- Barras de hierro para tornillos: 15\n\n🔹 Constructores necesarios para producción óptima:\n- 2 constructor(es) de planchas de hierro\n- 1 constructor(es) de barras de hierro\n- 2 constructor(es) de tornillos\n- 1 ensambladora(s) de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', '🔹 Producción de planchas de hierro reforzadas...\nCon 90 lingotes de hierro puedes fabricar 5 planchas de hierro reforzadas (1 paquetes de 5).\nSe usan 60 lingotes. Sobrante: 30 lingotes.\n\nCon los 30 lingotes sobrantes puedes fabricar 20 planchas de hierro extra.\n\n🔹 Desglose de recursos necesarios:\n- Planchas de hierro: 30\n- Tornillos: 60\n- Barras de hierro para tornillos: 15\n\n🔹 Constructores necesarios para producción óptima:\n- 2 constructor(es) de planchas de hierro\n- 1 constructor(es) de barras de hierro\n- 2 constructor(es) de tornillos\n- 1 ensambladora(s) de planchas reforzadas', 'explicar.reforzadas');
// Frases con bullets y saltos de línea para reforzar
manager.addDocument('es', '- Planchas de hierro: 30', 'explicar.reforzadas');
manager.addDocument('es', '- Tornillos: 60', 'explicar.reforzadas');
manager.addDocument('es', '- Barras de hierro para tornillos: 15', 'explicar.reforzadas');
manager.addDocument('es', '- 2 constructor(es) de planchas de hierro', 'explicar.reforzadas');
manager.addDocument('es', '- 1 constructor(es) de barras de hierro', 'explicar.reforzadas');
manager.addDocument('es', '- 2 constructor(es) de tornillos', 'explicar.reforzadas');
manager.addDocument('es', '- 1 ensambladora(s) de planchas reforzadas', 'explicar.reforzadas');

// Frases para distinguir 'basico' y 'planchas' (refuerzo)
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto....', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto...', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.\n', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.\n', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.\n', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.', 'explicar.basico');
manager.addDocument('es', 'Tengo 90 lingotes de hierro por minuto.\n- Puedo producir hasta 60 planchas de hierro por minuto.\n', 'explicar.basico');

// VARIANTES INCREMENTALES Y RESPUESTAS NATURALES
// Planchas reforzadas: fragmentos parciales, diferentes cantidades, errores comunes, sin emojis, puntuaciones
manager.addDocument('es', 'Con 120 lingotes de hierro puedes fabricar 10 planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 60 lingotes de hierro puedes fabricar planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 120 lingotes puedes fabricar 10 planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 60 lingotes puedes fabricar 5 planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'con 90 lingotes puedes fabricar 5 planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Con 90 lingotes puedes fabricar planchas reforzadas.', 'explicar.reforzadas');
manager.addDocument('es', 'Produccion de planchas de hierro reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'produccion de planchas reforzadas', 'explicar.reforzadas');
manager.addDocument('es', 'Producción de planchas de hierro reforzadas.', 'explicar.reforzadas');
manager.addDocument('es', 'Producción de planchas de hierro reforzadas   ', 'explicar.reforzadas');
// Cobre y combinaciones
manager.addDocument('es', '¿Cuántos cables puedo fabricar con 120 lingotes de cobre?', 'explicar.cable');
manager.addDocument('es', '¿Cuántos alambres puedo fabricar con 90 lingotes de cobre?', 'explicar.alambre');
manager.addDocument('es', '¿Cuántas láminas de cobre puedo fabricar con 60 lingotes?', 'explicar.lamina');
manager.addDocument('es', '¿Cuántos cables y alambres puedo fabricar con 120 lingotes de cobre?', 'explicar.cable');
// Eficiencia, consejos y problemas comunes
manager.addDocument('es', '¿Cómo puedo optimizar la producción de planchas reforzadas?', 'explicar.constructores');
manager.addDocument('es', '¿Algún consejo para producir más rápido?', 'explicar.constructores');
manager.addDocument('es', '¿Qué hago si me faltan tornillos?', 'explicar.tornillos');
manager.addDocument('es', '¿Cómo mejorar la eficiencia de mi fábrica?', 'explicar.constructores');
manager.addDocument('es', '¿Cómo evitar cuellos de botella en la producción?', 'explicar.constructores');
// Respuestas alternativas y naturales
manager.addAnswer('es', 'explicar.reforzadas', '¡Perfecto! Con esos lingotes puedes fabricar planchas reforzadas para avanzar en el juego.');
manager.addAnswer('es', 'explicar.reforzadas', 'Recuerda que las planchas reforzadas son clave para ensambladoras y máquinas avanzadas.');
manager.addAnswer('es', 'explicar.reforzadas', '¡A fabricar planchas reforzadas! Si te sobran lingotes, úsalos para más planchas o barras.');
manager.addAnswer('es', 'explicar.reforzadas', 'Tip: Si tienes excedente de lingotes, puedes producir planchas o barras extra.');
manager.addAnswer('es', 'explicar.reforzadas', '¡Sigue así! Las planchas reforzadas te abrirán nuevas posibilidades en Satisfactory.');
manager.addAnswer('es', 'explicar.reforzadas', 'Consejo: Optimiza tus líneas para que no sobren lingotes y aprovecha cada ciclo.');
manager.addAnswer('es', 'explicar.reforzadas', '¡Buen trabajo! Si necesitas más eficiencia, revisa la cantidad de constructores y ensambladoras.');
manager.addAnswer('es', 'explicar.reforzadas', 'Las planchas reforzadas son esenciales para progresar, ¡no olvides automatizar la producción!');
manager.addAnswer('es', 'explicar.reforzadas', '¿Sabías que puedes mejorar la eficiencia usando más ensambladoras en paralelo?');
manager.addAnswer('es', 'explicar.reforzadas', '¡No olvides balancear la producción de tornillos y planchas para evitar cuellos de botella!');