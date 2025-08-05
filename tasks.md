# Tasks - Lista de Tareas por Resolver

## 🔧 Problemas Técnicos Identificados

### 1. Vulnerabilidades de Seguridad
- **Prioridad**: Alta
- **Descripción**: Vulnerabilidades detectadas
- **Paquetes afectados**: `xlsx`
- **Acción**: Ejecutar `npm audit fix` o actualizar dependencias manualmente

### 2. Dependencias Desactualizadas
- **Prioridad**: Media
- **Descripción**: Algunas dependencias pueden estar obsoletas
- **Acción**: Revisar y actualizar `package.json`

### 3. Archivo _app.js Faltante
- **Prioridad**: Media
- **Descripción**: No existe `pages/_app.js` para configuración global de Next.js
- **Acción**: Crear archivo para configuraciones globales, estilos y providers

## 🎨 Problemas de UI/UX

### 4. Imágenes de Constructores Incorrectas
- **Prioridad**: Alta
- **Descripción**: Las imágenes mostradas en los divs no corresponden al constructor específico de cada receta
- **Problema actual**: Se usa una imagen genérica en lugar del constructor específico
- **Acción**: Implementar mapeo correcto entre recetas y constructores específicos

### 5. Código Duplicado
- **Prioridad**: Media
- **Descripción**: Funciones `getImageByName` y `getConstructorImage` duplicadas entre componentes
- **Archivos afectados**: `Calculator.js`, `Chatbot.js`
- **Acción**: Crear utilidades compartidas en carpeta `utils/`

## 📊 Optimización de Datos

### 6. Archivo recipes.json Muy Pesado
- **Prioridad**: Alta
- **Descripción**: El archivo `recipes.json` contiene demasiada información, incluyendo imágenes base64
- **Impacto**: Carga lenta de la aplicación
- **Solución propuesta**: Separar datos en múltiples archivos

### 7. Crear JSON Separado para Constructores
- **Prioridad**: Alta
- **Descripción**: Extraer información de constructores del `recipes.json`
- **Estructura propuesta**:
  ```json
  {
    "constructors": {
      "smelter": {
        "name": "Smelter",
        "image": "data:image/png;base64,...",
        "type": "production"
      },
      "constructor": {
        "name": "Constructor",
        "image": "data:image/png;base64,...",
        "type": "assembly"
      },
      "assembler": {
        "name": "Assembler",
        "image": "data:image/png;base64,...",
        "type": "assembly"
      }
    }
  }
  ```

### 8. Proyecto Separado para API de Datos
- **Prioridad**: Alta
- **Descripción**: Crear proyecto independiente para alojar JSONs pesados
- **Beneficios**:
  - Reduce tamaño del proyecto principal
  - Permite cacheo independiente
  - Facilita actualizaciones de datos
- **Plataformas sugeridas**: GitHub + Vercel
- **Estructura**:
  ```
  satisfactory-data-api/
  ├── api/
  │   ├── recipes.json
  │   ├── constructors.json
  │   ├── items.json
  │   └── images.json
  ├── vercel.json
  └── README.md
  ```

## 🔄 Refactorización de Código

### 9. Crear Utilidades Compartidas
- **Prioridad**: Media
- **Descripción**: Centralizar funciones comunes
- **Archivos a crear**:
  - `utils/imageUtils.js`
  - `utils/calculationUtils.js`
  - `utils/dataUtils.js`

### 10. Mejorar Manejo de Estados
- **Prioridad**: Baja
- **Descripción**: Implementar Context API o estado global para datos compartidos
- **Beneficio**: Evitar prop drilling y mejorar performance

## 📱 Mejoras de Experiencia

### 11. Responsive Design
- **Prioridad**: Media
- **Descripción**: Verificar y mejorar adaptabilidad móvil
- **Acción**: Probar en diferentes dispositivos y ajustar CSS

### 12. Loading States
- **Prioridad**: Baja
- **Descripción**: Mejorar indicadores de carga
- **Acción**: Implementar skeletons y spinners más informativos

