#!/usr/bin/env python3
from PIL import Image, ImageDraw

# Crear sprite sheet: 16 columnas (4 frames x 4 direcciones), 3 filas (tipos)
# Cada dirección: 4 frames de caminar
# Tamaño: 16x16 cada frame
img = Image.new('RGBA', (256, 48), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def draw_goblin(x_base, y_base, direction, frame):
    """Dibuja un goblin caminando en una dirección (4 frames)"""
    palette = {
        'verde_claro': (102, 204, 102, 255),
        'verde_oscuro': (51, 102, 51, 255),
        'amarillo': (255, 238, 102, 255),
        'oro': (255, 200, 0, 255),
        'rojo_claro': (255, 102, 102, 255),
        'rojo_oscuro': (204, 0, 0, 255),
        'marron': (139, 69, 19, 255),
        'blanco': (255, 255, 255, 255),
        'naranja': (255, 165, 0, 255),
        'piel': (255, 200, 100, 255)
    }
    
    x, y = x_base, y_base
    
    # Botas/piernas con animación de caminar
    leg_offset_l = (frame % 4) * 0.5
    leg_offset_r = ((frame + 2) % 4) * 0.5
    
    for c in [4, 5]:
        draw.point([x + c, y + 13 + int(leg_offset_l)], fill=palette['marron'])
    for c in [10, 11]:
        draw.point([x + c, y + 13 + int(leg_offset_r)], fill=palette['marron'])
    
    # Pantalón
    for r in range(12, 14):
        for c in range(4, 12):
            draw.point([x + c, y + r], fill=palette['marron'])
    
    # Cinturón
    for c in range(4, 12):
        draw.point([x + c, y + 12], fill=(150, 100, 30, 255))
    
    # Cuerpo
    for r in range(7, 12):
        for c in range(4, 12):
            draw.point([x + c, y + r], fill=palette['verde_claro'])
    
    # Definición muscular
    draw.point([x + 5, y + 9], fill=palette['verde_oscuro'])
    draw.point([x + 10, y + 9], fill=palette['verde_oscuro'])
    
    # Cabeza
    for r in range(2, 8):
        for c in range(4, 12):
            if r in [2, 7] or c in [4, 11]:
                draw.point([x + c, y + r], fill=palette['verde_oscuro'])
            else:
                draw.point([x + c, y + r], fill=palette['verde_claro'])
    
    # Orejas (arriba)
    draw.point([x + 2, y + 2], fill=palette['amarillo'])
    draw.point([x + 3, y + 1], fill=palette['amarillo'])
    draw.point([x + 12, y + 2], fill=palette['amarillo'])
    draw.point([x + 11, y + 1], fill=palette['amarillo'])
    
    # Ojos
    draw.point([x + 6, y + 4], fill=palette['rojo_oscuro'])
    draw.point([x + 7, y + 4], fill=palette['rojo_oscuro'])
    draw.point([x + 9, y + 4], fill=palette['rojo_oscuro'])
    draw.point([x + 10, y + 4], fill=palette['rojo_oscuro'])
    
    draw.point([x + 6, y + 5], fill=palette['blanco'])
    draw.point([x + 9, y + 5], fill=palette['blanco'])
    
    # Nariz
    draw.point([x + 7, y + 5], fill=palette['verde_oscuro'])
    draw.point([x + 8, y + 5], fill=palette['verde_oscuro'])
    
    # Arma/boomerang con rotación según dirección
    if direction == 0:  # Abajo
        draw.point([x + 14, y + 8], fill=palette['naranja'])
        draw.point([x + 14, y + 9], fill=palette['naranja'])
    elif direction == 1:  # Arriba
        draw.point([x + 14, y + 8], fill=palette['naranja'])
        draw.point([x + 14, y + 9], fill=palette['naranja'])
    elif direction == 2:  # Izquierda
        draw.point([x + 1, y + 8], fill=palette['naranja'])
        draw.point([x + 2, y + 8], fill=palette['naranja'])
    else:  # Derecha
        draw.point([x + 13, y + 8], fill=palette['naranja'])
        draw.point([x + 14, y + 8], fill=palette['naranja'])

def draw_orc(x_base, y_base, direction, frame):
    """Dibuja un orco caminando en una dirección"""
    palette = {
        'rojo': (220, 50, 50, 255),
        'rojo_claro': (255, 100, 100, 255),
        'rojo_oscuro': (150, 0, 0, 255),
        'piel': (255, 160, 60, 255),
        'negro': (25, 25, 25, 255),
        'marron': (120, 60, 20, 255),
        'blanco': (255, 255, 255, 255),
        'diente': (240, 240, 240, 255)
    }
    
    x, y = x_base, y_base
    
    # Piernas/botas con animación
    leg_offset_l = (frame % 4) * 0.5
    leg_offset_r = ((frame + 2) % 4) * 0.5
    
    for c in [3, 4]:
        draw.point([x + c, y + 13 + int(leg_offset_l)], fill=palette['marron'])
    for c in [11, 12]:
        draw.point([x + c, y + 13 + int(leg_offset_r)], fill=palette['marron'])
    
    # Cuerpo
    for r in range(7, 13):
        for c in range(2, 14):
            draw.point([x + c, y + r], fill=palette['rojo'])
    
    # Músculos
    for r in range(8, 12):
        draw.point([x + 2, y + r], fill=palette['rojo_oscuro'])
        draw.point([x + 13, y + r], fill=palette['rojo_oscuro'])
        draw.point([x + 7, y + r], fill=palette['rojo_oscuro'])
        draw.point([x + 8, y + r], fill=palette['rojo_oscuro'])
    
    # Cinturón
    for c in range(2, 14):
        draw.point([x + c, y + 12], fill=palette['marron'])
    
    # Cabeza
    for r in range(1, 8):
        for c in range(3, 13):
            draw.point([x + c, y + r], fill=palette['rojo'])
    
    for c in [3, 12]:
        for r in range(2, 8):
            draw.point([x + c, y + r], fill=palette['rojo_oscuro'])
    
    # Ojos
    for r in range(3, 6):
        for c in range(5, 7):
            draw.point([x + c, y + r], fill=palette['negro'])
    for r in range(3, 6):
        for c in range(9, 11):
            draw.point([x + c, y + r], fill=palette['negro'])
    
    draw.point([x + 5, y + 3], fill=palette['blanco'])
    draw.point([x + 10, y + 3], fill=palette['blanco'])
    
    # Cejas
    draw.point([x + 4, y + 2], fill=palette['negro'])
    draw.point([x + 5, y + 2], fill=palette['negro'])
    draw.point([x + 10, y + 2], fill=palette['negro'])
    draw.point([x + 11, y + 2], fill=palette['negro'])
    
    # Nariz
    draw.point([x + 7, y + 5], fill=palette['piel'])
    draw.point([x + 8, y + 5], fill=palette['piel'])
    
    # Colmillos
    draw.point([x + 6, y + 6], fill=palette['diente'])
    draw.point([x + 9, y + 6], fill=palette['diente'])
    draw.point([x + 7, y + 6], fill=palette['negro'])
    draw.point([x + 8, y + 6], fill=palette['negro'])
    
    # Arma (garrote/club)
    if direction == 0:  # Abajo
        draw.point([x + 14, y + 8], fill=palette['marron'])
        draw.point([x + 14, y + 9], fill=palette['marron'])
        draw.point([x + 14, y + 10], fill=palette['marron'])
    elif direction == 1:  # Arriba
        draw.point([x + 14, y + 6], fill=palette['marron'])
        draw.point([x + 14, y + 7], fill=palette['marron'])
    elif direction == 2:  # Izquierda
        draw.point([x + 1, y + 8], fill=palette['marron'])
        draw.point([x + 2, y + 8], fill=palette['marron'])
        draw.point([x + 3, y + 8], fill=palette['marron'])
    else:  # Derecha
        draw.point([x + 12, y + 8], fill=palette['marron'])
        draw.point([x + 13, y + 8], fill=palette['marron'])
        draw.point([x + 14, y + 8], fill=palette['marron'])

def draw_archer(x_base, y_base, direction, frame):
    """Dibuja un arquero caminando en una dirección"""
    palette = {
        'piel': (255, 204, 153, 255),
        'pelo': (102, 51, 0, 255),
        'tunica': (0, 102, 51, 255),
        'tunica_claro': (51, 153, 102, 255),
        'arco': (101, 67, 33, 255),
        'cuerda': (220, 220, 220, 255),
        'negro': (30, 30, 30, 255),
        'oro': (255, 215, 0, 255),
        'piel_oscura': (204, 163, 122, 255)
    }
    
    x, y = x_base, y_base
    
    # Piernas con animación
    leg_offset_l = (frame % 4) * 0.5
    leg_offset_r = ((frame + 2) % 4) * 0.5
    
    # Botas
    for c in [5, 6]:
        draw.point([x + c, y + 14 + int(leg_offset_l)], fill=palette['piel_oscura'])
    for c in [9, 10]:
        draw.point([x + c, y + 14 + int(leg_offset_r)], fill=palette['piel_oscura'])
    
    # Pantalón
    for r in range(11, 14):
        for c in range(5, 11):
            draw.point([x + c, y + r], fill=palette['negro'])
    
    # Cinturón
    for c in range(5, 11):
        draw.point([x + c, y + 11], fill=palette['oro'])
    
    # Túnica
    for r in range(6, 11):
        for c in range(4, 12):
            draw.point([x + c, y + r], fill=palette['tunica'])
    
    for c in range(5, 11):
        draw.point([x + c, y + 7], fill=palette['tunica_claro'])
    
    # Cuello
    draw.point([x + 7, y + 6], fill=palette['piel'])
    draw.point([x + 8, y + 6], fill=palette['piel'])
    
    # Cabeza
    for r in range(2, 7):
        for c in range(5, 11):
            draw.point([x + c, y + r], fill=palette['piel'])
    
    # Pelo
    for r in range(0, 3):
        for c in range(5, 11):
            draw.point([x + c, y + r], fill=palette['pelo'])
    
    # Ojos
    draw.point([x + 6, y + 4], fill=palette['negro'])
    draw.point([x + 7, y + 4], fill=palette['negro'])
    draw.point([x + 9, y + 4], fill=palette['negro'])
    draw.point([x + 10, y + 4], fill=palette['negro'])
    
    # Arco con rotación
    if direction == 0:  # Abajo
        draw.point([x + 14, y + 7], fill=palette['arco'])
        draw.point([x + 14, y + 8], fill=palette['arco'])
        draw.point([x + 14, y + 9], fill=palette['cuerda'])
    elif direction == 1:  # Arriba
        draw.point([x + 14, y + 5], fill=palette['arco'])
        draw.point([x + 14, y + 6], fill=palette['arco'])
        draw.point([x + 14, y + 7], fill=palette['cuerda'])
    elif direction == 2:  # Izquierda
        draw.point([x + 1, y + 8], fill=palette['arco'])
        draw.point([x + 2, y + 8], fill=palette['arco'])
        draw.point([x + 2, y + 7], fill=palette['cuerda'])
    else:  # Derecha
        draw.point([x + 13, y + 8], fill=palette['arco'])
        draw.point([x + 14, y + 8], fill=palette['arco'])
        draw.point([x + 13, y + 7], fill=palette['cuerda'])

# Generar sprite sheet: 4 direcciones x 4 frames = 16 columnas por tipo
# Direcciones: 0=abajo, 1=arriba, 2=izquierda, 3=derecha
directions = [0, 1, 2, 3]

for direction in directions:
    for frame in range(4):
        x_col = direction * 4 + frame
        
        # Goblin (fila 0)
        draw_goblin(x_col * 16, 0, direction, frame)
        
        # Orco (fila 1)
        draw_orc(x_col * 16, 16, direction, frame)
        
        # Arquero (fila 2)
        draw_archer(x_col * 16, 32, direction, frame)

img.save('enemies_sprites.png')
print("✓ enemies_sprites.png generado (256x48)")
print("  - 4 direcciones × 4 frames = 16 columnas")
print("  - Fila 0: Goblin")
print("  - Fila 1: Orco")
print("  - Fila 2: Arquero")
