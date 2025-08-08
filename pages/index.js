import Head from 'next/head';
import Script from 'next/script';
import { useState, useEffect } from 'react';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [recipeCount, setRecipeCount] = useState(0);
  const [constructors, setConstructors] = useState({});

  // Enhanced materials database - will be populated from recipes.json
  const defaultMaterials = [
    { id: 'ai-limiter', name: 'AI Limiter', icon: 'fas fa-microchip', color: 'from-blue-400 to-blue-600', produces: 'Crystal Oscillator' },
    { id: 'adaptive-control', name: 'Adaptive Control Unit', icon: 'fas fa-cog', color: 'from-purple-400 to-purple-600', produces: 'Computer' },
    { id: 'aluminum-sheet', name: 'Alclad Aluminum Sheet', icon: 'fas fa-layer-group', color: 'from-gray-400 to-gray-600', produces: 'Aluminum Casing' },
    { id: 'alien-protein', name: 'Alien Protein', icon: 'fas fa-dna', color: 'from-green-400 to-green-600', produces: 'Biomass' },
    { id: 'alumina-solution', name: 'Alumina Solution', icon: 'fas fa-flask', color: 'from-yellow-400 to-yellow-600', produces: 'Aluminum Scrap' },
    { id: 'aluminum-casing', name: 'Aluminum Casing', icon: 'fas fa-box', color: 'from-indigo-400 to-indigo-600', produces: 'Motor' },
    { id: 'aluminum-ingot', name: 'Aluminum Ingot', icon: 'fas fa-cube', color: 'from-red-400 to-red-600', produces: 'Aluminum Sheet' },
    { id: 'aluminum-scrap', name: 'Aluminum Scrap', icon: 'fas fa-recycle', color: 'from-teal-400 to-teal-600', produces: 'Aluminum Ingot' },
    { id: 'assembly-director', name: 'Assembly Director System', icon: 'fas fa-sitemap', color: 'from-pink-400 to-pink-600', produces: 'Supercomputer' },
    { id: 'automated-wiring', name: 'Automated Wiring', icon: 'fas fa-plug', color: 'from-orange-400 to-orange-600', produces: 'High-Speed Connector' },
    { id: 'bacon-agaric', name: 'Bacon Agaric', icon: 'fas fa-seedling', color: 'from-lime-400 to-lime-600', produces: 'Alien Protein' },
    { id: 'battery', name: 'Battery', icon: 'fas fa-battery-full', color: 'from-cyan-400 to-cyan-600', produces: 'Electromagnetic Control Rod' },
    { id: 'iron-ore', name: 'Iron Ore', icon: 'fas fa-mountain', color: 'from-amber-400 to-amber-600', produces: 'Iron Ingot' },
    { id: 'iron-ingot', name: 'Iron Ingot', icon: 'fas fa-weight-hanging', color: 'from-slate-400 to-slate-600', produces: 'Iron Plate' },
    { id: 'smelter', name: 'Smelter', icon: 'fas fa-fire', color: 'from-rose-400 to-rose-600', produces: 'Refined Materials' }
  ];

  useEffect(() => {
    // Load recipes and constructors data
    Promise.all([
      fetch('/data/recipes.json').then(response => response.json()),
      fetch('/data/constructors.json').then(response => response.json())
    ])
      .then(([recipesData, constructorsData]) => {
        console.log('Recipes loaded:', recipesData.length);
        console.log('Constructors loaded:', constructorsData);
        setRecipeCount(recipesData.length);
        setConstructors(constructorsData.constructors);
        
        // Extract unique materials with their images from recipes
        const uniqueMaterials = new Map();
        
        recipesData.forEach(recipe => {
          // Add products
          recipe.products.forEach(product => {
            if (!uniqueMaterials.has(product.name)) {
              uniqueMaterials.set(product.name, {
                id: uniqueMaterials.size + 1,
                name: product.name,
                produces: product.name,
                image_base64: product.image_base64,
                color: 'from-blue-500 to-purple-600'
              });
            }
          });
          
          // Add ingredients
          recipe.ingredients.forEach(ingredient => {
            if (!uniqueMaterials.has(ingredient.name)) {
              uniqueMaterials.set(ingredient.name, {
                id: uniqueMaterials.size + 1,
                name: ingredient.name,
                produces: ingredient.name,
                image_base64: ingredient.image_base64,
                color: 'from-green-500 to-teal-600'
              });
            }
          });
        });
        
        // Convert to array and update materials
        const materialsArray = Array.from(uniqueMaterials.values());
        setMaterials(materialsArray);
        console.log('Materials extracted:', materialsArray.length);
        setRecipes(recipesData || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setMaterials(defaultMaterials);
        setLoading(false);
      });

    // Check for saved theme
    if (typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', !isDarkMode);
    }
  };

  useEffect(() => {
    const filtered = materials.filter(material => 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.produces.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
  }, [searchTerm]);

  const selectMaterial = (material) => {
    setSelectedMaterial(material);
    setSearchTerm(material.name);
    setShowForm(true);
    showNotification('Material seleccionado correctamente', 'success');
  };

  // Función para convertir nombres con espacios a formato con guiones bajos
  const nameToKey = (name) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  const calculateProduction = () => {
    if (!selectedMaterial || !quantity) {
      showNotification('Por favor selecciona un material y especifica la cantidad', 'warning');
      return;
    }

    setIsCalculating(true);
    const quantityNum = parseInt(quantity) || 1; // Evitar NaN con valor por defecto
    const newResults = [];
    
    // Validar que quantityNum sea un número válido
    if (isNaN(quantityNum) || quantityNum <= 0) {
      showNotification('Por favor ingresa una cantidad válida', 'warning');
      setIsCalculating(false);
      return;
    }

    setTimeout(() => {
      // Find the recipe for the selected material
      const recipe = recipes.find(r => 
        r.products.some(p => p.name === selectedMaterial.name)
      );
      
      if (recipe) {
        // Calcular cuántas fabricaciones necesitamos
        const productQty = recipe.products.find(p => p.name === selectedMaterial.name)?.qty || 1;
        const craftsNeeded = quantityNum / productQty; // produce N unidades por fabricación
        
        recipe.ingredients.forEach(ingredient => {
          const ingredientQty = parseFloat(ingredient.qty) || 0;
          const requiredQty = Math.ceil(ingredientQty * craftsNeeded);
          newResults.push({
            name: `${requiredQty} ${ingredient.name}`,
            image_base64: ingredient.image_base64,
            icon: 'fas fa-cube',
            color: 'from-amber-400 to-amber-600',
            type: 'input'
          });
        });

        // Agregar producto como salida
        newResults.push({
          name: `${quantityNum} ${selectedMaterial.name}`,
          image_base64: selectedMaterial.image_base64,
          icon: selectedMaterial.icon || 'fas fa-cog',
          color: 'from-green-400 to-green-600',
          type: 'output'
        });

        // Calcular máquinas necesarias basándose en la capacidad real por minuto
        const machineName = recipe.produced_in.name;
        let machinesNeeded = 1;
        
        // Buscar la capacidad de producción por minuto en constructors.json
        if (constructors && Object.keys(constructors).length > 0) {
          const constructorKey = Object.keys(constructors).find(key => 
            constructors[key].name === machineName || constructors[key].name_es === machineName
          );
          
          if (constructorKey) {
            const constructor = constructors[constructorKey];
            const recipeKey = nameToKey(selectedMaterial.name);
            
            if (constructor.production_rates && constructor.production_rates[recipeKey]) {
              const productionRate = constructor.production_rates[recipeKey];
              
              if (productionRate.per_minute && productionRate.per_minute.output) {
                const outputPerMinute = productionRate.per_minute.output[recipeKey];
                
                if (outputPerMinute) {
                  // Calcular cuántos constructores necesitamos para producir la cantidad requerida
                  // Si necesitamos 100 Iron Plate y cada constructor produce 20 por minuto,
                  // necesitamos Math.ceil(100 / 20) = 5 constructores
                  machinesNeeded = Math.ceil(quantityNum / outputPerMinute);
                }
              }
            }
          }
        }
        
        newResults.push({
          name: `${machinesNeeded} ${recipe.produced_in.name}`,
          image_base64: recipe.produced_in.image_base64,
          icon: 'fas fa-cogs',
          color: 'from-orange-500 to-red-600',
          type: 'machine'
        });
      } else {
        // Materiales sin receta
        newResults.push({
          name: `${quantityNum} ${selectedMaterial.name}`,
          image_base64: selectedMaterial.image_base64,
          icon: selectedMaterial.icon || 'fas fa-cube',
          color: selectedMaterial.color,
          type: 'input'
        });
        newResults.push({
          name: `${quantityNum} ${selectedMaterial.name}`,
          image_base64: selectedMaterial.image_base64,
          icon: 'fas fa-cog',
          color: 'from-green-400 to-green-600',
          type: 'output'
        });
        // Calcular constructores necesarios basándose en la capacidad real por minuto
        let constructorsNeeded = 1;
        
        if (constructors && constructors.constructor) {
          const constructor = constructors.constructor;
          const recipeKey = nameToKey(selectedMaterial.name);
          
          if (constructor.production_rates && constructor.production_rates[recipeKey]) {
            const productionRate = constructor.production_rates[recipeKey];
            
            if (productionRate.per_minute && productionRate.per_minute.output) {
              const outputPerMinute = productionRate.per_minute.output[recipeKey];
              
              if (outputPerMinute) {
                constructorsNeeded = Math.ceil(quantityNum / outputPerMinute);
              }
            }
          }
        }
        
        newResults.push({
          name: `${constructorsNeeded} Constructor`,
          icon: 'fas fa-cogs',
          color: 'from-orange-500 to-red-600',
          type: 'machine'
        });
      }

      setResults(newResults);
      setShowResults(true);
      setIsCalculating(false);
      showNotification('¡Cálculo completado exitosamente!', 'success');
    }, 1500);
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <>
      <Head>
        <title>Calculadora de Producción</title>
        <meta name="description" content="Calculadora de producción para Satisfactory" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script id="tailwind-config" strategy="afterInteractive">
        {`
          if (typeof tailwind !== 'undefined') {
            tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                animation: {
                  'fade-in': 'fadeIn 0.5s ease-in-out',
                  'slide-up': 'slideUp 0.3s ease-out',
                  'bounce-in': 'bounceIn 0.6s ease-out',
                  'pulse-slow': 'pulse 3s infinite',
                },
                keyframes: {
                  fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.3)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' }
                  }
                }
              }
             }
           }
          }
         `}
      </Script>

      <style jsx global>{`
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .dark .gradient-bg {
          background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
        }
        
        .material-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .material-card:hover {
          transform: translateY(-4px) scale(1.02);
        }
        
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="min-h-screen gradient-bg transition-all duration-500">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Header */}
        <header className="relative z-10 glass-effect shadow-2xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 animate-fade-in">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg floating-animation">
                    <i className="fas fa-cogs text-white text-xl"></i>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Calculadora de Producción
                  </h1>
                  <p className="text-sm text-white/70 dark:text-gray-400">Sistema avanzado de cálculo industrial</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <span className="text-sm text-white/80 dark:text-gray-300 font-medium">
                  <i className="fas fa-sun mr-2"></i>{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
                <button 
                  onClick={toggleDarkMode}
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 hover:bg-white/30"
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}>
                    <i className={`fas fa-sun text-yellow-500 text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isDarkMode ? 'hidden' : ''}`}></i>
                    <i className={`fas fa-moon text-blue-600 text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isDarkMode ? '' : 'hidden'}`}></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Main Calculator Card */}
          <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-white dark:text-gray-100">Panel de Control</h2>
            </div>

            {/* Material Search */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <label className="block text-sm font-semibold text-white/90 dark:text-gray-200 mb-3 flex items-center">
                <i className="fas fa-search mr-2 text-blue-400"></i>
                Tipo de material:
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-cube text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200"></i>
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar materiales..."
                  className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white dark:text-gray-100 placeholder-white/60 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90 dark:text-gray-200 flex items-center">
                  <i className="fas fa-th-large mr-2 text-purple-400"></i>
                  Materiales Disponibles
                </h3>
                <div className="text-sm text-white/70 dark:text-gray-400">
                  <span>{filteredMaterials.length}</span> elementos
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredMaterials.map((material, index) => (
                  <div 
                    key={material.id}
                    onClick={() => selectMaterial(material)}
                    className="material-card glass-effect rounded-2xl p-4 cursor-pointer border border-white/20 hover:border-white/40 group animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${material.color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                        {material.image_base64 ? (
                           <img 
                             src={material.image_base64} 
                             alt={material.name}
                             className="w-12 h-12 object-contain"
                           />
                         ) : (
                           <i className={`${material.icon || 'fas fa-cube'} text-white text-xl`}></i>
                         )}
                      </div>
                      <div className="text-sm text-white/90 dark:text-gray-200 font-semibold group-hover:text-white transition-colors duration-300">
                        {material.name}
                      </div>
                      <div className="text-xs text-white/60 dark:text-gray-400 mt-1">
                        Produce: {material.produces}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Material Form */}
            {showForm && (
              <div className="animate-bounce-in">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                  <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-4 flex items-center">
                    <i className="fas fa-sliders-h mr-2 text-green-400"></i>
                    Configuración de Producción
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white/90 dark:text-gray-200 mb-2">
                        <i className="fas fa-calculator mr-2 text-yellow-400"></i>
                        Cantidad:
                      </label>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Ingresa la cantidad"
                        min="1"
                        className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white dark:text-gray-100 placeholder-white/60 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/90 dark:text-gray-200 mb-2">
                        <i className="fas fa-industry mr-2 text-red-400"></i>
                        Producto a fabricar:
                      </label>
                      <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl min-h-[60px]">
                        {selectedMaterial && (
                          <>
                            <div className={`w-12 h-12 bg-gradient-to-br ${selectedMaterial.color} rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}>
                              {selectedMaterial.image_base64 ? (
                                 <img 
                                   src={selectedMaterial.image_base64} 
                                   alt={selectedMaterial.name}
                                   className="w-10 h-10 object-contain"
                                 />
                               ) : (
                                 <i className={`${selectedMaterial.icon || 'fas fa-cube'} text-white`}></i>
                               )}
                            </div>
                            <div>
                              <div className="text-white dark:text-gray-200 font-semibold">{selectedMaterial.produces}</div>
                              <div className="text-white/60 dark:text-gray-400 text-sm">Producto final</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={calculateProduction}
                    disabled={isCalculating}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCalculating ? (
                      <>
                        <i className="fas fa-spinner fa-spin text-xl"></i>
                        <span className="text-lg">Calculando...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket text-xl group-hover:animate-bounce"></i>
                        <span className="text-lg">Calcular Producción</span>
                        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="mt-8 animate-slide-up">
              <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white dark:text-gray-100 flex items-center">
                    <i className="fas fa-chart-bar mr-3 text-green-400"></i>
                    Resultados de Producción
                  </h3>
                  <button className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-all duration-300 flex items-center space-x-2">
                    <i className="fas fa-download"></i>
                    <span>Exportar</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((result, index) => {
                    const typeColors = {
                      input: 'border-blue-400/50 bg-blue-500/10',
                      output: 'border-green-400/50 bg-green-500/10',
                      machine: 'border-orange-400/50 bg-orange-500/10'
                    };
                    
                    const typeLabels = {
                      input: 'Material Requerido',
                      output: 'Producto Final',
                      machine: 'Máquina Necesaria'
                    };
                    
                    return (
                      <div 
                        key={index}
                        className="glass-effect rounded-2xl p-6 border border-white/20 text-center animate-bounce-in"
                        style={{animationDelay: `${index * 0.2}s`}}
                      >
                        <div className={`w-16 h-16 bg-gradient-to-br ${result.color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 floating-animation overflow-hidden`}>
                          {result.image_base64 ? (
                            <img 
                              src={result.image_base64} 
                              alt={result.name}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <i className={`${result.icon || 'fas fa-cube'} text-white text-xl`}></i>
                          )}
                        </div>
                        <div className="text-lg font-bold text-white dark:text-gray-100 mb-2">{result.name}</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeColors[result.type]} text-white/80 border`}>
                          {typeLabels[result.type]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => {
            const typeColors = {
              success: 'bg-green-500/90 border-green-400',
              error: 'bg-red-500/90 border-red-400',
              warning: 'bg-yellow-500/90 border-yellow-400',
              info: 'bg-blue-500/90 border-blue-400'
            };
            
            const typeIcons = {
              success: 'fas fa-check-circle',
              error: 'fas fa-exclamation-circle',
              warning: 'fas fa-exclamation-triangle',
              info: 'fas fa-info-circle'
            };
            
            return (
              <div
                key={notification.id}
                className={`${typeColors[notification.type]} backdrop-blur-sm border rounded-xl p-4 text-white shadow-lg animate-slide-up max-w-sm`}
              >
                <div className="flex items-center space-x-3">
                  <i className={`${typeIcons[notification.type]} text-lg`}></i>
                  <span className="flex-1 text-sm font-medium">{notification.message}</span>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="relative z-10 glass-effect border-t border-white/20 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="animate-fade-in">
                <h3 className="text-lg font-bold text-white dark:text-gray-100 mb-4 flex items-center">
                  <i className="fas fa-info-circle mr-2 text-blue-400"></i>
                  Acerca de
                </h3>
                <p className="text-white/70 dark:text-gray-400 text-sm leading-relaxed">
                  Calculadora avanzada de producción industrial con interfaz moderna y cálculos precisos.
                </p>
              </div>
              
              <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                <h3 className="text-lg font-bold text-white dark:text-gray-100 mb-4 flex items-center">
                  <i className="fas fa-tools mr-2 text-green-400"></i>
                  Características
                </h3>
                <ul className="text-white/70 dark:text-gray-400 text-sm space-y-2">
                  <li className="flex items-center"><i className="fas fa-check mr-2 text-green-400"></i>Cálculos en tiempo real</li>
                  <li className="flex items-center"><i className="fas fa-check mr-2 text-green-400"></i>Interfaz intuitiva</li>
                  <li className="flex items-center"><i className="fas fa-check mr-2 text-green-400"></i>Modo oscuro/claro</li>
                </ul>
              </div>
              
              <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
                <h3 className="text-lg font-bold text-white dark:text-gray-100 mb-4 flex items-center">
                  <i className="fas fa-code mr-2 text-purple-400"></i>
                  Tecnología
                </h3>
                <p className="text-white/70 dark:text-gray-400 text-sm leading-relaxed">
                  Desarrollado con tecnologías web modernas para máximo rendimiento y experiencia de usuario.
                </p>
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-8 pt-8 text-center">
              <p className="text-white/60 dark:text-gray-500 text-sm">
                © 2024 Calculadora de Producción. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}