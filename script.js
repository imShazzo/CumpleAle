// ==========================================
// 1. SISTEMA DE AUDIO TÁCTICO (WEB AUDIO API)
// Sin dependencias de MP3 ni descargas externas
// ==========================================
let audioEnabled = true;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const SFX = {
  click: () => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch(e) {}
  },
  keyType: () => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 300, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch(e) {}
  },
  success: () => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // Acorde C mayor futurista
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch(e) {}
  },
  denied: () => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      [140, 110].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.2);
      });
    } catch(e) {}
  }
};

// ==========================================
// 2. FONDO ANIMADO DE RADAR Y RED TÁCTICA
// ==========================================
const canvas = document.getElementById('cyberCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let radarAngle = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor(window.innerWidth / 16), 50);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1
    });
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rejilla de coordenadas en perspectiva sutil
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSize = 45;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Línea de barrido de radar de fondo
  radarAngle += 0.015;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radarLength = Math.max(canvas.width, canvas.height);
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radarLength, radarAngle, radarAngle + 0.25);
  ctx.closePath();
  const grad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radarLength);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Partículas y conexiones en red
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 100)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawBackground);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawBackground();

// ==========================================
// 3. DATOS Y LÓGICA DE LA YINCANA
// ==========================================
const MISSIONS = {
  1: {
    badge: "FASE 01 // SECTOR MEMORIA",
    title: "El primer guardián",
    clue: "El primer objetivo se ha resguardado en el lugar donde descansabas antes de que empezaran las obras. Explora tu antigua habitación entre los rincones de siempre.",
    code: "MICHAEL",
    placeholder: "CLAVE DEL 1.ER PELUCHE"
  },
  2: {
    badge: "FASE 02 // SECTOR CONSTRUCCIÓN",
    title: "Rumbo al nuevo refugio",
    clue: "¡Primer objetivo rescatado! El segundo ha avanzado hacia el futuro: búscalo entre herramientas, ladrillo y yeso, donde se está construyendo la habitación nueva.",
    code: "JACKSON",
    placeholder: "CLAVE DEL 2.º PELUCHE"
  },
  3: {
    badge: "FASE 03 // SECTOR EXTERIOR",
    title: "Aroma a brasa y fuego",
    clue: "Último sujeto en peligro. Ha buscado el calor del exterior y está vigilando cerca de la zona de la barbacoa, listo para el festejo.",
    code: "HAALAND",
    placeholder: "CLAVE DEL 3.ER PELUCHE"
  }
};

let currentStep = 1;
let typewriterTimeout = null;

const mainTerminal = document.getElementById('mainTerminal');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const nodes = document.querySelectorAll('.node');
const btnReset = document.getElementById('btnReset');
const btnSound = document.getElementById('btnSound');

// Reloj HUD
function updateClock() {
  const now = new Date();
  document.getElementById('systemClock').textContent = 
    now.toTimeString().split(' ')[0] + ' UTC';
}
setInterval(updateClock, 1000);
updateClock();

// Toggle de Sonido
btnSound.addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  btnSound.textContent = audioEnabled ? '🔊 SFX ON' : '🔇 SFX OFF';
  btnSound.style.borderColor = audioEnabled ? 'var(--cyan)' : 'var(--text-dim)';
  SFX.click();
});

// Inicializar estado con LocalStorage
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('agent_mission_step');
  if (saved && !isNaN(saved)) {
    currentStep = parseInt(saved, 10);
  }
  renderMission();
});

// Efecto de máquina de escribir / desencriptación militar
function typeWriterEffect(element, text, speed = 25) {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  element.textContent = '';
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      if (i % 2 === 0) SFX.keyType();
      i++;
      typewriterTimeout = setTimeout(typing, speed);
    }
  }
  typing();
}

