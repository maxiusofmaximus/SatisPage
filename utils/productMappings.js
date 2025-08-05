// Mapeos de productos compartidos
// Extraído automáticamente por el sistema de refactorización

/**
 * Mapeo expandido de nombres español-inglés para todos los materiales y productos
 */
export const nombreProductoMap = {
  // Productos básicos de hierro
  'planchas': 'iron plate',
  'barras': 'iron rod',
  'tornillos': 'screw',
  'placas reforzadas': 'reinforced iron plate',
  'lingotes': 'iron ingot',
  'lingotes de hierro': 'iron ingot',
  
  // Productos de cobre
  'alambre': 'wire',
  'cable': 'cable',
  'lingotes de cobre': 'copper ingot',
  'placas de cobre': 'copper sheet',
  
  // Productos avanzados
  'rotores': 'rotor',
  'motores': 'motor',
  'marcos modulares': 'modular frame',
  'placas de acero': 'steel plate',
  'vigas de acero': 'steel beam',
  'tubos de acero': 'steel pipe',
  
  // Productos de concreto
  'concreto': 'concrete',
  'cemento': 'concrete',
  
  // Productos de carbón y combustibles
  'carbón': 'coal',
  'combustible sólido': 'solid biofuel',
  'combustible compacto': 'packaged fuel',
  
  // Productos electrónicos
  'circuitos': 'circuit board',
  'placas de circuito': 'circuit board',
  'computadoras': 'computer',
  'superconductores': 'ai limiter',
  
  // Productos de cristal y cuarzo
  'cristal': 'quartz crystal',
  'cuarzo': 'quartz crystal',
  'osciladores de cristal': 'crystal oscillator',
  
  // Productos de petróleo
  'plástico': 'plastic',
  'caucho': 'rubber',
  'combustible': 'fuel',
  'residuos de petróleo': 'petroleum coke',
  
  // Productos de uranio
  'barras de uranio': 'uranium fuel rod',
  'celdas de uranio': 'uranium fuel rod',
  'residuos de uranio': 'uranium waste'
};

/**
 * Mapeo de constructores en español
 */
export const constructorNamesMap = {
  'fundidora': 'smelter',
  'constructor': 'constructor',
  'ensamblador': 'assembler',
  'fabricante': 'manufacturer',
  'refinería': 'refinery',
  'empaquetador': 'packager',
  'mezclador': 'blender',
  'acelerador de partículas': 'particle accelerator',
  'reactor nuclear': 'nuclear power plant'
};

/**
 * Mapeo de materias primas
 */
export const rawMaterialsMap = {
  'mineral de hierro': 'iron ore',
  'mineral de cobre': 'copper ore',
  'piedra caliza': 'limestone',
  'carbón': 'coal',
  'petróleo crudo': 'crude oil',
  'mineral de caterium': 'caterium ore',
  'mineral de bauxita': 'bauxite',
  'cuarzo crudo': 'raw quartz',
  'azufre': 'sulfur',
  'mineral de uranio': 'uranium ore'
};

/**
 * Obtiene el nombre en inglés de un producto
 * @param {string} nombreEspanol - Nombre en español
 * @returns {string} Nombre en inglés o el original si no se encuentra
 */
export function getEnglishProductName(nombreEspanol) {
  if (!nombreEspanol) return '';
  const normalized = nombreEspanol.toLowerCase().trim();
  return nombreProductoMap[normalized] || nombreEspanol;
}

/**
 * Obtiene el nombre en inglés de un constructor
 * @param {string} nombreEspanol - Nombre en español
 * @returns {string} Nombre en inglés o el original si no se encuentra
 */
export function getEnglishConstructorName(nombreEspanol) {
  if (!nombreEspanol) return '';
  const normalized = nombreEspanol.toLowerCase().trim();
  return constructorNamesMap[normalized] || nombreEspanol;
}

/**
 * Obtiene el nombre en inglés de una materia prima
 * @param {string} nombreEspanol - Nombre en español
 * @returns {string} Nombre en inglés o el original si no se encuentra
 */
export function getEnglishRawMaterialName(nombreEspanol) {
  if (!nombreEspanol) return '';
  const normalized = nombreEspanol.toLowerCase().trim();
  return rawMaterialsMap[normalized] || nombreEspanol;
}

/**
 * Busca un producto en todos los mapeos
 * @param {string} nombreEspanol - Nombre en español
 * @returns {Object} Resultado con tipo y nombre en inglés
 */
export function findProductInAllMappings(nombreEspanol) {
  if (!nombreEspanol) return { type: 'unknown', englishName: '' };
  
  const normalized = nombreEspanol.toLowerCase().trim();
  
  if (nombreProductoMap[normalized]) {
    return { type: 'product', englishName: nombreProductoMap[normalized] };
  }
  
  if (constructorNamesMap[normalized]) {
    return { type: 'constructor', englishName: constructorNamesMap[normalized] };
  }
  
  if (rawMaterialsMap[normalized]) {
    return { type: 'raw_material', englishName: rawMaterialsMap[normalized] };
  }
  
  return { type: 'unknown', englishName: nombreEspanol };
}

/**
 * Obtiene todos los productos disponibles
 * @returns {Array} Lista de todos los productos en español
 */
export function getAllProducts() {
  return Object.keys(nombreProductoMap);
}

/**
 * Obtiene todos los constructores disponibles
 * @returns {Array} Lista de todos los constructores en español
 */
export function getAllConstructors() {
  return Object.keys(constructorNamesMap);
}

/**
 * Obtiene todas las materias primas disponibles
 * @returns {Array} Lista de todas las materias primas en español
 */
export function getAllRawMaterials() {
  return Object.keys(rawMaterialsMap);
}