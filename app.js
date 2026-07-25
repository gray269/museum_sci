(() => {
  "use strict";

  const canvas = document.getElementById("art");
  const ctx = canvas.getContext("2d", { alpha: false });
  const buttons = [...document.querySelectorAll(".scene-button")];

  const ui = {
    number: document.getElementById("sceneNumber"),
    title: document.getElementById("sceneTitle"),
    poem: document.getElementById("scenePoem"),
    scienceButton: document.getElementById("scienceButton"),
    sciencePanel: document.getElementById("sciencePanel"),
    closeScience: document.getElementById("closeScience"),
    scienceTitle: document.getElementById("scienceTitle"),
    scienceText: document.getElementById("scienceText"),
    scienceFormula: document.getElementById("scienceFormula"),
    gestureHelp: document.getElementById("gestureHelp"),
    aboutButton: document.getElementById("aboutButton"),
    aboutPanel: document.getElementById("aboutPanel"),
    closeAbout: document.getElementById("closeAbout"),
    variationButton: document.getElementById("variationButton"),
    captureButton: document.getElementById("captureButton"),
    installButton: document.getElementById("installButton"),
    toast: document.getElementById("toast")
  };

  const SCENES = {
    waves: {
      index: "I / III",
      title: "Résonance",
      poem: "Deux vibrations se rencontrent. Certaines s’effacent, d’autres deviennent lumière.",
      scienceTitle: "Interférences d’ondes",
      scienceText:
        "Chaque source crée une onde périodique. Lorsque deux crêtes arrivent ensemble, leurs amplitudes s’additionnent : l’image s’éclaire. Lorsqu’une crête rencontre un creux, elles s’annulent partiellement : une zone sombre apparaît.",
      formula: "A = sin(kd₁ − ωt) + sin(kd₂ − ωt)",
      help: "Fais glisser ton doigt pour déplacer la seconde source. Touche brièvement pour créer une nouvelle palette."
    },
    field: {
      index: "II / III",
      title: "Invisible",
      poem: "Le vide n’est pas vide. Une influence silencieuse courbe chaque trajectoire.",
      scienceTitle: "Champ de deux charges",
      scienceText:
        "Un champ associe une direction et une intensité à chaque point de l’espace. Les particules ne représentent pas de la matière réelle : elles servent de révélateur graphique pour rendre la structure du champ perceptible.",
      formula: "E ∝ q · r⃗ / |r⃗|³",
      help: "Fais glisser ton doigt pour déplacer une charge. Touche brièvement pour inverser sa polarité."
    },
    chaos: {
      index: "III / III",
      title: "Papillon",
      poem: "Presque le même départ. Puis deux futurs qui ne se ressemblent plus.",
      scienceTitle: "Attracteur de Lorenz",
      scienceText:
        "Ce système de trois équations a été étudié dans un modèle simplifié de convection atmosphérique. Sa trajectoire reste confinée, mais ne se répète jamais exactement : une infime différence initiale grandit avec le temps.",
      formula: "ẋ = σ(y−x)   ẏ = x(ρ−z)−y   ż = xy−βz",
      help: "Fais glisser ton doigt horizontalement pour faire tourner la sculpture. Touche brièvement pour relancer des trajectoires presque identiques."
    }
  };

  let W = 0;
  let H = 0;
  let dpr = 1;
  let scene = "waves";
  let last = performance.now();
  let t = 0;
  let pointerMoved = false;
  let pointerDownAt = 0;
  let deferredInstallPrompt = null;
  let toastTimer = 0;

  const pointer = {
    x: window.innerWidth * 0.72,
    y: window.innerHeight * 0.56,
    nx: 0.72,
    ny: 0.56,
    down: false
  };

  const paletteSets = [
    [[4, 8, 20], [30, 110, 150], [235, 185, 120]],
    [[10, 4, 20], [126, 42, 145], [90, 214, 190]],
    [[3, 13, 15], [16, 105, 78], [238, 210, 138]],
    [[15, 5, 8], [150, 38, 35], [255, 168, 92]]
  ];
  let paletteIndex = 0;

  const lowCanvas = document.createElement("canvas");
  const lowCtx = lowCanvas.getContext("2d");
  let waveImage = null;

  let particles = [];
  let fieldPolarity = -1;
  let fieldSpeed = 1.0;

  let lorenzTraces = [];
  let rotation = -0.25;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const lowW = Math.max(90, Math.floor(W / 7));
    const lowH = Math.max(140, Math.floor(H / 7));
    lowCanvas.width = lowW;
    lowCanvas.height = lowH;
    waveImage = lowCtx.createImageData(lowW, lowH);

    pointer.x = pointer.nx * W;
    pointer.y = pointer.ny * H;
    resetScene(false);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("visible");
    toastTimer = setTimeout(() => ui.toast.classList.remove("visible"), 2300);
  }

  function setScene(next) {
    if (!SCENES[next]) return;
    scene = next;
    const data = SCENES[scene];

    ui.number.textContent = data.index;
    ui.title.textContent = data.title;
    ui.poem.textContent = data.poem;
    ui.scienceTitle.textContent = data.scienceTitle;
    ui.scienceText.textContent = data.scienceText;
    ui.scienceFormula.textContent = data.formula;
    ui.gestureHelp.textContent = data.help;

    buttons.forEach(button => {
      button.classList.toggle("active", button.dataset.scene === scene);
    });

    closePanels();
    resetScene(true);
  }

  function closePanels() {
    ui.sciencePanel.classList.remove("open");
    ui.sciencePanel.setAttribute("aria-hidden", "true");
    ui.aboutPanel.classList.remove("open");
    ui.aboutPanel.setAttribute("aria-hidden", "true");
    ui.scienceButton.setAttribute("aria-pressed", "false");
  }

  function openScience() {
    ui.aboutPanel.classList.remove("open");
    ui.sciencePanel.classList.add("open");
    ui.sciencePanel.setAttribute("aria-hidden", "false");
    ui.scienceButton.setAttribute("aria-pressed", "true");
  }

  function openAbout() {
    ui.sciencePanel.classList.remove("open");
    ui.aboutPanel.classList.add("open");
    ui.aboutPanel.setAttribute("aria-hidden", "false");
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => setScene(button.dataset.scene));
  });

  ui.scienceButton.addEventListener("click", () => {
    if (ui.sciencePanel.classList.contains("open")) closePanels();
    else openScience();
  });
  ui.closeScience.addEventListener("click", closePanels);
  ui.aboutButton.addEventListener("click", openAbout);
  ui.closeAbout.addEventListener("click", closePanels);
  ui.variationButton.addEventListener("click", () => resetScene(true));
  ui.captureButton.addEventListener("click", captureArtwork);

  canvas.addEventListener("pointerdown", event => {
    pointer.down = true;
    pointerMoved = false;
    pointerDownAt = performance.now();
    updatePointer(event);
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", event => {
    if (!pointer.down) return;
    pointerMoved = true;
    updatePointer(event);

    if (scene === "chaos") {
      rotation = (pointer.nx - 0.5) * 2.4;
    }
  });

  canvas.addEventListener("pointerup", event => {
    updatePointer(event);
    pointer.down = false;
    const shortTouch = performance.now() - pointerDownAt < 260 && !pointerMoved;

    if (shortTouch) {
      if (scene === "waves") nextPalette();
      if (scene === "field") {
        fieldPolarity *= -1;
        showToast(fieldPolarity > 0 ? "Deux charges de même signe" : "Deux charges opposées");
      }
      if (scene === "chaos") initLorenz();
    }
  });

  function updatePointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.nx = clamp(pointer.x / W, 0, 1);
    pointer.ny = clamp(pointer.y / H, 0, 1);
  }

  function nextPalette() {
    paletteIndex = (paletteIndex + 1) % paletteSets.length;
  }

  function resetScene(randomize = true) {
    t = 0;
    ctx.fillStyle = "#070910";
    ctx.fillRect(0, 0, W, H);

    if (randomize) {
      paletteIndex = Math.floor(Math.random() * paletteSets.length);
    }

    if (scene === "field") initParticles();
    if (scene === "chaos") initLorenz();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(a, b, amount) {
    return a + (b - a) * amount;
  }

  function colorFromPalette(value) {
    const palette = paletteSets[paletteIndex];
    const v = clamp(value, 0, 1);
    const firstHalf = v < 0.5;
    const local = firstHalf ? v * 2 : (v - 0.5) * 2;
    const a = firstHalf ? palette[0] : palette[1];
    const b = firstHalf ? palette[1] : palette[2];

    return [
      Math.round(mix(a[0], b[0], local)),
      Math.round(mix(a[1], b[1], local)),
      Math.round(mix(a[2], b[2], local))
    ];
  }

  // ---------------------------------------------------------------------------
  // RÉSONANCE
  // ---------------------------------------------------------------------------

  function drawWaves() {
    const w = lowCanvas.width;
    const h = lowCanvas.height;
    const data = waveImage.data;

    const x1 = w * 0.30;
    const y1 = h * 0.58;
    const x2 = pointer.nx * w;
    const y2 = pointer.ny * h;
    const k = 0.34 + paletteIndex * 0.018;

    let index = 0;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const d1 = Math.hypot(x - x1, y - y1);
        const d2 = Math.hypot(x - x2, y - y2);
        const a = Math.sin(k * d1 - t * 2.7) + Math.sin(k * d2 - t * 2.7);
        const fringe = Math.pow(Math.abs(a) * 0.5, 1.65);
        const envelope = 0.74 + 0.26 * Math.sin((d1 - d2) * 0.08 + t * 0.4);
        const value = clamp(fringe * envelope, 0, 1);
        const [r, g, b] = colorFromPalette(value);

        data[index++] = r;
        data[index++] = g;
        data[index++] = b;
        data[index++] = 255;
      }
    }

    lowCtx.putImageData(waveImage, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(lowCanvas, 0, 0, W, H);

    const glow = ctx.createRadialGradient(
      pointer.x, pointer.y, 0,
      pointer.x, pointer.y, Math.min(W, H) * 0.24
    );
    glow.addColorStop(0, "rgba(255,255,255,.12)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------------------
  // CHAMP INVISIBLE
  // ---------------------------------------------------------------------------

  class FieldParticle {
    constructor(randomAnywhere = true) {
      this.reset(randomAnywhere);
    }

    reset(randomAnywhere = false) {
      const originX = W * 0.31;
      const originY = H * 0.60;
      const angle = Math.random() * Math.PI * 2;
      const radius = randomAnywhere
        ? Math.random() * Math.max(W, H) * 0.68
        : 8 + Math.random() * 38;

      this.x = originX + Math.cos(angle) * radius;
      this.y = originY + Math.sin(angle) * radius;
      this.px = this.x;
      this.py = this.y;
      this.life = 130 + Math.random() * 430;
      this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
      this.px = this.x;
      this.py = this.y;

      const sources = [
        { x: W * 0.31, y: H * 0.60, q: 1 },
        { x: pointer.x, y: pointer.y, q: fieldPolarity }
      ];

      let ex = 0;
      let ey = 0;

      for (const source of sources) {
        const dx = this.x - source.x;
        const dy = this.y - source.y;
        const r2 = dx * dx + dy * dy + 120;
        const invR3 = 1 / Math.pow(r2, 1.5);
        ex += source.q * dx * invR3;
        ey += source.q * dy * invR3;
      }

      const magnitude = Math.hypot(ex, ey) || 1;
      const direction = fieldPolarity < 0 ? 1 : this.direction;
      this.x += direction * ex / magnitude * fieldSpeed;
      this.y += direction * ey / magnitude * fieldSpeed;
      this.life -= 1;

      const nearSource =
        Math.hypot(this.x - sources[0].x, this.y - sources[0].y) < 10 ||
        Math.hypot(this.x - sources[1].x, this.y - sources[1].y) < 10;

      if (
        this.life <= 0 ||
        this.x < -30 || this.x > W + 30 ||
        this.y < -30 || this.y > H + 30 ||
        nearSource
      ) {
        this.reset(false);
      }
    }

    draw() {
      const hueShift = paletteIndex * 25;
      ctx.strokeStyle = `hsla(${188 + hueShift}, 85%, 70%, .19)`;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
  }

  function initParticles() {
    fieldSpeed = 0.75 + Math.random() * 0.75;
    const count = Math.round(clamp((W * H) / 2100, 240, 700));
    particles = Array.from({ length: count }, () => new FieldParticle(true));
  }

  function drawCharge(x, y, sign) {
    const radius = Math.min(W, H) * 0.10;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const warm = sign > 0;
    gradient.addColorStop(0, warm ? "rgba(255,170,105,.42)" : "rgba(95,185,255,.42)");
    gradient.addColorStop(.18, warm ? "rgba(255,95,80,.16)" : "rgba(70,100,255,.16)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fill();
  }

  function drawField() {
    ctx.fillStyle = "rgba(5,7,14,.052)";
    ctx.fillRect(0, 0, W, H);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    drawCharge(W * 0.31, H * 0.60, 1);
    drawCharge(pointer.x, pointer.y, fieldPolarity);
  }

  // ---------------------------------------------------------------------------
  // PAPILLON DU CHAOS
  // ---------------------------------------------------------------------------

  function initLorenz() {
    const base = {
      x: 0.01 + Math.random() * 0.03,
      y: 0,
      z: 0
    };

    lorenzTraces = Array.from({ length: 5 }, (_, index) => ({
      x: base.x + index * 0.0008,
      y: base.y,
      z: base.z,
      points: [],
      hue: 175 + index * 24 + paletteIndex * 10
    }));
  }

  function stepLorenz(trace, dt) {
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;

    const dx = sigma * (trace.y - trace.x);
    const dy = trace.x * (rho - trace.z) - trace.y;
    const dz = trace.x * trace.y - beta * trace.z;

    trace.x += dx * dt;
    trace.y += dy * dt;
    trace.z += dz * dt;
  }

  function projectLorenz(x, y, z) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    const scale = Math.min(W, H) * 0.0125;

    return {
      x: W * 0.57 + rx * scale,
      y: H * 0.54 + (z - 25) * scale * 0.88 + ry * scale * 0.10
    };
  }

  function drawChaos() {
    ctx.fillStyle = "rgba(4,6,12,.095)";
    ctx.fillRect(0, 0, W, H);

    if (!pointer.down) rotation += 0.0007;

    lorenzTraces.forEach((trace, traceIndex) => {
      for (let i = 0; i < 5; i += 1) {
        stepLorenz(trace, 0.005);
      }

      const point = projectLorenz(trace.x, trace.y, trace.z);
      trace.points.push(point);
      if (trace.points.length > 1050) trace.points.shift();

      for (let i = 1; i < trace.points.length; i += 1) {
        const a = trace.points[i - 1];
        const b = trace.points[i];
        const alpha = i / trace.points.length;

        ctx.strokeStyle = `hsla(${trace.hue}, 82%, ${58 + traceIndex * 3}%, ${0.015 + alpha * 0.20})`;
        ctx.lineWidth = 0.35 + alpha * 1.15;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  }

  // ---------------------------------------------------------------------------

  function captureArtwork() {
    const link = document.createElement("a");
    link.download = `phenomenes-${scene}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Image de l’œuvre créée");
  }

  function animate(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    if (scene === "waves") drawWaves();
    if (scene === "field") drawField();
    if (scene === "chaos") drawChaos();

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    ui.installButton.hidden = false;
  });

  ui.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast("Utilise le menu du navigateur puis « Ajouter à l’écran d’accueil »");
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    ui.installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    ui.installButton.hidden = true;
    showToast("PHÉNOMÈNES est installée");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.warn("Service worker non enregistré :", error);
      });
    });
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

  if (isIOS && !isStandalone) {
    ui.installButton.hidden = false;
    ui.installButton.addEventListener("click", () => {
      showToast("Dans Safari : Partager → Sur l’écran d’accueil");
    }, { once: true });
  }

  resize();
  setScene("waves");
  requestAnimationFrame(animate);
})();
