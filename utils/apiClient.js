/**
 * Cliente para la API de datos de Satisfactory
 * Permite obtener información de constructores y recetas desde la API separada
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Realiza una petición GET a la API
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} - Respuesta de la API
 */
async function apiRequest(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error en la respuesta de la API');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Obtiene todos los constructores disponibles
 * @returns {Promise<Array>} - Lista de constructores
 */
export async function getAllConstructors() {
  return await apiRequest('/api/constructors');
}

/**
 * Obtiene el constructor asociado a una receta específica
 * @param {string} recipe - Nombre de la receta
 * @returns {Promise<Object>} - Información del constructor y la receta
 */
export async function getConstructorByRecipe(recipe) {
  return await apiRequest(`/api/constructor/${recipe}`);
}

/**
 * Obtiene información de una receta específica
 * @param {string} recipeName - Nombre de la receta
 * @returns {Promise<Object>} - Información de la receta y constructor
 */
export async function getRecipeInfo(recipeName) {
  return await apiRequest(`/api/recipe/${recipeName}`);
}

/**
 * Obtiene información completa (receta + constructor + imágenes)
 * @param {string} recipeName - Nombre de la receta
 * @returns {Promise<Object>} - Información completa
 */
export async function getCompleteInfo(recipeName) {
  return await apiRequest(`/api/complete/${recipeName}`);
}

/**
 * Busca recetas por nombre de producto
 * @param {string} productName - Nombre del producto a buscar
 * @returns {Promise<Array>} - Lista de recetas que coinciden
 */
export async function searchByProduct(productName) {
  return await apiRequest(`/api/search/product/${productName}`);
}

/**
 * Verifica el estado de la API
 * @returns {Promise<Object>} - Estado del servidor
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Error verificando estado de la API:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función auxiliar para obtener imagen de constructor por receta
 * Compatible con el sistema existente
 * @param {string} recipe - Nombre de la receta
 * @returns {Promise<string|null>} - Imagen base64 del constructor o null
 */
export async function getConstructorImageByRecipeAPI(recipe) {
  try {
    const data = await getConstructorByRecipe(recipe);
    return data.image || null;
  } catch (error) {
    console.error(`Error obteniendo imagen del constructor para ${recipe}:`, error);
    return null;
  }
}

/**
 * Función auxiliar para obtener información del constructor por receta
 * Compatible con el sistema existente
 * @param {string} recipe - Nombre de la receta
 * @returns {Promise<Object|null>} - Información del constructor o null
 */
export async function getConstructorInfoByRecipeAPI(recipe) {
  try {
    const data = await getConstructorByRecipe(recipe);
    return data.constructor || null;
  } catch (error) {
    console.error(`Error obteniendo info del constructor para ${recipe}:`, error);
    return null;
  }
}

/**
 * Mapeo de productos a recetas para compatibilidad
 */
const PRODUCT_TO_RECIPE_MAP = {
  'planchas': 'iron_plate',
  'barras': 'iron_rod',
  'tornillos': 'screw',
  'reforzadas': 'reinforced_iron_plate',
  'alambre': 'wire',
  'cable': 'cable',
  'lamina': 'iron_plate'
};

/**
 * Obtiene imagen del constructor por nombre de producto
 * @param {string} product - Nombre del producto
 * @returns {Promise<string|null>} - Imagen base64 del constructor
 */
export async function getConstructorImageByProduct(product) {
  const recipe = PRODUCT_TO_RECIPE_MAP[product.toLowerCase()];
  if (!recipe) {
    console.warn(`No se encontró mapeo de receta para el producto: ${product}`);
    return null;
  }
  
  return await getConstructorImageByRecipeAPI(recipe);
}

/**
 * Ejemplo de uso con manejo de errores y fallback
 * @param {string} recipe - Nombre de la receta
 * @param {Function} fallbackFunction - Función de respaldo si la API falla
 * @returns {Promise<Object>} - Datos del constructor
 */
export async function getConstructorWithFallback(recipe, fallbackFunction) {
  try {
    // Intentar obtener de la API
    return await getConstructorByRecipe(recipe);
  } catch (error) {
    console.warn(`API no disponible para ${recipe}, usando fallback:`, error.message);
    
    // Usar función de respaldo (datos locales)
    if (typeof fallbackFunction === 'function') {
      return fallbackFunction(recipe);
    }
    
    throw error;
  }
}

// Configuración por defecto
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 5000,
  retries: 2
};

export default {
  getAllConstructors,
  getConstructorByRecipe,
  getRecipeInfo,
  getCompleteInfo,
  searchByProduct,
  checkApiHealth,
  getConstructorImageByRecipeAPI,
  getConstructorInfoByRecipeAPI,
  getConstructorImageByProduct,
  getConstructorWithFallback,
  API_CONFIG
};