## 🎯 Plan de Implementación Sugerido

### Fase 1 (Crítica)
1. Crear proyecto separado para API de datos
2. Extraer constructores a JSON independiente
3. Corregir mapeo de imágenes de constructores
4. Resolver vulnerabilidades de seguridad

### Fase 2 (Importante)
1. Refactorizar código duplicado
2. Crear archivo `_app.js`
3. Actualizar dependencias

### Fase 3 (Mejoras)
1. Implementar utilidades compartidas
2. Mejorar responsive design
3. Optimizar estados y performance

## 🆕 Nuevas Funcionalidades Solicitadas

### 13. Expandir Productos Disponibles
- **Prioridad**: Alta
- **Descripción**: Agregar más productos basados en recipes.json
- **Productos actuales**: Solo Iron Ingot, Iron Plate, Iron Rod, Screws, Reinforced Iron Plate
- **Productos disponibles en recipes.json**: 173 recetas con productos como:
  - **Assembler** (67 productos): Adaptive Control Unit, AI Limiter, Alclad Aluminum Sheet, etc.
  - **Constructor** (25 productos): Cable, Concrete, Copper Sheet, Iron Plate, Iron Rod, etc.
  - **Foundry** (13 productos): Aluminum Ingot, Steel Beam, Steel Ingot, Steel Pipe, etc.
  - **Manufacturer** (19 productos): Computer, Heavy Modular Frame, Motor, Supercomputer, etc.
  - **Refinery** (20 productos): Aluminum Scrap, Fuel, Plastic, Polymer Resin, etc.
  - **Smelter** (6 productos): Aluminum Ingot, Caterium Ingot, Copper Ingot, Iron Ingot, etc.
  - **Y 8 tipos más de constructores** con productos específicos
- **Acción**: Implementar selector de productos basado en datos reales

### 14. Expandir Tipos de Constructores
- **Prioridad**: Alta
- **Descripción**: Agregar soporte para todos los constructores disponibles
- **Constructores actuales**: Solo Smelter
- **Constructores disponibles**: 14 tipos diferentes:
  1. Assembler (67 productos)
  2. Constructor (25 productos) 
  3. Foundry (13 productos)
  4. Manufacturer (19 productos)
  5. Refinery (20 productos)
  6. Smelter (6 productos)
  7. Blender (16 productos)
  8. Converter (17 productos)
  9. Equipment Workshop (19 productos)
  10. Particle Accelerator (6 productos)
  11. Packager (26 productos)
  12. Nuclear Power Plant (2 productos)
  13. Space Elevator (1 producto)
  14. Build Gun (1 producto)
- **Acción**: Crear interfaz para seleccionar constructor y mostrar productos disponibles

### 15. Remover Formulario de Chat Innecesario
- **Prioridad**: Media
- **Descripción**: Eliminar el formulario de chat que no es necesario
- **Ubicación**: Componente inferior de la página principal
- **Razón**: El bot debe indicar automáticamente materiales y cantidades sin preguntas del usuario
- **Acción**: Remover formulario y simplificar interfaz

### 16. Mejorar UI y Diseño General
- **Prioridad**: Alta
- **Descripción**: Rediseñar la interfaz para mejor experiencia de usuario
- **Mejoras específicas**:
  - Diseño más moderno y limpio
  - Mejor organización de selectores de productos
  - Interfaz más intuitiva para selección de constructores
  - Mejores indicadores visuales para resultados de cálculos
  - Responsive design optimizado
- **Acción**: Rediseñar componentes principales con mejor UX

### 17. Backup en GitHub
- **Prioridad**: Crítica
- **Descripción**: Subir proyecto actual a GitHub antes de implementaciones
- **Razón**: Crear punto de restauración en caso de problemas
- **Acción**: Inicializar repositorio Git y hacer push inicial

---

**Nota**: Este documento debe actualizarse conforme se completen las tareas y se identifiquen nuevos problemas.