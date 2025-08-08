import json
import os

def find_image_base64(obj, path=""):
    """Recursively find all image_base64 fields and their locations"""
    images_found = []
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{path}.{key}" if path else key
            if key == 'image_base64' and isinstance(value, str):
                preview = value[:30] + "..." if len(value) > 30 else value
                images_found.append({
                    'path': current_path,
                    'preview': preview,
                    'length': len(value)
                })
            else:
                images_found.extend(find_image_base64(value, current_path))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            current_path = f"{path}[{i}]"
            images_found.extend(find_image_base64(item, current_path))
    
    return images_found

def truncate_base64(obj):
    """Recursively truncate image_base64 fields to show only first 30 characters"""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key == 'image_base64' and isinstance(value, str):
                # Show only first 30 characters of base64 data
                result[key] = value[:30] + "..." if len(value) > 30 else value
            else:
                result[key] = truncate_base64(value)
        return result
    elif isinstance(obj, list):
        return [truncate_base64(item) for item in obj]
    else:
        return obj

def check_recipes_json():
    """Revisa el archivo recipes.json y muestra la estructura sin el contenido largo de image_base64"""
    
    recipes_path = os.path.join('public', 'data', 'recipes.json')
    
    if not os.path.exists(recipes_path):
        print(f"Error: No se encontró el archivo {recipes_path}")
        return
    
    try:
        with open(recipes_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        print(f"Archivo encontrado: {recipes_path}")
        print(f"Tipo de datos: {type(data).__name__}")
        
        # Buscar todas las imágenes base64 en toda la estructura
        all_images = find_image_base64(data)
        
        print(f"\n=== BÚSQUEDA DE IMÁGENES BASE64 ===")
        print(f"Total de campos image_base64 encontrados: {len(all_images)}")
        
        if all_images:
            print("\nUbicaciones de las imágenes:")
            for i, img in enumerate(all_images[:10]):  # Mostrar solo las primeras 10
                print(f"{i+1}. Ubicación: {img['path']}")
                print(f"   Preview: {img['preview']}")
                print(f"   Tamaño: {img['length']} caracteres")
                print()
            
            if len(all_images) > 10:
                print(f"... y {len(all_images) - 10} imágenes más")
        
        if isinstance(data, list):
            print(f"\nTotal de elementos en el array: {len(data)}")
            
            if len(data) > 0:
                first_item = data[0]
                print("\nEstructura del primer elemento:")
                if isinstance(first_item, dict):
                    print(f"Claves disponibles: {list(first_item.keys())}")
                else:
                    print(f"Primer elemento: {type(first_item).__name__}")
            
            # Mostrar algunos elementos con truncamiento
            print("\n=== Primeros 2 elementos (con image_base64 truncado) ===")
            truncated_data = truncate_base64(data[:2])
            print(json.dumps(truncated_data, indent=2, ensure_ascii=False))
            
        elif isinstance(data, dict):
            print(f"\nClaves principales: {list(data.keys())}")
            
            # Mostrar estructura truncada
            print("\n=== Estructura completa (con image_base64 truncado) ===")
            truncated_data = truncate_base64(data)
            print(json.dumps(truncated_data, indent=2, ensure_ascii=False))
        
        else:
            print(f"Tipo de datos no esperado: {type(data)}")
    
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {recipes_path}")
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
    except Exception as e:
        print(f"Error inesperado: {e}")

if __name__ == "__main__":
    check_recipes_json()