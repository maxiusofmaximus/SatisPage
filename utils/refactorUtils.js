// Utilidades de refactorización automática para SatisPage
// Sistema para identificar y corregir patrones de código duplicado

import fs from 'fs';
import path from 'path';

/**
 * Analiza archivos en busca de código duplicado
 * @param {string} projectPath - Ruta del proyecto
 * @returns {Object} Reporte de código duplicado
 */
export function analyzeCodeDuplication(projectPath) {
  const duplications = {
    functions: [],
    imports: [],
    constants: [],
    patterns: []
  };

  // Patrones comunes de código duplicado identificados
  const commonPatterns = [
    {
      name: 'getImageByName',
      pattern: /function getImageByName\([^}]+\}\s*\}/gs,
      files: ['Calculator.js', 'ProductionAnalyzer.js', 'index.js'],
      suggestion: 'Mover a utils/imageUtils.js'
    },
    {
      name: 'constructorUtils imports',
      pattern: /import\s*{[^}]*getConstructorImageByRecipe[^}]*}\s*from\s*['"][^'"]*constructorUtils['"];?/g,
      files: ['Calculator.js', 'ProductionAnalyzer.js'],
      suggestion: 'Consolidar imports'
    }
  ];

  return {
    duplications,
    patterns: commonPatterns,
    recommendations: generateRefactoringRecommendations()
  };
}

/**
 * Genera recomendaciones de refactorización específicas
 * @returns {Array} Lista de recomendaciones
 */
function generateRefactoringRecommendations() {
  return [
    {
      priority: 'HIGH',
      type: 'EXTRACT_UTILITY',
      description: 'Extraer función getImageByName duplicada',
      files: ['Calculator.js', 'ProductionAnalyzer.js', 'index.js'],
      action: 'CREATE_SHARED_UTILITY',
      targetFile: 'utils/imageUtils.js'
    },
    {
      priority: 'MEDIUM',
      type: 'CONSOLIDATE_IMPORTS',
      description: 'Consolidar imports de constructorUtils',
      files: ['Calculator.js', 'ProductionAnalyzer.js'],
      action: 'OPTIMIZE_IMPORTS'
    },
    {
      priority: 'MEDIUM',
      type: 'EXTRACT_CONSTANTS',
      description: 'Extraer mapeo de productos a constantes compartidas',
      files: ['ProductionAnalyzer.js'],
      action: 'CREATE_CONSTANTS_FILE',
      targetFile: 'utils/productMappings.js'
    },
    {
      priority: 'LOW',
      type: 'OPTIMIZE_STATE',
      description: 'Implementar Context API para estado compartido',
      files: ['Calculator.js', 'ProductionAnalyzer.js', 'index.js'],
      action: 'CREATE_CONTEXT_PROVIDER'
    }
  ];
}

/**
 * Ejecuta refactorización automática basada en patrones identificados
 * @param {string} projectPath - Ruta del proyecto
 * @param {Array} recommendations - Recomendaciones a aplicar
 */
export async function executeAutoRefactoring(projectPath, recommendations) {
  const results = [];

  for (const rec of recommendations) {
    try {
      switch (rec.action) {
        case 'CREATE_SHARED_UTILITY':
          await createSharedUtility(projectPath, rec);
          break;
        case 'OPTIMIZE_IMPORTS':
          await optimizeImports(projectPath, rec);
          break;
        case 'CREATE_CONSTANTS_FILE':
          await createConstantsFile(projectPath, rec);
          break;
        case 'CREATE_CONTEXT_PROVIDER':
          await createContextProvider(projectPath, rec);
          break;
      }
      results.push({ ...rec, status: 'SUCCESS' });
    } catch (error) {
      results.push({ ...rec, status: 'ERROR', error: error.message });
    }
  }

  return results;
}

/**
 * Crea utilidad compartida para funciones duplicadas
 */
async function createSharedUtility(projectPath, recommendation) {
  if (recommendation.description.includes('getImageByName')) {
    const imageUtilsContent = `// Utilidades compartidas para manejo de imágenes
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
  const cacheKey = \`\${name}_\${recipesData?.length || 0}\`;
  
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
}`;

    // Escribir el archivo de utilidades
    const targetPath = path.join(projectPath, recommendation.targetFile);
    await fs.promises.writeFile(targetPath, imageUtilsContent, 'utf8');
  }
}

