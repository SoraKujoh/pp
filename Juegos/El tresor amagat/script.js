// El Tesoro Amagat - VERSIÓN MEJORADA CON OBSTÁCULOS Y EFECTOS VISUALES
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Configuración del juego
const COLS = 20;
const ROWS = 15;
const TILE = 16;

// ========== ESTADO DEL JUGADOR ==========
let player = {
  x: 9, y: 7,         // posición en grid
  screenX: 9 * 16,    // posición visual para interpolación
  screenY: 7 * 16,
  dirIndex: 0,        // 0=down, 1=left, 2=right, 3=up
  frame: 0,
  moving: false,
  frameTimer: 0,
  moveTimer: 0,
  moveProgress: 0,    // 0.0 a 1.0 para interpolación
  // Vida del jugador en "medio-corazones" (1 corazón = 2 unidades)
  maxHp: 6,
  hp: 6
};

// Configuración de ataque del jugador
player.attackCooldown = 0.5; // segundos entre ataques
player.attackTimer = 0;
player.attacking = false;
player.attackingDuration = 0.15; // tiempo de la animación
player.attackingTimer = 0;

// ========== ENEMIGOS ==========
let enemies = [];

const ENEMY_TYPES = {
  goblin: {color: '#2ecc40', size: 12}, // verde, pequeño
  orc:    {color: '#c0392b', size: 18}, // rojo, grande
  archer: {color: '#2980b9', size: 14}  // azul, humano
};

let gameState = {
  gameOver: false,
  treasureFound: false,
  level: 1,
  score: 0
};

// ========== PALETA DE COLORES MEJORADA ==========
const palette = {
  grass0: '#65c76b',
  grass1: '#54b25a',
  grass2: '#4a9a4a',
  path: '#d9c199',
  pathDark: '#c9b089',
  pathLight: '#e8d8aa',
  treeT: '#6b4423',
  treeT2: '#4a2a0a',
  treeL: '#2f9b3b',
  treeL2: '#6cd27a',
  treeL3: '#1a6b1a',
  stone: '#7a7a7a',
  stoneLt: '#9a9a9a',
  stoneDk: '#5a5a5a',
  water: '#1b5f8f',
  waterLt: '#2b8fbf',
  waterDk: '#0a3a5a',
  skin: '#ffb56b',
  hair: '#9b4b15',
  tunic: '#2f8f2f',
  shield: '#b0521f',
  chestGold: '#ffd166',
  chestBrown: '#b96f00',
  chestDark: '#663c00',
  chestGoldDk: '#ccaa00',
  shadow: 'rgba(0,0,0,0.25)',
  shadowLight: 'rgba(0,0,0,0.12)',
  mountain: '#7a6f5f',
  mountainLt: '#9a8f7f'
};

// ========== TERRENO Y OBSTÁCULOS ==========
const map = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));

const pathTiles = [
  [2,12],[3,12],[4,12],[5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],
  [12,11],[12,10],[11,10],[10,10],[9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],
  [3,9],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,6],[7,6],[6,6]
];
pathTiles.forEach(([x,y]) => {
  if(y >= 0 && y < ROWS && x >= 0 && x < COLS) map[y][x] = 1;
});

// Obstáculos dinámicos (se generan según nivel)
let obstacles = [];
let trees = [];
let waterTiles = [
  [14,14],[15,14],[16,14],[17,14],[18,14],[19,14]
];

// Tesoro
let treasure = {x: 15, y: 3};

