import json

def analyze_recipes():
    file_path = "c:\\Users\\maxli\\OneDrive - SENA\\Documentos\\SatisPage\\api-project\\data\\recipes.json"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Total de recetas: {len(data)}")
    
    # Obtener todos los productos únicos
    products = set()
    constructors = set()
    
    for recipe in data:
        if 'products' in recipe:
            for product in recipe['products']:
                if 'name' in product:
                    products.add(product['name'])
        
        if 'produced_in' in recipe and 'name' in recipe['produced_in']:
            constructors.add(recipe['produced_in']['name'])
    
    print(f"\nProductos únicos encontrados ({len(products)}):")
    for i, product in enumerate(sorted(products), 1):
        print(f"{i:3d}. {product}")
    
    print(f"\nConstructores únicos encontrados ({len(constructors)}):")
    for i, constructor in enumerate(sorted(constructors), 1):
        print(f"{i:2d}. {constructor}")
    
    # Categorizar productos por tipo de constructor
    constructor_products = {}
    for recipe in data:
        if 'produced_in' in recipe and 'products' in recipe:
            constructor_name = recipe['produced_in']['name']
            if constructor_name not in constructor_products:
                constructor_products[constructor_name] = set()
            
            for product in recipe['products']:
                if 'name' in product:
                    constructor_products[constructor_name].add(product['name'])
    
    print("\n=== PRODUCTOS POR CONSTRUCTOR ===")
    for constructor, prods in constructor_products.items():
        print(f"\n{constructor} ({len(prods)} productos):")
        for product in sorted(prods):
            print(f"  - {product}")

if __name__ == "__main__":
    analyze_recipes()