// Utilidades simplificadas para manejo de constructores

/**
 * Obtiene información del constructor para una receta
 * @param {string} recipeName - Nombre de la receta
 * @param {Object} constructorsData - Datos de constructores cargados
 * @returns {Object|null} - Información del constructor o null
 */
export function getConstructorInfo(recipeName, constructorsData) {
  if (!constructorsData?.recipe_constructor_mapping) {
    return null;
  }

  const constructorId = constructorsData.recipe_constructor_mapping[recipeName];
  if (!constructorId) {
    return null;
  }

  return constructorsData.constructors[constructorId];
}

/**
 * Carga los datos de constructores desde el archivo JSON
 * @param {Object} constructorsData - Datos de constructores cargados
 * @returns {Array} - Array de constructores
 */
export function getAllConstructors(constructorsData) {
  if (!constructorsData || !constructorsData.constructors) {
    return [];
  }

  return Object.values(constructorsData.constructors);
}

/**
 * Obtiene constructores por tipo
 * @param {string} type - Tipo de constructor (smelting, assembly, manufacturing, refining)
 * @param {Object} constructorsData - Datos de constructores cargados
 * @returns {Array} - Array de constructores del tipo especificado
 */
export function getConstructorsByType(type, constructorsData) {
  if (!constructorsData || !constructorsData.constructors) {
    return [];
  }

  return Object.values(constructorsData.constructors).filter(
    constructor => constructor.type === type
  );
}

/**
 * Carga los datos de constructores desde el archivo JSON
 * @returns {Promise<Object>} - Promise que resuelve con los datos de constructores
 */
export async function loadConstructorsData() {
  try {
    const response = await fetch('/data/constructors.json');
    if (!response.ok) {
      throw new Error(`Error al cargar constructores: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando datos de constructores:', error);
    return null;
  }
}

/**
 * Calcula el número de constructores necesarios para una producción
 * @param {number} itemsPerMinute - Items por minuto requeridos
 * @param {number} constructorRate - Rate de producción del constructor (items/min)
 * @returns {number} - Número de constructores necesarios (redondeado hacia arriba)
 */
export function calculateConstructorsNeeded(itemsPerMinute, constructorRate) {
  if (constructorRate <= 0) {
    return 0;
  }
  return Math.ceil(itemsPerMinute / constructorRate);
}

/**
 * Formatea el nombre del constructor para mostrar
 * @param {Object} constructor - Objeto constructor
 * @param {string} language - Idioma ('es' para español, 'en' para inglés)
 * @returns {string} - Nombre formateado
 */
export function formatConstructorName(constructor, language = 'es') {
  if (!constructor) return 'Constructor desconocido';
  
  return language === 'es' && constructor.name_es 
    ? constructor.name_es 
    : constructor.name;
}

/**
 * Formatea la descripción del constructor para mostrar
 * @param {Object} constructor - Objeto constructor
 * @param {string} language - Idioma ('es' para español, 'en' para inglés)
 * @returns {string} - Descripción formateada
 */
export function formatConstructorDescription(constructor, language = 'es') {
  if (!constructor) return 'Sin descripción';
  
  return language === 'es' && constructor.description_es 
    ? constructor.description_es 
    : constructor.description;
}