// Función para generar obstáculos según nivel
function generateLevel(level) {
  obstacles = [];
  trees = [];
  // Generar enemigos según nivel
  enemies = [];
  // Goblins: 1 + nivel/3
  for(let i=0;i<1+Math.floor(level/3);i++) {
    enemies.push({
      type:'goblin',
      x:Math.floor(Math.random()*COLS),
      y:Math.floor(Math.random()*ROWS),
      dir:Math.floor(Math.random()*4),
      frame:0,
      frameTimer:0,
      moveTimer:0,
      moveDirection:Math.floor(Math.random()*4),
      moving:false,
      moveProgress:0
      ,aggressive:false,
      aggroRange:4,
      attackTimer:0,
      attackCooldown:1.5,
      hp:2,
      maxHp:2
    });
  }
  // Orcos: 1 + nivel/5
  for(let i=0;i<1+Math.floor(level/5);i++) {
    enemies.push({
      type:'orc',
      x:Math.floor(Math.random()*COLS),
      y:Math.floor(Math.random()*ROWS),
      dir:Math.floor(Math.random()*4),
      frame:0,
      frameTimer:0,
      moveTimer:0,
      moveDirection:Math.floor(Math.random()*4),
      moving:false,
      moveProgress:0
      ,aggressive:false,
      aggroRange:6,
      attackTimer:0,
      attackCooldown:1.5,
      hp:3,
      maxHp:3
    });
  }
  // Arqueros: 1 + nivel/7
  for(let i=0;i<1+Math.floor(level/7);i++) {
    enemies.push({
      type:'archer',
      x:Math.floor(Math.random()*COLS),
      y:Math.floor(Math.random()*ROWS),
      dir:Math.floor(Math.random()*4),
      frame:0,
      frameTimer:0,
      moveTimer:0,
      moveDirection:Math.floor(Math.random()*4),
      moving:false,
      moveProgress:0
      ,aggressive:false,
      aggroRange:7,
      attackTimer:0,
      attackCooldown:2.0,
      hp:1,
      maxHp:1
    });
  }
  // Definiciones de niveles
  // 30 niveles grandes y variados
  const levelDesigns = Array.from({length: 30}, (_, i) => {
    // Generación variada: cada nivel tiene obstáculos y árboles en patrones distintos
    let obstacles = [];
    let trees = [];
    // Obstáculos principales: muros, rocas, agua, trampas, setos, arena
    for(let j=0;j<10+i;j++) {
      // Alterna tipos y tamaños
      let w = 1 + Math.floor(Math.random()*2);
      let h = 1 + Math.floor(Math.random()*2);
      let x = Math.floor(Math.random()*(COLS-w));
      let y = Math.floor(Math.random()*(ROWS-h));
      obstacles.push({x, y, w, h});
    }
    // Árboles en patrones
    for(let t=0;t<8+Math.floor(i/2);t++) {
      let x = Math.floor(Math.random()*COLS);
      let y = Math.floor(Math.random()*ROWS);
      trees.push({x, y});
    }
    // Añade zonas especiales en niveles altos
    if(i>10) {
      // Franja de agua
      obstacles.push({x: 0, y: Math.floor(ROWS/2), w: COLS, h: 1});
    }
    if(i>20) {
      // Muro vertical
      obstacles.push({x: Math.floor(COLS/2), y: 0, w: 1, h: ROWS});
    }
    return {obstacles, trees};
  });
  // Si el nivel es <= 30, usar diseño predefinido
  if(level <= levelDesigns.length) {
    obstacles = JSON.parse(JSON.stringify(levelDesigns[level-1].obstacles));
    trees = JSON.parse(JSON.stringify(levelDesigns[level-1].trees));
  } else {
    // Niveles 31+: generación procedural
    obstacles = [];
    trees = [];
    // Obstáculos aleatorios
    for(let i=0; i<8+Math.floor(level/2); i++) {
      obstacles.push({
        x: Math.floor(Math.random()*COLS),
        y: Math.floor(Math.random()*ROWS),
        w: 1+Math.floor(Math.random()*2),
        h: 1+Math.floor(Math.random()*2)
      });
    }
    // Árboles aleatorios
    for(let i=0; i<8+Math.floor(level/3); i++) {
      trees.push({
        x: Math.floor(Math.random()*COLS),
        y: Math.floor(Math.random()*ROWS)
      });
    }
  }
  bgReady = false; // Regenerar el fondo
}

// Función para colocar tesoro aleatoriamente
function placeTreasure() {
  let tries = 0;
  let found = false;
  
  while(!found && tries < 100) {
    treasure.x = Math.floor(Math.random() * COLS);
    treasure.y = Math.floor(Math.random() * ROWS);
    
    // Verificar que no esté en obstáculos, árboles ni posición del jugador
    let isValid = true;
    if(treasure.x === player.x && treasure.y === player.y) isValid = false;
    if(isObstacle(treasure.x, treasure.y)) isValid = false;
    if(waterTiles.some(([wx,wy]) => wx === treasure.x && wy === treasure.y)) isValid = false;
    // Evitar generar tesoro muy cerca del jugador (distancia mínima de 3 tiles)
    const dist = Math.abs(treasure.x - player.x) + Math.abs(treasure.y - player.y);
    if(dist < 3) isValid = false;
   
    if(isValid) found = true;
    tries++;
  }
}