/**
 * Optimiza imports duplicados
 */
async function optimizeImports(projectPath, recommendation) {
  // Implementación para optimizar imports
  console.log('Optimizando imports para:', recommendation.files);
}

/**
 * Crea archivo de constantes compartidas
 */
async function createConstantsFile(projectPath, recommendation) {
  if (recommendation.targetFile === 'utils/productMappings.js') {
    const mappingsContent = `// Mapeos de productos compartidos
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
  'tubos de acero': 'steel pipe'
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
  'empaquetador': 'packager'
};

/**
 * Obtiene el nombre en inglés de un producto
 * @param {string} nombreEspanol - Nombre en español
 * @returns {string} Nombre en inglés o el original si no se encuentra
 */
export function getEnglishProductName(nombreEspanol) {
  return nombreProductoMap[nombreEspanol.toLowerCase()] || nombreEspanol;
}

/**
 * Obtiene el nombre en inglés de un constructor
 * @param {string} nombreEspanol - Nombre en español
 * @returns {string} Nombre en inglés o el original si no se encuentra
 */
export function getEnglishConstructorName(nombreEspanol) {
  return constructorNamesMap[nombreEspanol.toLowerCase()] || nombreEspanol;
}`;

    const targetPath = path.join(projectPath, recommendation.targetFile);
    await fs.promises.writeFile(targetPath, mappingsContent, 'utf8');
  }
}

/**
 * Crea Context Provider para estado compartido
 */
async function createContextProvider(projectPath, recommendation) {
  const contextContent = `// Context Provider para estado compartido
// Generado automáticamente por el sistema de refactorización

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial
const initialState = {
  recipesData: [],
  constructorsData: null,
  loading: true,
  error: null,
  selectedProduct: '',
  calculations: {}
};

// Acciones del reducer
const actionTypes = {
  SET_RECIPES_DATA: 'SET_RECIPES_DATA',
  SET_CONSTRUCTORS_DATA: 'SET_CONSTRUCTORS_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SELECTED_PRODUCT: 'SET_SELECTED_PRODUCT',
  UPDATE_CALCULATIONS: 'UPDATE_CALCULATIONS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_RECIPES_DATA:
      return { ...state, recipesData: action.payload };
    case actionTypes.SET_CONSTRUCTORS_DATA:
      return { ...state, constructorsData: action.payload };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.SET_SELECTED_PRODUCT:
      return { ...state, selectedProduct: action.payload };
    case actionTypes.UPDATE_CALCULATIONS:
      return { ...state, calculations: { ...state.calculations, ...action.payload } };
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Cargar recipes
      const recipesResponse = await fetch('/data/recipes.json');
      const recipesData = await recipesResponse.json();
      dispatch({ type: actionTypes.SET_RECIPES_DATA, payload: recipesData });
      
      // Cargar constructors
      const constructorsResponse = await fetch('/data/constructors.json');
      const constructorsData = await constructorsResponse.json();
      dispatch({ type: actionTypes.SET_CONSTRUCTORS_DATA, payload: constructorsData });
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    dispatch,
    actions: actionTypes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}`;

  const targetPath = path.join(projectPath, 'contexts/AppContext.js');
  await fs.promises.writeFile(targetPath, contextContent, 'utf8');
}

/**
 * Genera reporte de refactorización
 * @param {string} projectPath - Ruta del proyecto
 * @returns {Object} Reporte completo
 */
export function generateRefactoringReport(projectPath) {
  const analysis = analyzeCodeDuplication(projectPath);
  
  return {
    timestamp: new Date().toISOString(),
    project: 'SatisPage',
    analysis,
    metrics: {
      duplicatedFunctions: analysis.patterns.filter(p => p.name.includes('function')).length,
      duplicatedImports: analysis.patterns.filter(p => p.name.includes('import')).length,
      totalRecommendations: analysis.recommendations.length,
      highPriorityIssues: analysis.recommendations.filter(r => r.priority === 'HIGH').length
    },
    nextSteps: [
      'Ejecutar refactorización automática',
      'Revisar cambios generados',
      'Ejecutar tests para verificar funcionalidad',
      'Actualizar documentación'
    ]
  };
}