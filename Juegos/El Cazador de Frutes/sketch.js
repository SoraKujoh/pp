let basket;
let items = [];
let score = 0;
let lives = 3;
let itemTypes = ["🍎", "🍌", "🍊", "🍇", "🍓", "🍒", "🥝", "🍍", "💣"];
let speed = 2;
let splats = [];

// Fondo
let cloudOffset = 0;
let flowerPulse = 0;

// Locura Dorada
let goldenMode = false;
let goldenStartTime = 0;
const GOLDEN_DURATION_MS = 7000; // 7 segundos

// Leaderboard
let history = [];

function setup() {
  const canvas = createCanvas(400, 600);
  const gameEl = document.getElementById("game");
  canvas.parent(gameEl);
  basket = new Basket();
  textAlign(CENTER, CENTER);

  // Leaderboard: cargar, renderizar y bind botones
  history = loadHistory();
  renderLeaderboard();

  const restartBtn = document.getElementById("restartBtn");
  const clearLB = document.getElementById("clearLB");
  restartBtn.onclick = () => resetGame();
  clearLB.onclick = () => {
    history = [];
    saveHistory(history);
    renderLeaderboard();
  };
}

function draw() {
  drawBackground();

  // HUD: puntuación centrada
  fill(60, 40, 20);
  textSize(28);
  text(score, width / 2, 30);

  // Vidas con corazones
  textSize(24);
  for (let i = 0; i < lives; i++) {
    text("❤️", 30 + i * 30, 30);
  }

  // Banner Locura Dorada
  drawGoldenBanner();

  basket.update();
  basket.show();

  // Generar ítems (más frecuentes en Locura Dorada)
  const spawnInterval = goldenMode ? 30 : 60; // más caídas de oro
  if (frameCount % spawnInterval === 0) {
    if (goldenMode) {
      // cae más oro: 2 monedas por tick
      items.push(new Item("🪙"));
      items.push(new Item("🪙"));
    } else {
      items.push(new Item(random(itemTypes)));
    }
  }

  // Manchas en el suelo
  for (const s of splats) {
    fill(120, 80, 50);
    ellipse(s.x, height - 25, 40, 20);
  }

  // Ítems y colisiones
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].update();
    items[i].show();

    if (items[i].hits(basket)) {
      if (items[i].type === "💣" && !goldenMode) {
        lives--;
        splats.push({ x: items[i].x });
      } else if (items[i].type === "🪙") {
        score += 5; // oro da +5
      } else {
        score++;
        speed += 0.1;

        // Activar Locura Dorada cada 20 frutas normales
        if (!goldenMode && score % 20 === 0) {
          goldenMode = true;
          goldenStartTime = millis();
        }
      }
      items.splice(i, 1);
    } else if (items[i].y > height) {
      if (items[i].type !== "💣" && !goldenMode) {
        lives--;
        splats.push({ x: items[i].x });
      }
      items.splice(i, 1);
    }
  }

  // Game over
  if (lives <= 0) {
    noLoop();
    textSize(36);
    fill(150, 50, 50);
    text("GAME OVER", width / 2, height / 2);

    // Guardar resultado y actualizar leaderboard
    addResultToHistory(score);
    renderLeaderboard();
  }

  // Animaciones suaves
  cloudOffset += 0.2;
  flowerPulse = sin(frameCount * 0.05) * 3;

  // Desactivar Locura Dorada tras 7s y limpiar monedas
  if (goldenMode && millis() - goldenStartTime > GOLDEN_DURATION_MS) {
    goldenMode = false;
    // eliminar monedas restantes del juego
    items = items.filter(item => item.type !== "🪙");
  }
}

// Fondo cozy cartoon con capas y césped alto animado
function drawBackground() {
  // Fondo cambia en Locura Dorada
  if (goldenMode) {
    background(255, 220, 100); // dorado brillante
  } else {
    background(180, 220, 255); // cielo normal
  }

  // Nubes animadas
  fill(255);
  noStroke();
  ellipse((80 + cloudOffset) % (width + 80), 100, 60, 40);
  ellipse((110 + cloudOffset) % (width + 110), 100, 50, 35);
  ellipse((95 + cloudOffset) % (width + 95), 85, 40, 30);
  ellipse((280 + cloudOffset) % (width + 280), 150, 70, 40);
  ellipse((310 + cloudOffset) % (width + 310), 150, 50, 35);
  ellipse((295 + cloudOffset) % (width + 295), 135, 40, 30);

  // Capas de césped con sombra y césped alto en cada nivel
  fill(90, 160, 90);
  rect(0, height - 120, width, 40);
  drawTallGrass(height - 120, 40, 0.05, 70, 130, 70);

  fill(110, 180, 110);
  rect(0, height - 80, width, 30);
  drawTallGrass(height - 80, 30, 0.06, 75, 135, 75);

  fill(130, 200, 130);
  rect(0, height - 50, width, 50);
  drawTallGrass(height - 50, 50, 0.07, 80, 140, 80);

  // Poquitas flores discretas
  fill(255, 200, 200);
  ellipse(60, height - 30, 8 + flowerPulse, 8 + flowerPulse);
  ellipse(100, height - 25, 6 + flowerPulse, 6 + flowerPulse);
  fill(255, 255, 150);
  ellipse(300, height - 20, 8 + flowerPulse, 8 + flowerPulse);
  ellipse(330, height - 35, 6 + flowerPulse, 6 + flowerPulse);

  // Árboles en diferentes niveles (central más cerca)
  drawTree(40, height - 160, 12, 80, 50);   // cercano
  drawTree(120, height - 180, 10, 70, 40);  // medio
  drawTree(200, height - 140, 14, 90, 60);  // central más cerca
  drawTree(280, height - 170, 12, 80, 55);  // cercano
  drawTree(350, height - 190, 10, 70, 40);  // medio
}