function renderMission() {
  updateHUDProgress();

  if (currentStep <= 3) {
    const data = MISSIONS[currentStep];
    mainTerminal.innerHTML = `
      <div class="mission-badge">${data.badge}</div>
      <h2 class="mission-heading">${data.title}</h2>
      
      <div class="holo-transmission">
        <div class="holo-header">
          <span>📡 TRANSMISIÓN SATELITAL DESENCRIPTADA:</span>
        </div>
        <p class="holo-text" id="typewriterTarget"></p>
        <span class="cursor-blink"></span>
      </div>

      <form id="codeForm" class="terminal-form">
        <div class="input-box">
          <input 
            type="text" 
            id="codeInput" 
            class="cyber-input" 
            placeholder="${data.placeholder}" 
            autocomplete="off" 
            autocorrect="off" 
            autocapitalize="characters" 
            spellcheck="false" 
            required 
          />
        </div>
        <button type="submit" class="cyber-btn">VALIDAR CÓDIGO CLASIFICADO</button>
        <div id="statusAlert" class="status-alert"></div>
      </form>
    `;

    const typewriterTarget = document.getElementById('typewriterTarget');
    typeWriterEffect(typewriterTarget, data.clue);

    const form = document.getElementById('codeForm');
    const input = document.getElementById('codeInput');
    const alert = document.getElementById('statusAlert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      checkCode(input.value.trim(), data.code, alert);
    });
  } else {
    renderVictory();
  }
}

function checkCode(entered, target, alertEl) {
  if (entered.toUpperCase() === target.toUpperCase()) {
    SFX.success();
    alertEl.textContent = "";
    if (navigator.vibrate) navigator.vibrate([60, 40, 100]);
    currentStep++;
    localStorage.setItem('agent_mission_step', currentStep);
    renderMission();
  } else {
    SFX.denied();
    if (navigator.vibrate) navigator.vibrate([150, 40, 150]);
    alertEl.textContent = "✕ CÓDIGO INVÁLIDO. VERIFICA LA TARJETA DEL PELUCHE.";
    alertEl.className = "status-alert error";
    
    mainTerminal.classList.remove('shake');
    void mainTerminal.offsetWidth; // Reiniciar animación
    mainTerminal.classList.add('shake');
  }
}

function renderVictory() {
  SFX.success();
  mainTerminal.innerHTML = `
    <div class="victory-screen">
      <div class="medal-hologram">🏆</div>
      <h2 class="victory-title">¡MISIÓN COMPLETADA!</h2>
      <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.5;">
        Has asegurado los 3 objetivos con éxito en el perímetro. La cerradura del cargamento confidencial ha sido desbloqueada.
      </p>

      <div class="coordinates-box">
        <div class="coords-label">COORDENADAS DEL CARGAMENTO FINAL:</div>
        <div class="coords-value">LA PARTE DE ATRÁS DE LA CASA DE CAMPO</div>
      </div>

      <p class="victory-footer-note">
        Acude al punto de extracción, abre tu caja y mira el secreto detrás de cada una de tus Polaroids... ❤️
      </p>
    </div>
  `;

  // Explosión de confeti cibernético
  if (typeof confetti === 'function') {
    const end = Date.now() + 3500;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#00f0ff', '#ff007f', '#00ff9d', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#00f0ff', '#ff007f', '#00ff9d', '#f59e0b']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

function updateHUDProgress() {
  const percent = Math.min(Math.round(((currentStep - 1) / 3) * 100), 100);
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;

  nodes.forEach((node) => {
    const stepNum = parseInt(node.getAttribute('data-step'), 10);
    node.classList.remove('active', 'completed');
    if (stepNum < currentStep) {
      node.classList.add('completed');
    } else if (stepNum === currentStep) {
      node.classList.add('active');
    }
  });
}

// Botón de reinicio
btnReset.addEventListener('click', () => {
  SFX.click();
  if (confirm("¿Reiniciar la misión de la Agente Ale desde el principio?")) {
    currentStep = 1;
    localStorage.removeItem('agent_mission_step');
    renderMission();
  }
});