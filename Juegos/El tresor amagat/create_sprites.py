#!/usr/bin/env python3
"""
Generador de hoja de sprites para Link con 4 direcciones y animaciones dinámicas
"""

from PIL import Image, ImageDraw

FRAME_W = 16
FRAME_H = 16
COLS = 10
ROWS = 4

img = Image.new('RGBA', (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

SKIN = (255, 181, 107)
TUNIC = (47, 143, 47)
TUNIC_LT = (70, 180, 70)
BOOTS = (40, 40, 40)
GOLD = (255, 209, 102)
OUTLINE = (0, 0, 0)

def draw_head(d, x, y, direction):
    """Cabeza según dirección"""
    if direction == 0:  # DOWN
        d.polygon([(x+4, y+1), (x+12, y+1), (x+13, y+4), (x+3, y+4)], fill=TUNIC, outline=OUTLINE)
        d.rectangle([x+5, y+4, x+11, y+8], fill=SKIN, outline=OUTLINE)
        d.rectangle([x+6, y+5, x+7, y+6], fill=OUTLINE)
        d.rectangle([x+9, y+5, x+10, y+6], fill=OUTLINE)
    elif direction == 1:  # LEFT
        d.polygon([(x+3, y+1), (x+11, y+1), (x+12, y+3), (x+4, y+5)], fill=TUNIC, outline=OUTLINE)
        d.rectangle([x+4, y+4, x+10, y+8], fill=SKIN, outline=OUTLINE)
        d.rectangle([x+6, y+5, x+7, y+6], fill=OUTLINE)
    elif direction == 2:  # RIGHT
        d.polygon([(x+5, y+1), (x+13, y+1), (x+12, y+3), (x+4, y+5)], fill=TUNIC, outline=OUTLINE)
        d.rectangle([x+6, y+4, x+12, y+8], fill=SKIN, outline=OUTLINE)
        d.rectangle([x+10, y+5, x+11, y+6], fill=OUTLINE)
    else:  # UP
        d.polygon([(x+4, y+2), (x+12, y+2), (x+13, y+5), (x+3, y+5)], fill=TUNIC, outline=OUTLINE)
        d.rectangle([x+5, y+4, x+11, y+7], fill=SKIN, outline=OUTLINE)
        d.rectangle([x+6, y+4, x+7, y+5], fill=OUTLINE)
        d.rectangle([x+9, y+4, x+10, y+5], fill=OUTLINE)

def draw_body(d, x, y):
    """Cuerpo/túnica"""
    d.rectangle([x+4, y+8, x+12, y+13], fill=TUNIC, outline=OUTLINE)
    d.line([(x+4, y+11), (x+12, y+11)], fill=OUTLINE)

def draw_legs_walking(d, x, y, frame, direction):
    """Piernas con animación de caminar"""
    anim = frame % 6
    
    if direction == 0:  # DOWN
        if anim == 0:
            left_y, right_y = y + 12, y + 12
        elif anim == 1:
            left_y, right_y = y + 11, y + 13
        elif anim == 2:
            left_y, right_y = y + 11, y + 13
        elif anim == 3:
            left_y, right_y = y + 12, y + 12
        elif anim == 4:
            left_y, right_y = y + 13, y + 11
        else:
            left_y, right_y = y + 13, y + 11
        d.rectangle([x+5, left_y, x+7, y+15], fill=BOOTS, outline=OUTLINE)
        d.rectangle([x+9, right_y, x+11, y+15], fill=BOOTS, outline=OUTLINE)
    
    elif direction == 1:  # LEFT
        if anim == 0:
            left_y, right_y = y + 12, y + 12
        elif anim == 1:
            left_y, right_y = y + 11, y + 13
        elif anim == 2:
            left_y, right_y = y + 11, y + 13
        elif anim == 3:
            left_y, right_y = y + 12, y + 12
        elif anim == 4:
            left_y, right_y = y + 13, y + 11
        else:
            left_y, right_y = y + 13, y + 11
        d.rectangle([x+3, left_y, x+5, y+15], fill=BOOTS, outline=OUTLINE)
        d.rectangle([x+7, right_y, x+9, y+15], fill=BOOTS, outline=OUTLINE)
    
    elif direction == 2:  # RIGHT
        if anim == 0:
            left_y, right_y = y + 12, y + 12
        elif anim == 1:
            left_y, right_y = y + 11, y + 13
        elif anim == 2:
            left_y, right_y = y + 11, y + 13
        elif anim == 3:
            left_y, right_y = y + 12, y + 12
        elif anim == 4:
            left_y, right_y = y + 13, y + 11
        else:
            left_y, right_y = y + 13, y + 11
        d.rectangle([x+7, left_y, x+9, y+15], fill=BOOTS, outline=OUTLINE)
        d.rectangle([x+11, right_y, x+13, y+15], fill=BOOTS, outline=OUTLINE)
    
    else:  # UP
        if anim == 0:
            left_y, right_y = y + 12, y + 12
        elif anim == 1:
            left_y, right_y = y + 11, y + 13
        elif anim == 2:
            left_y, right_y = y + 11, y + 13
        elif anim == 3:
            left_y, right_y = y + 12, y + 12
        elif anim == 4:
            left_y, right_y = y + 13, y + 11
        else:
            left_y, right_y = y + 13, y + 11
        d.rectangle([x+5, left_y, x+7, y+15], fill=BOOTS, outline=OUTLINE)
        d.rectangle([x+9, right_y, x+11, y+15], fill=BOOTS, outline=OUTLINE)

def draw_arms_sword_shield(d, x, y, frame, direction):
    """Brazos con movimiento de escudo y espada"""
    anim = frame % 6
    
    if direction == 0:  # DOWN
        # Brazo izquierdo con escudo (se mueve oscilando)
        if anim <= 2:
            arm_left_y = y + 9 - anim
        else:
            arm_left_y = y + 9 - (5 - anim)
        d.rectangle([x+1, arm_left_y, x+3, arm_left_y + 3], fill=SKIN, outline=OUTLINE)
        # Escudo
        d.rectangle([x+0, arm_left_y + 1, x+3, arm_left_y + 4], fill=GOLD, outline=OUTLINE)
        
        # Brazo derecho con espada
        if anim <= 2:
            arm_right_y = y + 8 + anim
        else:
            arm_right_y = y + 8 + (5 - anim)
        d.rectangle([x+13, arm_right_y - 2, x+15, arm_right_y + 3], fill=SKIN, outline=OUTLINE)
        # Espada vertical
        d.rectangle([x+13, arm_right_y - 3, x+15, arm_right_y + 4], fill=GOLD, outline=OUTLINE)
    
    elif direction == 1:  # LEFT
        # Brazo izquierdo (adelante) con escudo
        if anim <= 2:
            arm_left_x = x + 0 + anim
        else:
            arm_left_x = x + 0 + (5 - anim)
        d.rectangle([arm_left_x, y + 9, arm_left_x + 3, y + 12], fill=SKIN, outline=OUTLINE)
        # Escudo
        d.rectangle([arm_left_x - 1, y + 9, arm_left_x + 2, y + 12], fill=GOLD, outline=OUTLINE)
        
        # Brazo derecho (atrás) con espada
        if anim <= 2:
            arm_right_x = x + 10 - anim
        else:
            arm_right_x = x + 10 - (5 - anim)
        d.rectangle([arm_right_x, y + 8, arm_right_x + 3, y + 13], fill=SKIN, outline=OUTLINE)
        # Espada horizontal
        d.rectangle([arm_right_x - 2, y + 10, arm_right_x + 3, y + 12], fill=GOLD, outline=OUTLINE)
    
    elif direction == 2:  # RIGHT
        # Brazo izquierdo (atrás) 
        if anim <= 2:
            arm_left_x = x + 10 - anim
        else:
            arm_left_x = x + 10 - (5 - anim)
        d.rectangle([arm_left_x, y + 8, arm_left_x + 3, y + 13], fill=SKIN, outline=OUTLINE)
        
        # Brazo derecho (adelante) con espada
        if anim <= 2:
            arm_right_x = x + 12 + anim
        else:
            arm_right_x = x + 12 + (5 - anim)
        d.rectangle([arm_right_x, y + 9, arm_right_x + 3, y + 12], fill=SKIN, outline=OUTLINE)
        # Escudo derecho
        d.rectangle([arm_right_x + 2, y + 9, arm_right_x + 5, y + 12], fill=GOLD, outline=OUTLINE)
        # Espada horizontal
        d.rectangle([arm_right_x, y + 10, arm_right_x + 5, y + 12], fill=GOLD, outline=OUTLINE)
    
    else:  # UP
        # Brazos levantados
        if anim <= 2:
            arm_y = y + 6 - anim
        else:
            arm_y = y + 6 - (5 - anim)
        d.rectangle([x+1, arm_y, x+3, arm_y + 3], fill=SKIN, outline=OUTLINE)
        d.rectangle([x+13, arm_y, x+15, arm_y + 3], fill=SKIN, outline=OUTLINE)
        # Espada arriba
        d.rectangle([x+6, arm_y - 3, x+10, arm_y + 2], fill=GOLD, outline=OUTLINE)

def draw_frame(d, col, row):
    """Dibuja un frame completo"""
    x = col * FRAME_W
    y = row * FRAME_H
    
    d.rectangle([x, y, x+FRAME_W, y+FRAME_H], fill=(0, 0, 0, 0))
    
    direction = row
    draw_head(d, x, y, direction)
    draw_body(d, x, y)
    draw_legs_walking(d, x, y, col, direction)
    draw_arms_sword_shield(d, x, y, col, direction)
    
    # Sombra
    d.line([(x+5, y+15), (x+11, y+15)], fill=(0, 0, 0, 100))

for row in range(ROWS):
    for col in range(COLS):
        draw_frame(draw, col, row)

img.save('link_sprites.png')
print("✓ Sprites con animaciones dinámicas generados")
print(f"  Brazos, escudo y espada se mueven al caminar")