// Césped alto animado en cada nivel (con variación leve)
function drawTallGrass(baseY, heightLevel, speedFactor, r, g, b) {
  for (let i = 0; i < width; i += 20) {
    const h = 15 + sin(frameCount * speedFactor + i * 0.1) * 4;
    fill(r, g, b);
    noStroke();
    triangle(i, baseY + heightLevel, i + 5, baseY + heightLevel - h, i + 10, baseY + heightLevel);
  }
}

// Árbol detallado con copas múltiples
function drawTree(x, y, trunkW, trunkH, crownSize) {
  fill(100, 60, 30);
  rect(x, y, trunkW, trunkH); // tronco bien apoyado
  fill(30, 150, 70);
  ellipse(x + trunkW / 2, y - 10, crownSize, crownSize);
  ellipse(x + trunkW / 2 - 15, y + 10, crownSize * 0.8, crownSize * 0.8);
  ellipse(x + trunkW / 2 + 15, y + 10, crownSize * 0.8, crownSize * 0.8);
}

// Banner animado de Locura Dorada (aislado con push/pop para no afectar opacidades)
function drawGoldenBanner() {
  if (!goldenMode) return;
  const elapsed = millis() - goldenStartTime;
  const remain = Math.max(0, GOLDEN_DURATION_MS - elapsed);
  const alphaPulse = 180 + 75 * sin(frameCount * 0.1); // pulso suave

  push();
  noStroke();
  // fondo banner opaco
  fill(255, 200, 60);
  rect(40, 60, width - 80, 40, 8);

  // texto con leve pulso (pero aislado)
  fill(80, 50, 10, alphaPulse);
  textSize(20);
  text(`¡Locura Dorada! 🪙 ${Math.ceil(remain / 1000)}s`, width / 2, 80);
  pop();
}

// Cesta con emoji
class Basket {
  constructor() {
    this.baseX = width / 2;
    this.y = height - 70;
    this.size = 72;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.baseX -= 5;
    if (keyIsDown(RIGHT_ARROW)) this.baseX += 5;
    this.baseX = constrain(this.baseX, this.size, width - this.size);
  }

  show() {
    textSize(this.size);
    text("🧺", this.baseX, this.y);
  }
}

// Ítems (frutas, bombas y oro)
class Item {
  constructor(type) {
    this.x = random(40, width - 40);
    this.y = 0;
    this.type = type;
    this.size = type === "🪙" ? 34 : 38; // oro ligeramente menor
  }

  update() {
    // en Locura Dorada el oro cae más rápido
    const extra = goldenMode && this.type === "🪙" ? 1.2 : 0;
    this.y += speed + extra;
  }

  show() {
    // asegurar opacidad plena del texto/emoji
    push();
    fill(0, 0, 0, 255); // opaco (no afecta color del emoji pero asegura alpha completa)
    textSize(this.size);
    text(this.type, this.x, this.y);
    pop();

    // Sombra leve para el oro (no afecta al propio emoji)
    if (this.type === "🪙") {
      noStroke();
      fill(120, 100, 40, 120);
      ellipse(this.x, this.y + this.size / 2, this.size * 0.6, this.size * 0.25);
    }
  }

  hits(basket) {
    return (
      this.y + this.size / 2 > basket.y - basket.size / 2 &&
      this.x > basket.baseX - basket.size / 2 &&
      this.x < basket.baseX + basket.size / 2
    );
  }
}

// Leaderboard: almacenamiento y render
function loadHistory() {
  try {
    const raw = localStorage.getItem("scoresHistory");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(arr) {
  try {
    localStorage.setItem("scoresHistory", JSON.stringify(arr));
  } catch {}
}

function addResultToHistory(s) {
  const entry = {
    score: s,
    date: new Date().toLocaleString()
  };
  history.push(entry);
  history.sort((a, b) => b.score - a.score);
  history = history.slice(0, 5); // top 5
  saveHistory(history);
}

function renderLeaderboard() {
  const lb = document.getElementById("leaderboard");
  lb.innerHTML = "";
  history.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "lb-item";
    div.innerHTML = `
      <span class="lb-rank">#${idx + 1}</span>
      <span class="lb-score">Puntos: ${item.score}</span>
      <span class="lb-date">${item.date}</span>
    `;
    lb.appendChild(div);
  });
}

// Reiniciar partida
function resetGame() {
  score = 0;
  lives = 3;
  items = [];
  splats = [];
  speed = 2;
  goldenMode = false;
  goldenStartTime = 0;
  loop();
}
