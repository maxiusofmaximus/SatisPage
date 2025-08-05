#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para expandir los productos disponibles en la calculadora
basándose en todos los productos encontrados en recipes.json
"""

import json
from collections import defaultdict

def load_recipes():
    """Cargar el archivo recipes.json"""
    try:
        with open('public/data/recipes.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error cargando recipes.json: {e}")
        return []

def analyze_products_by_constructor(recipes):
    """Analizar productos por constructor"""
    products_by_constructor = defaultdict(list)
    all_products = set()
    
    for recipe in recipes:
        if 'products' in recipe and 'produced_in' in recipe:
            constructor = recipe['produced_in'].get('name', 'Unknown')
            
            for product in recipe['products']:
                product_name = product.get('name', '')
                if product_name:
                    all_products.add(product_name)
                    products_by_constructor[constructor].append({
                        'name': product_name,
                        'amount': product.get('amount', 1),
                        'recipe': recipe
                    })
    
    return products_by_constructor, all_products

def generate_product_categories():
    """Generar categorías de productos para la interfaz"""
    recipes = load_recipes()
    if not recipes:
        return
    
    products_by_constructor, all_products = analyze_products_by_constructor(recipes)
    
    print("=== ANÁLISIS DE PRODUCTOS POR CONSTRUCTOR ===")
    print(f"Total de productos únicos: {len(all_products)}")
    print(f"Total de constructores: {len(products_by_constructor)}")
    print()
    
    # Mostrar productos por constructor
    for constructor, products in sorted(products_by_constructor.items()):
        print(f"🏭 {constructor}:")
        unique_products = {}
        for product in products:
            name = product['name']
            if name not in unique_products:
                unique_products[name] = product
        
        for name in sorted(unique_products.keys()):
            print(f"  - {name}")
        print(f"  Total: {len(unique_products)} productos únicos")
        print()
    
    # Generar estructura para JavaScript
    print("=== ESTRUCTURA PARA JAVASCRIPT ===")
    print("const productosPorConstructor = {")
    
    for constructor, products in sorted(products_by_constructor.items()):
        # Normalizar nombre del constructor para usar como key
        constructor_key = constructor.lower().replace(' ', '_').replace('-', '_')
        print(f"  {constructor_key}: [")
        
        unique_products = {}
        for product in products:
            name = product['name']
            if name not in unique_products:
                unique_products[name] = product
        
        for name in sorted(unique_products.keys()):
            # Normalizar nombre del producto para usar como key
            product_key = name.lower().replace(' ', '_').replace('-', '_')
            print(f"    {{ key: '{product_key}', label: '{name}', icon: '{name.lower()}' }},")
        
        print("  ],")
    
    print("};")
    print()
    
    # Productos más comunes
    product_count = defaultdict(int)
    for constructor, products in products_by_constructor.items():
        for product in products:
            product_count[product['name']] += 1
    
    print("=== PRODUCTOS MÁS COMUNES ===")
    for product, count in sorted(product_count.items(), key=lambda x: x[1], reverse=True)[:20]:
        print(f"{product}: {count} recetas")

if __name__ == "__main__":
    generate_product_categories()