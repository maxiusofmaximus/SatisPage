# Errores Comunes - SatisPage Development

## Errores de Arquitectura y Estructura

### 1. Componentes Sobrecargados
- **Error**: Crear componentes que manejan múltiples responsabilidades (ej: Chatbot que también maneja cálculos de producción)
- **Solución**: Separar responsabilidades en componentes específicos
- **Ejemplo**: `ProductionAnalyzer` vs `Chatbot` - cada uno con su propósito específico

### 2. Funciones Duplicadas
- **Error**: Crear múltiples funciones que hacen lo mismo con nombres diferentes
- **Ejemplos encontrados**:
  - `getConstructorForProduct` vs `getConstructorType`
  - `getConstructorImageByRecipe` vs `getConstructorInfoByRecipe`
- **Solución**: Consolidar en una sola función bien nombrada

### 3. Estructura de Datos Inconsistente
- **Error**: Usar diferentes formatos para los mismos datos en diferentes partes del código
- **Ejemplo**: Mezclar español e inglés en nombres de propiedades
- **Solución**: Definir un esquema de datos consistente desde el inicio

## Errores de Cálculo

### 4. Cálculo Incorrecto de Constructores
- **Error**: Usar `Math.ceil(totalProducto / productosPorConstructor)` en lugar de usar directamente `lotes`
- **Problema**: Mostraba "50 Constructor" en lugar de "5 Constructor"
- **Solución**: `const constructoresNecesarios = lotes;`

### 5. Confusión entre Lotes y Productos Totales
- **Error**: No distinguir claramente entre número de lotes y cantidad total de productos
- **Solución**: Definir claramente qué representa cada variable

## Errores de Configuración

### 6. Problemas con Repositorios Git Anidados
- **Error**: Tener subdirectorios con sus propios repositorios git (api-project/.git)
- **Problema**: Causa errores al hacer `git add .`
- **Solución**: Eliminar repositorios anidados o usar git submodules correctamente

### 7. Configuración de Puertos
- **Error**: No manejar conflictos de puertos automáticamente
- **Solución**: Next.js maneja esto automáticamente, pero documentar puertos esperados

## Errores de Desarrollo

### 8. Imports Innecesarios
- **Error**: Mantener imports de librerías no utilizadas
- **Ejemplo**: Importar React hooks que no se usan
- **Solución**: Revisar y limpiar imports regularmente

### 9. Nombres de Variables Confusos
- **Error**: Usar nombres como `data`, `info`, `result` sin contexto
- **Solución**: Usar nombres descriptivos como `constructorData`, `productionInfo`

### 10. Falta de Validación de Datos
- **Error**: No validar que los datos existen antes de usarlos
- **Ejemplo**: Acceder a propiedades sin verificar si el objeto existe
- **Solución**: Siempre validar datos antes de usarlos

## Errores de UI/UX

### 11. Imágenes Faltantes
- **Error**: Referencias a imágenes que no existen
- **Ejemplo**: "Imagen_por_poner" en lugar de placeholder real
- **Solución**: Usar placeholders SVG o imágenes por defecto

### 12. Textos Hardcodeados
- **Error**: Mezclar español e inglés sin consistencia
- **Solución**: Definir un idioma principal y ser consistente

## Errores de Performance

### 13. Funciones Complejas Innecesarias
- **Error**: Crear lógica compleja cuando una solución simple funciona
- **Ejemplo**: Cálculos elaborados cuando se puede usar mapeo directo
- **Solución**: Preferir simplicidad sobre complejidad

### 14. Re-renders Innecesarios
- **Error**: No optimizar componentes React
- **Solución**: Usar useMemo, useCallback cuando sea necesario

## Mejores Prácticas para Evitar Errores

1. **Planificación**: Definir estructura de datos y arquitectura antes de codificar
2. **Nomenclatura**: Usar convenciones consistentes para nombres
3. **Validación**: Siempre validar datos de entrada
4. **Simplicidad**: Preferir soluciones simples y claras
5. **Testing**: Probar cada funcionalidad antes de continuar
6. **Documentación**: Documentar decisiones de diseño importantes
7. **Refactoring**: Refactorizar regularmente para mantener código limpio
8. **Git**: Commits pequeños y frecuentes con mensajes descriptivos

## Checklist Pre-Development

- [ ] Definir estructura de datos clara
- [ ] Establecer convenciones de nomenclatura
- [ ] Planificar arquitectura de componentes
- [ ] Configurar herramientas de desarrollo
- [ ] Definir flujo de git y branching
- [ ] Establecer estándares de código
- [ ] Planificar manejo de errores
- [ ] Definir estrategia de testing

---

**Fecha de creación**: $(Get-Date -Format "yyyy-MM-dd")
**Propósito**: Evitar repetir errores en futuros desarrollos de SatisPage