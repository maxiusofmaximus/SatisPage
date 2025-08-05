// Utilidades compartidas para manejo de imágenes
// Extraído automáticamente por el sistema de refactorización

/**
 * Obtiene la imagen base64 de un producto por nombre
 * @param {string} name - Nombre del producto
 * @param {Array} recipesData - Datos de recetas
 * @returns {string|null} Imagen en base64 o null
 */
export function getImageByName(name, recipesData) {
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

/**
 * Busca múltiples imágenes por nombres
 * @param {Array} names - Array de nombres
 * @param {Array} recipesData - Datos de recetas
 * @returns {Object} Objeto con nombres como keys e imágenes como values
 */
export function getMultipleImagesByNames(names, recipesData) {
  const images = {};
  names.forEach(name => {
    images[name] = getImageByName(name, recipesData);
  });
  return images;
}

/**
 * Cache para imágenes ya buscadas (optimización)
 */
const imageCache = new Map();

/**
 * Versión optimizada con cache de getImageByName
 * @param {string} name - Nombre del producto
 * @param {Array} recipesData - Datos de recetas
 * @returns {string|null} Imagen en base64 o null
 */
export function getImageByNameCached(name, recipesData) {
  const cacheKey = `${name}_${recipesData?.length || 0}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  const image = getImageByName(name, recipesData);
  imageCache.set(cacheKey, image);
  
  return image;
}

/**
 * Limpia el cache de imágenes
 */
export function clearImageCache() {
  imageCache.clear();
}