// ========== SPRITES COMO MATRICES ==========
const playerSprite = [
  [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,2,2,3,3,3,3,2,2,0,0,0,0],
  [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
  [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
  [0,2,2,1,1,1,4,1,1,1,4,1,1,2,2,0],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
  [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
  [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
  [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
  [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
  [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
  [0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const chestSprite = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0],
  [0,0,0,0,6,6,6,7,7,7,7,6,6,6,0,0],
  [0,0,0,6,7,7,7,7,7,7,7,7,7,6,6,0],
  [0,0,6,7,7,7,7,7,7,7,7,7,7,7,6,0],
  [0,6,7,7,7,7,7,7,7,7,7,7,7,7,7,6],
  [0,6,7,7,7,7,7,7,7,7,7,7,7,7,7,6],
  [0,6,7,7,7,7,7,7,7,7,7,7,7,7,7,6],
  [0,6,7,7,7,7,7,7,7,7,7,7,7,7,7,6],
  [0,0,6,7,7,7,7,7,7,7,7,7,7,7,6,0],
  [0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0],
  [0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const spritePalette = {
  1: palette.skin,
  2: palette.tunic,
  3: palette.hair,
  4: '#0b0b0b',
  5: palette.shield,
  6: palette.chestDark,
  7: palette.chestGold
};

// ========== CARGA DE HOJA DE SPRITES EXTERNA ==========
const spriteImg = new Image();
let spriteReady = false;
const SPRITE_FRAME_W = 16;
const SPRITE_FRAME_H = 16;
let SPRITE_COLS = 10;
let SPRITE_ROWS = 4;
const SHEET_DIRS = ['down','left','right','up'];

spriteImg.onload = () => {
  spriteReady = true;
  SPRITE_COLS = Math.max(1, Math.floor(spriteImg.width / SPRITE_FRAME_W));
  SPRITE_ROWS = Math.max(1, Math.floor(spriteImg.height / SPRITE_FRAME_H));
};
spriteImg.src = 'link_sprites.png';

// ========== CARGA DE SPRITES DE ENEMIGOS ==========
const enemySpritesImg = new Image();
let enemySpritesReady = false;
const ENEMY_SPRITE_W = 16;
const ENEMY_SPRITE_H = 16;

enemySpritesImg.onload = () => {
  enemySpritesReady = true;
};
enemySpritesImg.src = 'enemies_sprites.png';

// Mapeo de enemigos a filas: goblin=0, orc=1, archer=2
const ENEMY_SPRITE_ROWS = {
  goblin: 0,
  orc: 1,
  archer: 2
};

// ========== CANVAS OFFSCREEN PARA OPTIMIZACIÓN ==========
const bgCanvas = document.createElement('canvas');
bgCanvas.width = canvas.width;
bgCanvas.height = canvas.height;
const bgCtx = bgCanvas.getContext('2d');
let bgReady = false;

// ========== PARTÍCULAS ==========
let particles = [];
// Flechas/proyectiles lanzadas por arqueros
let projectiles = [];

function spawnArrow(sx, sy, vx, vy, sourceType) {
  projectiles.push({
    x: sx,
    y: sy,
    vx: vx,
    vy: vy,
    radius: 3,
    source: sourceType
  });
}

function createParticles(x, y, count) {
  for(let i = 0; i < count; i++) {
    particles.push({
      x: x * TILE + TILE/2,
      y: y * TILE + TILE/2,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 2,
      life: 1.0,
      size: Math.random() * 2 + 2,
      color: ['#ffd166', '#ffaa00', '#ff8800', '#ffff00'][Math.floor(Math.random() * 4)]
    });
  }
}

function updateParticles(dt) {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= dt * 0.5;
    return p.life > 0;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.beginPath();
    ctx.arc(Math.floor(p.x), Math.floor(p.y), p.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ========== FUNCIONES DE COLISIÓN ==========
function isObstacle(x, y) {
  if(x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  
  for(let obs of obstacles) {
    if(x >= obs.x && x < obs.x + obs.w && 
       y >= obs.y && y < obs.y + obs.h) {
      return true;
    }
  }
  
  for(let tree of trees) {
    if(x === tree.x && y === tree.y) return true;
  }
  
  return false;
}

function checkTreasure() {
  if(player.x === treasure.x && player.y === treasure.y && !gameState.treasureFound) {
    gameState.treasureFound = true;
    gameState.level += 1;
    gameState.score += 100 * gameState.level;
    createParticles(treasure.x, treasure.y, 20);
    
    // Mostrar overlay y pasar de nivel automáticamente
    const overlay = document.getElementById('overlay');
    if(overlay) {
      overlay.classList.remove('hidden');
      // Auto-continuar después de 2 segundos
      setTimeout(() => {
        nextLevel();
      }, 2000);
    }
  }
}

// ========== DIBUJO DE TERRENO DETALLADO ==========
function drawTerrain() {
  for(let y = 0; y < ROWS; y++) {
    for(let x = 0; x < COLS; x++) {
      const gx = x * TILE, gy = y * TILE;
      
      // Agua con animación
      if(waterTiles.some(([wx,wy]) => wx === x && wy === y)) {
        bgCtx.fillStyle = palette.water;
        bgCtx.fillRect(gx, gy, TILE, TILE);
        bgCtx.fillStyle = palette.waterLt;
        bgCtx.fillRect(gx + 2, gy + 2, 3, 3);
        bgCtx.fillRect(gx + 8, gy + 8, 3, 3);
        bgCtx.fillStyle = palette.waterDk;
        bgCtx.fillRect(gx + 6, gy + 6, 2, 2);
        continue;
      }
      
      // Pasto con variación detallada
      const noise = (x * 73 ^ y * 97) % 4;
      let col;
      if(noise === 0) col = palette.grass0;
      else if(noise === 1) col = palette.grass1;
      else col = palette.grass2;
      
      bgCtx.fillStyle = col;
      bgCtx.fillRect(gx, gy, TILE, TILE);
      
      // Detalles de pasto - pequeños arbustos
      if(noise === 2) {
        bgCtx.fillStyle = palette.grass2;
        bgCtx.fillRect(gx + 1, gy + 1, 2, 2);
        bgCtx.fillRect(gx + 13, gy + 13, 2, 2);
      }
      
      // Camino
      if(map[y][x] === 1) {
        bgCtx.fillStyle = palette.path;
        bgCtx.fillRect(gx + 2, gy + 4, TILE - 4, TILE - 8);
        bgCtx.fillStyle = palette.pathDark;
        bgCtx.fillRect(gx + 2, gy + 7, TILE - 4, 2);
        bgCtx.fillStyle = palette.pathLight;
        bgCtx.fillRect(gx + 2, gy + 4, TILE - 4, 1);
      }
    }
  }
}

function drawTrees() {
  trees.forEach(tree => {
    const gx = tree.x * TILE, gy = tree.y * TILE;
    
    // Sombra del árbol
    bgCtx.fillStyle = palette.shadow;
    bgCtx.fillRect(gx + 2, gy + 12, 12, 4);
    
    // Tronco con detalle
    bgCtx.fillStyle = palette.treeT;
    bgCtx.fillRect(gx + 6, gy + 8, 4, 8);
    bgCtx.fillStyle = palette.treeT2;
    bgCtx.fillRect(gx + 7, gy + 8, 1, 8);
    
    // Copa (3 capas) para efecto 3D
    bgCtx.fillStyle = palette.treeL3;
    bgCtx.fillRect(gx + 1, gy - 1, 14, 9);
    bgCtx.fillStyle = palette.treeL;
    bgCtx.fillRect(gx + 1, gy + 1, 14, 7);
    bgCtx.fillStyle = palette.treeL2;
    bgCtx.fillRect(gx + 3, gy + 3, 10, 5);
    // Highlight en copa
    bgCtx.fillStyle = '#8cd77a';
    bgCtx.fillRect(gx + 4, gy + 4, 2, 2);
  });
}

function drawObstacles() {
  obstacles.forEach(obs => {
    for(let oy = 0; oy < obs.h; oy++) {
      for(let ox = 0; ox < obs.w; ox++) {
        const gx = (obs.x + ox) * TILE;
        const gy = (obs.y + oy) * TILE;
        
        // Roca con gradiente visual
        bgCtx.fillStyle = palette.stone;
        bgCtx.fillRect(gx, gy, TILE, TILE);
        
        // Highlight en esquina superior izquierda
        bgCtx.fillStyle = palette.stoneLt;
        bgCtx.fillRect(gx + 2, gy + 2, 6, 3);
        bgCtx.fillRect(gx + 2, gy + 5, 3, 4);
        
        // Sombra en borde inferior y derecho
        bgCtx.fillStyle = palette.stoneDk;
        bgCtx.fillRect(gx + 10, gy + 2, 4, 12);
        bgCtx.fillRect(gx + 2, gy + 12, 12, 4);
        
        // Línea divisoria para efecto 3D
        bgCtx.fillStyle = palette.shadow;
        bgCtx.fillRect(gx, gy + TILE - 2, TILE, 2);
      }
    }
  });
}

function prepareBg() {
  bgCtx.fillStyle = palette.grass0;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  drawTerrain();
  drawTrees();
  drawObstacles();
  bgReady = true;
}

// ========== DIBUJO DE SPRITES ==========
function drawPixelSprite(sprite, tileX, tileY) {
  const size = sprite.length;
  const px = TILE / size;
  const startX = tileX * TILE;
  const startY = tileY * TILE;
  
  for(let r = 0; r < size; r++) {
    for(let c = 0; c < size; c++) {
      const v = sprite[r][c];
      if(v === 0) continue;
      ctx.fillStyle = spritePalette[v] || '#ffffff';
      ctx.fillRect(startX + c*px, startY + r*px, px, px);
    }
  }
}

function drawChest(x, y, bobOffset) {
  const px = x * TILE;
  const py = y * TILE + bobOffset;
  
  // Sombra
  ctx.fillStyle = palette.shadowLight;
  ctx.fillRect(px + 3, py + TILE - 3, TILE - 6, 3);
  
  // Cuerpo del cofre (rectangular)
  const chestW = 10, chestH = 8;
  const ox = (TILE - chestW) / 2, oy = TILE - chestH - 2;
  
  // Base del cofre (marrón oscuro)
  ctx.fillStyle = palette.chestDark;
  ctx.fillRect(px + ox, py + oy, chestW, chestH);
  
  // Tapa (oro)
  ctx.fillStyle = palette.chestGold;
  ctx.fillRect(px + ox + 0.5, py + oy - 2, chestW, 2);
  
  // Línea de sombra en la tapa
  ctx.fillStyle = palette.chestBrown;
  ctx.fillRect(px + ox, py + oy - 1, chestW, 1);
  
  // Broche/cerradura en el medio (dorado brillante)
  ctx.fillStyle = palette.chestGoldDk;
  ctx.fillRect(px + ox + 4, py + oy + 3, 2, 2);
  ctx.fillStyle = palette.chestGold;
  ctx.fillRect(px + ox + 4.5, py + oy + 3, 1, 2);
  
  // Patas del cofre
  ctx.fillStyle = palette.chestDark;
  ctx.fillRect(px + ox + 1, py + oy + chestH - 1, 1, 2);
  ctx.fillRect(px + ox + chestW - 2, py + oy + chestH - 1, 1, 2);
  
  // Detalles: líneas en la tapa
  ctx.strokeStyle = palette.chestGoldDk;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(px + ox + 2, py + oy - 1);
  ctx.lineTo(px + ox + 2, py + oy + 1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px + ox + chestW - 2, py + oy - 1);
  ctx.lineTo(px + ox + chestW - 2, py + oy + 1);
  ctx.stroke();
}

// ========== MOVIMIENTO ==========
function move(dx, dy) {
  const overlay = document.getElementById('overlay');
  if(gameState.treasureFound || player.moving || player.attacking || (overlay && !overlay.classList.contains('hidden'))) return;
  
  const newX = player.x + dx;
  const newY = player.y + dy;
  
  // Si hay un obstáculo físico, no moverse
  if(isObstacle(newX, newY)) return;

  // Si hay un enemigo en la casilla, atacar en lugar de moverte
  const enemyIndex = enemies.findIndex(en => en.x === newX && en.y === newY);
  if(enemyIndex !== -1) {
    const en = enemies[enemyIndex];
    // Daño del jugador (1 por ataque)
    const damage = 1;
    en.hp -= damage;
    en.aggressive = true;
    // Partículas de impacto
    createParticles(en.x, en.y, 8);
    // Si el enemigo muere, quitarlo y dar puntos
    if(en.hp <= 0) {
      // Pequeña bonificación por matar
      gameState.score += (en.type === 'orc' ? 50 : 30);
      createParticles(en.x, en.y, 18);
      enemies.splice(enemyIndex, 1);
    }
    return; // No mover al jugador dentro del enemigo
  }
  
  // Actualizar dirección
  if(dx === 1) player.dirIndex = 2;
  else if(dx === -1) player.dirIndex = 1;
  else if(dy === -1) player.dirIndex = 3;
  else if(dy === 1) player.dirIndex = 0;
  
  // Iniciar movimiento suave
  player.x = newX;
  player.y = newY;
  player.moving = true;
  player.moveProgress = 0;
  player.frameTimer = 0;
  
  checkTreasure();
}

// ========== INPUT ==========
window.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('overlay');
  
  if(overlay && !overlay.classList.contains('hidden')) {
    if(e.key === 'Enter' || e.key === ' ') {
      restartGame();
      e.preventDefault();
    }
    return;
  }
  
  let handled = true;
  switch(e.key) {
    case 'ArrowUp': move(0, -1); break;
    case 'ArrowDown': move(0, 1); break;
    case 'ArrowLeft': move(-1, 0); break;
    case 'ArrowRight': move(1, 0); break;
    case 'z':
    case 'Z':
      playerAttack();
      break;
    default: handled = false;
  }
  if(handled) e.preventDefault();
});

// ========== REINICIO Y SIGUIENTE NIVEL ==========
function nextLevel() {
  gameState.treasureFound = false;
  generateLevel(gameState.level);
  // Reposicionar jugador en el centro (o posición inicial segura)
  player.x = 9;
  player.y = 7;
  player.screenX = 9 * TILE;
  player.screenY = 7 * TILE;
  player.dirIndex = 0;
  player.frame = 0;
  player.moving = false;
  player.moveProgress = 1.0;
  placeTreasure();
  const overlay = document.getElementById('overlay');
  if(overlay) overlay.classList.add('hidden');
}

function restartGame() {
  gameState.treasureFound = false;
  gameState.gameOver = false;
  gameState.level = 1;
  gameState.score = 0;
  player.x = 9;
  player.y = 7;
  player.screenX = 9 * TILE;
  player.screenY = 7 * TILE;
  player.dirIndex = 0;
  player.frame = 0;
  player.moving = false;
  player.moveProgress = 0;
  player.maxHp = 6;
  player.hp = 6;
  particles = [];
  generateLevel(1);
  placeTreasure();
  document.getElementById('overlay').classList.add('hidden');
}

const restartBtn = document.getElementById('restart');
if(restartBtn) restartBtn.addEventListener('click', restartGame);

// ======= ATAQUE Y FIN DE JUEGO =======
function attackPlayer(enemy) {
  if(gameState.gameOver) return;
  // Daño según tipo (1 = medio corazón, 2 = un corazón)
  const dmg = (enemy.type === 'orc') ? 2 : 1;
  damagePlayer(dmg);
}

function damagePlayer(dmg) {
  if(gameState.gameOver) return;
  player.hp = Math.max(0, player.hp - dmg);
  createParticles(player.x, player.y, 12);
  // Pequeño temporizador para feedback visual
  player.hitTimer = 0.25;
  // Si el jugador queda a 0 HP -> Game Over
  if(player.hp <= 0) {
    gameState.gameOver = true;
    const overlay = document.getElementById('overlay');
    if(overlay) {
      overlay.classList.remove('hidden');
      overlay.innerHTML = '<div class="message"><h2 id="overlayTitle">Has muerto</h2><p id="overlayText">Pulsa Reiniciar para volver a empezar.</p><button id="restart">Empezar de nuevo</button></div>';
      const restartBtn2 = document.getElementById('restart');
      if(restartBtn2) restartBtn2.addEventListener('click', restartGame);
    }
    createParticles(player.x, player.y, 30);
  }
}

// Ataque del jugador con espada (tecla Z)
function playerAttack() {
  if(gameState.gameOver) return;
  if(player.attackTimer > 0) return; // en cooldown
  // No atacar mientras overlay activo
  const overlay = document.getElementById('overlay');
  if(overlay && !overlay.classList.contains('hidden')) return;

  // Iniciar animación de ataque
  player.attackTimer = player.attackCooldown;
  player.attacking = true;
  player.attackingTimer = player.attackingDuration;

  // Calcular casilla objetivo según dirección
  const dirs = [[0,1],[-1,0],[1,0],[0,-1]]; // 0=down,1=left,2=right,3=up
  const d = dirs[player.dirIndex] || [0,1];
  const tx = player.x + d[0];
  const ty = player.y + d[1];

  // Buscar enemigo en esa casilla
  const idx = enemies.findIndex(en => en.x === tx && en.y === ty);
  if(idx !== -1) {
    const en = enemies[idx];
    const swordDamage = 2; // 2 unidades = 1 corazón
    en.hp -= swordDamage;
    en.aggressive = true;
    createParticles(en.x, en.y, 12);
    if(en.hp <= 0) {
      gameState.score += (en.type === 'orc' ? 50 : 30);
      createParticles(en.x, en.y, 20);
      enemies.splice(idx, 1);
    }
  } else {
    // Golpe al aire: generar partículas en la casilla objetivo
    createParticles(tx, ty, 6);
  }
}

// ========== LOOP PRINCIPAL ==========
let lastTime = Date.now();

function loop(ts) {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  
  const MOVE_DURATION = 0.25; // 250ms para cada paso
  
  // Actualizar progreso del movimiento
  if(player.moving) {
    player.moveProgress += dt / MOVE_DURATION;
    if(player.moveProgress >= 1.0) {
      player.moveProgress = 1.0;
      player.moving = false;
    }
  } else {
    player.moveProgress = 1.0;
  }
  
  // Actualizar enemigos (detección de aggro y persecución)
  enemies.forEach(e => {
    // Incrementar timer de ataque continuamente
    e.attackTimer = (e.attackTimer || 0) + dt;
    // Detección de proximidad (Manhattan)
    const dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
    if(dist <= (e.aggroRange || 4)) {
      e.aggressive = true;
    } else if(dist > (e.aggroRange || 4) + 3) {
      e.aggressive = false;
    }

    // Animación de frames
    const FRAME_INTERVAL = 0.08;
    if(e.moving) {
      e.frameTimer += dt;
      if(e.frameTimer >= FRAME_INTERVAL) {
        e.frameTimer -= FRAME_INTERVAL;
        e.frame = (e.frame + 1) % 4; // Ciclo de 4 frames
      }
    } else {
      e.frame = 1; // Frame neutral cuando no se mueve
    }

    // Movimiento y comportamiento
    if(e.moving) {
      e.moveProgress += dt / MOVE_DURATION;
      if(e.moveProgress >= 1.0) {
        e.moveProgress = 1.0;
        e.moving = false;
      }
    } else {
      e.moveProgress = 1.0;
      e.moveTimer += dt;
      // Enemigos agresivos intentan moverse más frecuentemente
      let moveChance = e.aggressive ? 0.25 : 2.0;
      if(e.moveTimer > moveChance) {
        e.moveTimer = 0;
        if(e.aggressive) {
          // Persecución simple: paso greedy hacia el jugador
          const dx = Math.sign(player.x - e.x);
          const dy = Math.sign(player.y - e.y);
          let tryDirs = [];
          if(Math.abs(player.x - e.x) > Math.abs(player.y - e.y)) {
            tryDirs = [[dx,0],[0,dy],[ -dx,0],[0,-dy]];
          } else {
            tryDirs = [[0,dy],[dx,0],[0,-dy],[-dx,0]];
          }

          for(const [mdx, mdy] of tryDirs) {
            if(mdx === 0 && mdy === 0) continue;
            const newX = e.x + mdx;
            const newY = e.y + mdy;

            // Si puede moverse al jugador, intentamos atacar (con cooldown)
            if(newX === player.x && newY === player.y) {
              if((e.attackTimer || 0) >= (e.attackCooldown || 1.5)) {
                attackPlayer(e);
                e.attackTimer = 0;
              }
              break;
            }

            // Si es arquero y está en rango/agresivo, evitamos moverse y en su lugar puede disparar
            if(e.type === 'archer' && e.aggressive) {
              // Intentar disparar una flecha cuando su cooldown expire
              if((e.attackTimer || 0) >= (e.attackCooldown || 2.0)) {
                // disparar hacia el jugador (vector desde archer a jugador)
                const startPx = e.x * TILE + TILE/2;
                const startPy = e.y * TILE + TILE/2;
                const targetPx = player.x * TILE + TILE/2;
                const targetPy = player.y * TILE + TILE/2;
                const dxp = targetPx - startPx;
                const dyp = targetPy - startPy;
                const len = Math.hypot(dxp, dyp) || 1;
                const speed = 6 * TILE; // px/s
                const vx = (dxp / len) * speed;
                const vy = (dyp / len) * speed;
                spawnArrow(startPx, startPy, vx, vy, 'archer');
                e.attackTimer = 0;
              }
              break;
            }

            if(!isObstacle(newX, newY)) {
              e.x = newX;
              e.y = newY;
              e.dir = mdx === 1 ? 2 : mdx === -1 ? 1 : mdy === 1 ? 0 : 3;
              e.moving = true;
              e.moveProgress = 0;
              e.frameTimer = 0;
              break;
            }
          }
        } else {
          // Comportamiento aleatorio no agresivo
          if(Math.random() < 0.3) {
            const dirs = [[0,1],[-1,0],[1,0],[0,-1]];
            const newDir = Math.floor(Math.random()*4);
            const [dx, dy] = dirs[newDir];
            const newX = e.x + dx;
            const newY = e.y + dy;

            if(!isObstacle(newX, newY) && !(newX === player.x && newY === player.y)) {
              e.x = newX;
              e.y = newY;
              e.dir = newDir;
              e.moving = true;
              e.moveProgress = 0;
              e.frameTimer = 0;
            }
          }
        }
      }
    }
  });
  
  // Fondo
  ctx.fillStyle = palette.grass0;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if(!bgReady) prepareBg();
  ctx.drawImage(bgCanvas, 0, 0);
  
  // Animación mejorada
  const FRAME_INTERVAL = 0.08;
  if(player.moving) {
    player.frameTimer += dt;
    if(player.frameTimer >= FRAME_INTERVAL) {
      player.frameTimer -= FRAME_INTERVAL;
      const maxFrames = spriteReady ? SPRITE_COLS : 3;
      player.frame = (player.frame + 1) % maxFrames;
    }
  } else {
    player.frame = spriteReady ? Math.floor(SPRITE_COLS / 2) : 1;
  }

  // Actualizar timers de ataque del jugador
  if(player.attackTimer > 0) player.attackTimer = Math.max(0, player.attackTimer - dt);
  if(player.attacking) {
    player.attackingTimer -= dt;
    if(player.attackingTimer <= 0) player.attacking = false;
  }
  
  // Tesoro
  const bob = Math.sin(ts / 500) * 2;
  drawChest(treasure.x, treasure.y, bob);

  // Dibujar enemigos
  enemies.forEach(e => {
    ctx.save();
    
    // Calcular posición visual interpolada
    let renderX = e.x;
    let renderY = e.y;
    if(e.moveProgress < 1.0) {
      // Estamos en medio de un movimiento, interpolar
      // Direcciones: 0=down, 1=left, 2=right, 3=up
      const dirs = [[0,1],[-1,0],[1,0],[0,-1]];
      const [dx, dy] = dirs[e.dir];
      const prevX = e.x - dx;
      const prevY = e.y - dy;
      renderX = prevX + (e.x - prevX) * e.moveProgress;
      renderY = prevY + (e.y - prevY) * e.moveProgress;
    }
    
    const px = Math.round(renderX * TILE);
    const py = Math.round(renderY * TILE);
    
    if(enemySpritesReady) {
      // Usar sprites de enemigos con 4 direcciones
      // Sprite layout: 4 direcciones × 4 frames = 16 columnas
      const spriteRow = ENEMY_SPRITE_ROWS[e.type];
      const directionOffset = e.dir * 4; // Cada dirección es 4 frames
      const sx = (directionOffset + e.frame) * ENEMY_SPRITE_W;
      const sy = spriteRow * ENEMY_SPRITE_H;
      ctx.drawImage(enemySpritesImg, sx, sy, ENEMY_SPRITE_W, ENEMY_SPRITE_H, 
                    px, py, TILE, TILE);
    } else {
      // Fallback: círculo simple
      const info = ENEMY_TYPES[e.type];
      ctx.beginPath();
      ctx.arc(px+TILE/2, py+TILE/2, info.size/2, 0, Math.PI*2);
      ctx.fillStyle = info.color;
      ctx.globalAlpha = 0.95;
      ctx.fill();
      // Si está agresivo, dibujar un halo/contorno rojo
      if(e.aggressive) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,60,60,0.95)';
        ctx.beginPath();
        ctx.arc(px+TILE/2, py+TILE/2, info.size/2 + 2, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // Dibujar barra de vida encima del enemigo
    if(e.maxHp && e.maxHp > 0) {
      const barW = TILE * 0.7;
      const barH = 4;
      const bx = px + (TILE - barW) / 2;
      const by = py - barH - 2;
      // Fondo
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx, by, barW, barH);
      // Vida
      const hpRatio = Math.max(0, e.hp) / e.maxHp;
      ctx.fillStyle = '#ff5555';
      ctx.fillRect(bx + 1, by + 1, (barW - 2) * hpRatio, barH - 2);
    }
    ctx.restore();
  });

  // Dibujar efecto de ataque del jugador cuando está atacando
  if(player.attacking) {
    const dirs = [[0,1],[-1,0],[1,0],[0,-1]];
    const d = dirs[player.dirIndex] || [0,1];
    const tx = player.x + d[0];
    const ty = player.y + d[1];
    const px = tx * TILE;
    const py = ty * TILE;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(255,220,120,0.9)';
    // Dibujar un rectángulo corto que representa el golpe
    ctx.fillRect(px + 2, py + 4, TILE - 4, TILE - 8);
    ctx.restore();
  }

  // Actualizar y dibujar proyectiles
  for(let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Fuera de pantalla?
    if(p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      projectiles.splice(i, 1);
      continue;
    }

    // Colisión con mapa/obstáculo
    const tx = Math.floor(p.x / TILE);
    const ty = Math.floor(p.y / TILE);
    if(isObstacle(tx, ty)) {
      projectiles.splice(i, 1);
      continue;
    }

    // Colisión con jugador
    const pxCenter = player.x * TILE + TILE/2;
    const pyCenter = player.y * TILE + TILE/2;
    const distP = Math.hypot(p.x - pxCenter, p.y - pyCenter);
    if(distP < TILE * 0.6) {
      // Flecha hace medio corazón
      damagePlayer(1);
      projectiles.splice(i, 1);
      continue;
    }

    // Dibujar la flecha
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(Math.round(p.x), Math.round(p.y), p.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  
  // Calcular posición visual interpolada
  let renderX = player.x;
  let renderY = player.y;
  
  if(player.moveProgress < 1.0) {
    // Estamos en medio de un movimiento, interpolar
    const prevX = player.dirIndex === 2 ? player.x - 1 : player.dirIndex === 1 ? player.x + 1 : player.x;
    const prevY = player.dirIndex === 0 ? player.y - 1 : player.dirIndex === 3 ? player.y + 1 : player.y;
    
    renderX = prevX + (player.x - prevX) * player.moveProgress;
    renderY = prevY + (player.y - prevY) * player.moveProgress;
  }
  
  // Sombra jugador
  ctx.fillStyle = palette.shadowLight;
  ctx.fillRect(renderX * TILE + 3, renderY * TILE + TILE - 3, TILE - 6, 2);
  
  // Jugador
  if(spriteReady) {
    const sx = player.frame * SPRITE_FRAME_W;
    const sy = player.dirIndex * SPRITE_FRAME_H;
    ctx.drawImage(spriteImg, sx, sy, SPRITE_FRAME_W, SPRITE_FRAME_H, 
                  Math.round(renderX * TILE), Math.round(renderY * TILE), TILE, TILE);
  } else {
    drawPixelSprite(playerSprite, renderX, renderY);
  }
  
  // Partículas
  updateParticles(dt);
  drawParticles();
  
  // Actualizar displays de nivel y puntuación
  const levelDisplay = document.getElementById('levelDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  if(levelDisplay) levelDisplay.textContent = `Nivel: ${gameState.level}`;
  if(scoreDisplay) scoreDisplay.textContent = `Puntuación: ${gameState.score}`;

  // Dibujar corazones (HUD) en canvas
  (function drawHearts(){
    const hearts = Math.ceil(player.maxHp / 2);
    const startX = 8;
    const startY = 8;
    const hw = 14; // ancho por corazón
    for(let h = 0; h < hearts; h++) {
      const bx = startX + h * (hw + 6);
      const by = startY;
      // Dibujar fondo del corazón (sombra)
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(bx, by, hw, 10);
      // Dibujar las dos mitades según hp en unidades (medio-corazones)
      const leftIndex = h*2; // índice de la mitad izquierda
      const rightIndex = h*2 + 1;
      // Left half
      if(player.hp > leftIndex) ctx.fillStyle = '#ff4d4d'; else ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(bx + 1, by + 1, (hw-2)/2 - 1, 8);
      // Right half
      if(player.hp > rightIndex) ctx.fillStyle = '#ff4d4d'; else ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(bx + 1 + (hw-2)/2, by + 1, (hw-2)/2 - 1, 8);
      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeRect(bx, by, hw, 10);
    }
  })();
  
  requestAnimationFrame(loop);
}

// Inicializar
prepareBg();
restartGame();
requestAnimationFrame(loop);
