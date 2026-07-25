(() => {
  "use strict";

  const canvas = document.getElementById("art");
  const ctx = canvas.getContext("2d", { alpha: false });
  const video = document.getElementById("camera");
  const buttons = [...document.querySelectorAll(".scene-button")];

  const ui = {
    number: document.getElementById("sceneNumber"),
    title: document.getElementById("sceneTitle"),
    poem: document.getElementById("scenePoem"),
    daily: document.getElementById("dailyBadge"),
    scienceButton: document.getElementById("scienceButton"),
    sciencePanel: document.getElementById("sciencePanel"),
    aboutButton: document.getElementById("aboutButton"),
    aboutPanel: document.getElementById("aboutPanel"),
    scienceTitle: document.getElementById("scienceTitle"),
    scienceText: document.getElementById("scienceText"),
    scienceFormula: document.getElementById("scienceFormula"),
    gestureHelp: document.getElementById("gestureHelp"),
    sensorNote: document.getElementById("sensorNote"),
    variation: document.getElementById("variationButton"),
    capture: document.getElementById("captureButton"),
    haptic: document.getElementById("hapticButton"),
    install: document.getElementById("installButton"),
    permissionCard: document.getElementById("permissionCard"),
    permissionText: document.getElementById("permissionText"),
    permissionButton: document.getElementById("permissionButton"),
    toast: document.getElementById("toast")
  };

  const SCENES = {
    waves: {
      index: "01 / 06",
      title: "Résonance",
      poem: "Des étoiles chantent ensemble. Leur lumière s’assemble en ondes visibles selon la distance et le regard.",
      scienceTitle: "Interférences lumineuses",
      scienceText: "Chaque étoile émet une onde lumineuse avec sa propre fréquence. Leur superposition dépend de la distance entre les sources, de leur phase et de la distance à l’observateur. Là où les ondes s’accordent, l’image s’illumine ; là où elles se contrarient, elle s’assombrit.",
      formula: "I ≈ |Σ sin(kᵢ(dᵢ + dᵢ,obs) − ωᵢt + φᵢ)|",
      help: "Fais glisser l’observateur lumineux. Touche une étoile pour changer sa fréquence. ↻ crée une nouvelle constellation.",
      sensor: "Aucun capteur nécessaire. L’œuvre reste purement générée dans le navigateur."
    },
    field: {
      index: "02 / 06",
      title: "Invisible",
      poem: "La lumière traverse un seuil sensible. Selon le réglage, certains fragments passent et d’autres disparaissent.",
      scienceTitle: "Filtrage sélectif de la lumière",
      scienceText: "Cette œuvre imagine un filtre artistique inspiré des sélections de longueurs d’onde, de polarisation ou de particules. Des rayons solaires rencontrent une membrane réglable : certains éléments sont transmis, d’autres absorbés ou déviés.",
      formula: "T(λ, θ) → transmission sélective",
      help: "Glisse horizontalement pour régler le filtre. Touche pour changer le mode de sélection. La lumière transmise change alors de nature.",
      sensor: "Aucun capteur nécessaire. Tout se calcule localement, sans image réelle."
    },
    coriolis: {
      index: "03 / 06",
      title: "Coriolis",
      poem: "Un ferrofluide imaginaire circule de bassin en bassin. La rotation du monde courbe discrètement son chemin.",
      scienceTitle: "Déviation de Coriolis — interprétation artistique",
      scienceText: "Dans un référentiel en rotation, les trajectoires peuvent sembler déviées. Ici, ce principe devient une œuvre de circulation fluide entre plusieurs bassins. Le rendu évoque un ferrofluide coloré : il s’agit d’une interprétation artistique, pas d’une simulation physique complète.",
      formula: "a⃗_c = -2 Ω⃗ × v⃗",
      help: "Glisse horizontalement pour régler la force de Coriolis. Touche brièvement pour inverser le sens de rotation du monde.",
      sensor: "Le mouvement peut aussi suivre l’inclinaison du téléphone s’il l’autorise. Aucun flux n’est enregistré."
    },
    gravity: {
      index: "04 / 06",
      title: "Pesanteur",
      poem: "La Terre creuse la toile d’espace-temps. Des comètes la frôlent : assez près pour briller, assez loin pour survivre.",
      scienceTitle: "Courbure et passage atmosphérique",
      scienceText: "La toile montre une interprétation visuelle de l’espace-temps déformé par la Terre. Les comètes sont attirées vers elle. Si elles frôlent seulement l’atmosphère, elles deviennent des étoiles filantes ; si elles touchent le sol, la trajectoire est perdue.",
      formula: "F = G m₁ m₂ / r²",
      help: "Incline le téléphone ou fais glisser ton doigt pour ajuster l’attraction. Touche pour lancer une nouvelle comète et tente de créer une étoile filante sans collision.",
      sensor: "L’orientation du téléphone peut affiner le jeu. Sans capteur, le doigt suffit."
    },
    sound: {
      index: "05 / 06",
      title: "Floraison",
      poem: "Les fréquences s’assemblent couche après couche. La fleur n’écoute pas pour garder : elle écoute pour éclore.",
      scienceTitle: "Assemblage floral à partir du spectre",
      scienceText: "Le microphone mesure temporairement différentes bandes de fréquences. Les graves construisent le cœur, les médiums déploient les pétales, les aigus ajoutent étamines, éclats et pollen lumineux. Le son n’est ni sauvegardé ni envoyé.",
      formula: "X(k)=Σ x(n)e^(−i2πkn/N)",
      help: "Parle, chante ou joue un son. La fleur se construit en temps réel à partir des bandes de fréquences captées.",
      sensor: "Le microphone reste local au navigateur et s’arrête automatiquement dès que tu quittes cette œuvre."
    },
    camera: {
      index: "06 / 06",
      title: "Chromatique",
      poem: "Le monde entre par fragments. Plus la résolution change, plus la couleur choisit entre détail et abstraction.",
      scienceTitle: "Échantillonnage chromatique",
      scienceText: "L’image de la caméra est découpée en cellules de résolution variable. Chaque cellule reprend la couleur moyenne d’une petite zone. En diminuant la résolution, l’image devient plus abstraite ; en l’augmentant, elle gagne en détail.",
      formula: "C̄ = (1/N) Σ Cᵢ",
      help: "Glisse verticalement pour changer la résolution. Touche pour changer la géométrie des fragments colorés.",
      sensor: "La caméra reste locale et se coupe automatiquement quand tu quittes cette œuvre. Aucune image n’est enregistrée."
    }
  };

  let W = 0;
  let H = 0;
  let dpr = 1;
  let scene = "waves";
  let last = performance.now();
  let time = 0;
  let toastTimer = 0;
  let deferredInstall = null;
  let haptic = true;
  let seed = 0;
  let paletteIndex = 0;
  let pointerDownAt = 0;
  let pointerMoved = false;
  let permissionAction = null;

  const pointer = { x: innerWidth * 0.72, y: innerHeight * 0.56, nx: 0.72, ny: 0.56, down: false };
  const palettes = [
    [[8, 7, 13], [36, 90, 121], [224, 146, 65]],
    [[12, 5, 15], [119, 34, 98], [79, 194, 177]],
    [[5, 13, 12], [19, 98, 70], [237, 188, 91]],
    [[16, 6, 5], [126, 38, 25], [235, 124, 43]],
    [[7, 9, 19], [38, 67, 150], [214, 103, 130]]
  ];

  const dayKey = () => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  };

  function seeded(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function applyDailySeed() {
    seed = dayKey();
    paletteIndex = Math.floor(seeded(seed) * palettes.length);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function color(value) {
    const palette = palettes[paletteIndex];
    const v = clamp(value, 0, 1);
    const left = v < 0.5;
    const t = left ? v * 2 : (v - 0.5) * 2;
    const a = left ? palette[0] : palette[1];
    const b = left ? palette[1] : palette[2];
    return [0, 1, 2].map(i => Math.round(mix(a[i], b[i], t)));
  }

  function rgba(rgb, alpha) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("visible");
    toastTimer = setTimeout(() => ui.toast.classList.remove("visible"), 2200);
  }

  function vibrate(ms = 18) {
    if (haptic && navigator.vibrate) navigator.vibrate(ms);
  }

  function openPanel(which) {
    closePanels();
    if (which === "science") {
      ui.sciencePanel.classList.add("open");
      ui.sciencePanel.setAttribute("aria-hidden", "false");
      ui.scienceButton.setAttribute("aria-pressed", "true");
    }
    if (which === "about") {
      ui.aboutPanel.classList.add("open");
      ui.aboutPanel.setAttribute("aria-hidden", "false");
    }
  }

  function closePanels() {
    ui.sciencePanel.classList.remove("open");
    ui.aboutPanel.classList.remove("open");
    ui.sciencePanel.setAttribute("aria-hidden", "true");
    ui.aboutPanel.setAttribute("aria-hidden", "true");
    ui.scienceButton.setAttribute("aria-pressed", "false");
  }

  function showPermission(text, action) {
    permissionAction = action;
    ui.permissionText.textContent = text;
    ui.permissionCard.hidden = false;
  }

  function hidePermission() {
    permissionAction = null;
    ui.permissionCard.hidden = true;
  }

  ui.permissionButton.addEventListener("click", () => {
    if (permissionAction) permissionAction();
  });

  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", closePanels));
  ui.scienceButton.addEventListener("click", () => ui.sciencePanel.classList.contains("open") ? closePanels() : openPanel("science"));
  ui.aboutButton.addEventListener("click", () => openPanel("about"));
  ui.haptic.addEventListener("click", () => {
    haptic = !haptic;
    ui.haptic.setAttribute("aria-pressed", String(haptic));
    showToast(haptic ? "Vibrations actives" : "Vibrations désactivées");
  });

  buttons.forEach(button => button.addEventListener("click", () => setScene(button.dataset.scene)));
  ui.variation.addEventListener("click", () => resetScene(true));
  ui.capture.addEventListener("click", captureArtwork);

  function resize() {
    W = innerWidth;
    H = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    observer.x = W * observer.nx;
    observer.y = H * observer.ny;
    pointer.x = pointer.nx * W;
    pointer.y = pointer.ny * H;
    resetScene(false);
  }

  function updatePointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.nx = clamp(pointer.x / W, 0, 1);
    pointer.ny = clamp(pointer.y / H, 0, 1);
  }

  canvas.addEventListener("pointerdown", event => {
    pointer.down = true;
    pointerMoved = false;
    pointerDownAt = performance.now();
    updatePointer(event);
    canvas.setPointerCapture?.(event.pointerId);
    onPressStart();
  });

  canvas.addEventListener("pointermove", event => {
    if (!pointer.down) return;
    pointerMoved = true;
    updatePointer(event);
    onPointerDrag();
  });

  canvas.addEventListener("pointerup", event => {
    updatePointer(event);
    const shortTouch = performance.now() - pointerDownAt < 250 && !pointerMoved;
    if (shortTouch) onTap();
    pointer.down = false;
  });

  // ---------------------------------------------------------------------------
  // Privacy / sensors
  // ---------------------------------------------------------------------------

  let audioCtx = null;
  let analyser = null;
  let audioStream = null;
  let audioData = null;
  let audioActive = false;

  let cameraStream = null;
  let cameraActive = false;
  const camCanvas = document.createElement("canvas");
  const camCtx = camCanvas.getContext("2d", { willReadFrequently: true });

  let orientationActive = false;
  let orientationListenerAttached = false;
  const orientation = { gamma: 0, beta: 0 };

  function ensureOrientationListener() {
    if (orientationListenerAttached) return;
    window.addEventListener("deviceorientation", event => {
      orientation.gamma = event.gamma || 0;
      orientation.beta = event.beta || 0;
    }, { passive: true });
    orientationListenerAttached = true;
  }

  async function requestOrientationAccess() {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") throw new Error("denied");
      }
      ensureOrientationListener();
      orientationActive = true;
      hidePermission();
      showToast("Mouvement activé");
      vibrate();
    } catch {
      showToast("Mouvement non disponible : utilise ton doigt");
    }
  }

  async function startAudio() {
    try {
      stopAudio();
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false
      });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(audioStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      audioData = new Uint8Array(analyser.frequencyBinCount);
      audioActive = true;
      hidePermission();
      showToast("Le son devient fleur");
      vibrate();
    } catch {
      showToast("Microphone indisponible");
    }
  }

  function stopAudio() {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    analyser = null;
    audioData = null;
    audioActive = false;
  }

  async function startCamera() {
    try {
      stopCamera();
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      video.srcObject = cameraStream;
      await video.play();
      cameraActive = true;
      hidePermission();
      showToast("Les couleurs deviennent matière");
      vibrate();
    } catch {
      showToast("Caméra indisponible");
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraActive = false;
    video.pause();
    video.srcObject = null;
  }

  function stopAllMedia() {
    stopAudio();
    stopCamera();
  }

  window.addEventListener("pagehide", stopAllMedia);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAllMedia();
  });

  // ---------------------------------------------------------------------------
  // Scene management
  // ---------------------------------------------------------------------------

  function setScene(nextScene) {
    if (!SCENES[nextScene]) return;
    stopAllMedia();
    hidePermission();
    scene = nextScene;
    const data = SCENES[scene];
    ui.number.textContent = data.index;
    ui.title.textContent = data.title;
    ui.poem.textContent = data.poem;
    ui.scienceTitle.textContent = data.scienceTitle;
    ui.scienceText.textContent = data.scienceText;
    ui.scienceFormula.textContent = data.formula;
    ui.gestureHelp.textContent = data.help;
    ui.sensorNote.textContent = data.sensor;
    buttons.forEach(button => button.classList.toggle("active", button.dataset.scene === scene));
    closePanels();
    if (scene === "sound") {
      showPermission("Cette fleur se construit avec le spectre du microphone. Aucun son n’est enregistré ni envoyé. Active le microphone ?", startAudio);
    }
    if (scene === "camera") {
      showPermission("Cette œuvre transforme localement les couleurs de la caméra. Aucune image n’est enregistrée ni transmise. Activer la caméra ?", startCamera);
    }
    if (scene === "gravity" || scene === "coriolis") {
      showPermission("Tu peux activer l’orientation du téléphone pour enrichir l’interaction. Sans cela, le doigt suffit.", requestOrientationAccess);
    }
    resetScene(true);
  }

  // ---------------------------------------------------------------------------
  // Scene 1 - Resonance
  // ---------------------------------------------------------------------------

  const observer = { x: innerWidth * 0.78, y: innerHeight * 0.74, nx: 0.78, ny: 0.74 };
  const waveCanvas = document.createElement("canvas");
  const waveCtx = waveCanvas.getContext("2d");
  let waveImage = null;
  let waveSources = [];
  let activeStar = -1;

  function randomStar(index) {
    return {
      x: W * (0.18 + 0.18 * index + 0.08 * seeded(seed + index * 17)),
      y: H * (0.18 + 0.18 * seeded(seed + index * 31)),
      freq: 0.20 + 0.11 * seeded(seed + 100 + index * 7),
      phase: seeded(seed + 120 + index * 11) * Math.PI * 2,
      amp: 0.7 + 0.5 * seeded(seed + 210 + index * 19),
      hue: 28 + 48 * seeded(seed + 300 + index * 5)
    };
  }

  function initWaves() {
    const lowW = Math.max(120, Math.floor(W / 8));
    const lowH = Math.max(160, Math.floor(H / 8));
    waveCanvas.width = lowW;
    waveCanvas.height = lowH;
    waveImage = waveCtx.createImageData(lowW, lowH);
    waveSources = Array.from({ length: 4 }, (_, i) => randomStar(i));
    observer.nx = 0.76;
    observer.ny = 0.74;
    observer.x = observer.nx * W;
    observer.y = observer.ny * H;
  }

  function onPressStart() {
    if (scene === "waves") {
      activeStar = waveSources.findIndex(source => Math.hypot(pointer.x - source.x, pointer.y - source.y) < 34);
    }
  }

  function onPointerDrag() {
    if (scene === "waves") {
      if (activeStar >= 0) {
        waveSources[activeStar].x = pointer.x;
        waveSources[activeStar].y = pointer.y;
      } else {
        observer.x = pointer.x;
        observer.y = pointer.y;
        observer.nx = observer.x / W;
        observer.ny = observer.y / H;
      }
    }
    if (scene === "field") {
      filterTune = clamp(pointer.nx, 0.02, 0.98);
    }
    if (scene === "coriolis") {
      coriolisStrength = clamp((pointer.nx - 0.5) * 2.2, -1.4, 1.4);
    }
    if (scene === "gravity") {
      gravityGame.gravityScale = clamp(0.6 + (1 - pointer.ny) * 1.2, 0.5, 1.8);
    }
    if (scene === "camera") {
      cameraResolution = clamp(Math.round(8 + (1 - pointer.ny) * 26), 8, 34);
    }
  }

  function onTap() {
    if (scene === "waves") {
      if (activeStar >= 0) {
        waveSources[activeStar].freq = 0.18 + Math.random() * 0.18;
        waveSources[activeStar].hue = Math.random() * 70 + 10;
        vibrate(12);
      }
    }
    if (scene === "field") {
      filterMode = (filterMode + 1) % 3;
      showToast(["Mode spectral", "Mode polarisant", "Mode particulaire"][filterMode]);
      vibrate(12);
    }
    if (scene === "coriolis") {
      coriolisStrength *= -1;
      showToast(coriolisStrength >= 0 ? "Rotation antihoraire" : "Rotation horaire");
      vibrate(12);
    }
    if (scene === "gravity") {
      spawnComet(true);
    }
    if (scene === "camera") {
      cameraShape = (cameraShape + 1) % 3;
      showToast(["Fragments carrés", "Fragments circulaires", "Fragments triangulaires"][cameraShape]);
    }
    activeStar = -1;
  }

  function drawStarShape(x, y, radius, colorValue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.2);
      ctx.lineTo(Math.cos(angle) * radius * 1.8, Math.sin(angle) * radius * 1.8);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWaves() {
    if (!waveImage) return;
    const w = waveCanvas.width;
    const h = waveCanvas.height;
    const data = waveImage.data;
    const obsX = observer.x / W * w;
    const obsY = observer.y / H * h;

    let index = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let re = 0;
        let im = 0;
        let energy = 0;
        for (let i = 0; i < waveSources.length; i++) {
          const source = waveSources[i];
          const sx = source.x / W * w;
          const sy = source.y / H * h;
          const ds = Math.hypot(x - sx, y - sy);
          const dobs = Math.hypot(obsX - sx, obsY - sy);
          const phase = source.freq * (ds + dobs * 0.7) - time * (2.2 + source.freq * 4) + source.phase;
          const amp = source.amp / (1 + ds * 0.032);
          re += Math.cos(phase) * amp;
          im += Math.sin(phase) * amp;
          energy += amp;
        }
        const intensity = clamp(Math.hypot(re, im) / Math.max(1, energy * 0.92), 0, 1);
        const lens = clamp(1 - Math.hypot(x - obsX, y - obsY) / Math.max(22, Math.min(w, h) * 0.25), 0, 1);
        const shimmer = 0.22 * Math.sin((x + y) * 0.08 + time * 0.6) + 0.78;
        const rgb = color(clamp(intensity * (0.62 + lens * 0.8) * shimmer, 0, 1));
        data[index++] = rgb[0];
        data[index++] = rgb[1];
        data[index++] = rgb[2];
        data[index++] = 255;
      }
    }

    waveCtx.putImageData(waveImage, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(waveCanvas, 0, 0, W, H);

    const lens = ctx.createRadialGradient(observer.x, observer.y, 0, observer.x, observer.y, Math.min(W, H) * 0.24);
    lens.addColorStop(0, "rgba(255,250,240,0.16)");
    lens.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lens;
    ctx.fillRect(0, 0, W, H);

    waveSources.forEach((source, i) => {
      const hue = source.hue;
      drawStarShape(source.x, source.y, 5 + source.freq * 22, `hsla(${hue}, 100%, 72%, 0.95)`);
      ctx.fillStyle = "rgba(255,245,232,0.7)";
      ctx.font = "11px system-ui";
      ctx.fillText(`${(380 + source.freq * 160).toFixed(0)} THz`, source.x + 12, source.y - 10);
      if (i === activeStar) {
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(source.x, source.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.strokeStyle = "rgba(240,230,220,0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(observer.x, observer.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(observer.x, observer.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,245,235,0.9)";
    ctx.fill();

    drawHud(`Observateur`, `Sources ${waveSources.length}`);
  }

  // ---------------------------------------------------------------------------
  // Scene 2 - Invisible / filter
  // ---------------------------------------------------------------------------

  let filterTune = 0.52;
  let filterMode = 0;
  let sunParticles = [];

  function initField() {
    filterTune = 0.35 + 0.4 * seeded(seed + 401);
    sunParticles = Array.from({ length: 180 }, () => ({
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.8,
      lane: Math.random(),
      hue: 26 + Math.random() * 50
    }));
  }

  function drawField() {
    ctx.fillStyle = "rgba(18,9,7,0.26)";
    ctx.fillRect(0, 0, W, H);

    const sunX = W * 0.16;
    const sunY = H * 0.18;
    const filterX = W * 0.54;
    const filterY = H * 0.52;
    const filterW = W * 0.14;
    const filterH = H * 0.52;
    const threshold = 0.15 + filterMode * 0.05;

    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.min(W, H) * 0.18);
    sunGlow.addColorStop(0, "rgba(255,208,132,0.6)");
    sunGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 34; i++) {
      const y = H * (0.12 + i * 0.023);
      const freq = i / 33;
      const selected = Math.abs(freq - filterTune) < threshold;
      const hue = 18 + freq * 70;
      ctx.strokeStyle = selected ? `hsla(${hue}, 95%, 74%, 0.32)` : `hsla(${hue}, 30%, 36%, 0.09)`;
      ctx.lineWidth = selected ? 2.3 : 1.2;
      ctx.beginPath();
      ctx.moveTo(sunX + 16, sunY + 10);
      ctx.lineTo(filterX - filterW * 0.55, y);
      ctx.stroke();
      if (selected) {
        ctx.beginPath();
        ctx.moveTo(filterX + filterW * 0.55, y + (filterMode === 1 ? Math.sin(time + i) * 10 : 0));
        ctx.lineTo(W * 0.92, y + (filterMode === 2 ? Math.cos(time * 0.8 + i) * 24 : 0));
        ctx.stroke();
      }
    }

    const panel = ctx.createLinearGradient(filterX - filterW / 2, filterY, filterX + filterW / 2, filterY);
    panel.addColorStop(0, "rgba(38,34,40,0.82)");
    panel.addColorStop(0.5, "rgba(106,94,120,0.38)");
    panel.addColorStop(1, "rgba(20,18,26,0.82)");
    ctx.fillStyle = panel;
    ctx.fillRect(filterX - filterW / 2, filterY - filterH / 2, filterW, filterH);
    for (let i = 0; i <= 8; i++) {
      const x = filterX - filterW / 2 + i / 8 * filterW;
      ctx.strokeStyle = "rgba(230,220,240,0.15)";
      ctx.beginPath();
      ctx.moveTo(x, filterY - filterH / 2);
      ctx.lineTo(x, filterY + filterH / 2);
      ctx.stroke();
    }

    sunParticles.forEach(particle => {
      particle.t += 0.004 * particle.speed;
      if (particle.t > 1) particle.t = 0;
      const freq = particle.lane;
      if (Math.abs(freq - filterTune) < threshold) {
        const x = filterX + filterW * 0.5 + particle.t * W * 0.34;
        const y = H * (0.12 + freq * 0.76) + Math.sin(time * 2 + freq * 12) * 6;
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, 0.65)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + (1 - particle.t) * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(filterX, filterY - filterH / 2 - 18);
    ctx.lineTo(filterX, filterY + filterH / 2 + 18);
    ctx.stroke();
    const knobY = filterY + (filterTune - 0.5) * filterH * 0.9;
    ctx.fillStyle = "rgba(244,237,228,0.92)";
    ctx.beginPath();
    ctx.arc(filterX, knobY, 8, 0, Math.PI * 2);
    ctx.fill();

    drawHud(["Spectral", "Polarisant", "Particulaire"][filterMode], `Réglage ${Math.round(filterTune * 100)}%`);
  }

  // ---------------------------------------------------------------------------
  // Scene 3 - Coriolis / ferrofluid
  // ---------------------------------------------------------------------------

  let coriolisStrength = 0.45;
  let basins = [];
  let fluidParticles = [];

  function initCoriolis() {
    basins = [
      { x: W * 0.20, y: H * 0.26, r: Math.min(W, H) * 0.11 },
      { x: W * 0.52, y: H * 0.24, r: Math.min(W, H) * 0.12 },
      { x: W * 0.78, y: H * 0.40, r: Math.min(W, H) * 0.10 },
      { x: W * 0.56, y: H * 0.68, r: Math.min(W, H) * 0.13 },
      { x: W * 0.26, y: H * 0.70, r: Math.min(W, H) * 0.10 }
    ];
    fluidParticles = Array.from({ length: 520 }, (_, i) => {
      const basin = basins[i % basins.length];
      const a = Math.random() * Math.PI * 2;
      return {
        x: basin.x + Math.cos(a) * basin.r * 0.3,
        y: basin.y + Math.sin(a) * basin.r * 0.3,
        vx: 0,
        vy: 0,
        target: (i + 1) % basins.length,
        hue: (i % 3) * 70 + 18,
        trail: []
      };
    });
  }

  function drawBasin(basin) {
    const g = ctx.createRadialGradient(basin.x, basin.y, basin.r * 0.08, basin.x, basin.y, basin.r);
    g.addColorStop(0, "rgba(42,38,48,0.68)");
    g.addColorStop(1, "rgba(10,10,16,0.92)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(basin.x, basin.y, basin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(230,220,242,0.16)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCoriolis() {
    ctx.fillStyle = "rgba(10,9,14,0.11)";
    ctx.fillRect(0, 0, W, H);

    if (orientationActive && pointer.down === false) {
      coriolisStrength = clamp(orientation.gamma / 35, -1.4, 1.4);
    }

    basins.forEach(drawBasin);
    ctx.strokeStyle = "rgba(230,220,242,0.08)";
    ctx.lineWidth = 10;
    for (let i = 0; i < basins.length; i++) {
      const a = basins[i];
      const b = basins[(i + 1) % basins.length];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - 28 * Math.sign(coriolisStrength || 1), b.x, b.y);
      ctx.stroke();
    }

    fluidParticles.forEach(particle => {
      const target = basins[particle.target];
      const dx = target.x - particle.x;
      const dy = target.y - particle.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ax = dx / dist * 0.028;
      const ay = dy / dist * 0.028;
      particle.vx += ax - coriolisStrength * particle.vy * 0.008;
      particle.vy += ay + coriolisStrength * particle.vx * 0.008;
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 12) particle.trail.shift();
      if (dist < target.r * 0.25) particle.target = (particle.target + 1) % basins.length;

      for (let i = 1; i < particle.trail.length; i++) {
        const a = particle.trail[i - 1];
        const b = particle.trail[i];
        const alpha = i / particle.trail.length;
        ctx.strokeStyle = `hsla(${particle.hue}, 88%, 62%, ${alpha * 0.26})`;
        ctx.lineWidth = 1 + alpha * 1.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });

    drawHud(coriolisStrength >= 0 ? "Rotation +" : "Rotation −", `|Ω| ${Math.abs(coriolisStrength).toFixed(2)}`);
  }

  // ---------------------------------------------------------------------------
  // Scene 4 - Gravity game
  // ---------------------------------------------------------------------------

  const gravityGame = {
    earth: { x: 0, y: 0, r: 0, atmosphere: 0 },
    gravityScale: 1.0,
    comets: [],
    stars: 0,
    hits: 0,
    cooldown: 0
  };

  function initGravity() {
    gravityGame.earth = {
      x: W * 0.60,
      y: H * 0.55,
      r: Math.min(W, H) * 0.11,
      atmosphere: Math.min(W, H) * 0.16
    };
    gravityGame.gravityScale = 1.0;
    gravityGame.comets = [];
    gravityGame.stars = 0;
    gravityGame.hits = 0;
    gravityGame.cooldown = 0;
    for (let i = 0; i < 5; i++) spawnComet(false);
  }

  function spawnComet(fromTap) {
    const side = Math.floor(Math.random() * 3);
    let x = 0, y = 0, vx = 0, vy = 0;
    if (side === 0) {
      x = -10; y = H * (0.18 + Math.random() * 0.64); vx = 1.3 + Math.random() * 1.3; vy = -0.2 + Math.random() * 0.4;
    } else if (side === 1) {
      x = W * (0.05 + Math.random() * 0.35); y = -10; vx = 0.7 + Math.random() * 1.1; vy = 0.7 + Math.random() * 1.0;
    } else {
      x = -10; y = H * (0.65 + Math.random() * 0.22); vx = 1.8 + Math.random() * 1.1; vy = -1.0 + Math.random() * 0.5;
    }
    gravityGame.comets.push({ x, y, vx, vy, trail: [], star: false, dead: false, glow: fromTap ? 1 : 0.7 });
  }

  function drawSpacetime() {
    const { x: ex, y: ey, r } = gravityGame.earth;
    const pull = r * gravityGame.gravityScale * 1.55;
    ctx.strokeStyle = "rgba(235,228,250,0.11)";
    ctx.lineWidth = 1;
    const spacing = Math.min(W, H) * 0.08;
    for (let gx = -spacing; gx < W + spacing; gx += spacing) {
      ctx.beginPath();
      for (let gy = -spacing, first = true; gy < H + spacing; gy += 12) {
        const dx = gx - ex;
        const dy = gy - ey;
        const d = Math.hypot(dx, dy) + 20;
        const off = pull / d;
        const px = gx - dx / d * off * 0.4;
        const py = gy - dy / d * off;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let gy = -spacing; gy < H + spacing; gy += spacing) {
      ctx.beginPath();
      for (let gx = -spacing, first = true; gx < W + spacing; gx += 12) {
        const dx = gx - ex;
        const dy = gy - ey;
        const d = Math.hypot(dx, dy) + 20;
        const off = pull / d;
        const px = gx - dx / d * off * 0.4;
        const py = gy - dy / d * off;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  function drawGravity() {
    ctx.fillStyle = "rgba(7,10,18,0.14)";
    ctx.fillRect(0, 0, W, H);
    if (orientationActive && !pointer.down) {
      gravityGame.gravityScale = clamp(1 + orientation.beta / 80, 0.5, 1.8);
    }
    drawSpacetime();

    const earth = gravityGame.earth;
    const g = ctx.createRadialGradient(earth.x, earth.y, earth.r * 0.3, earth.x, earth.y, earth.atmosphere);
    g.addColorStop(0, "rgba(65,120,255,0.95)");
    g.addColorStop(0.55, "rgba(28,73,160,0.86)");
    g.addColorStop(0.82, "rgba(106,168,255,0.20)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.atmosphere, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(45,88,170,1)";
    ctx.fill();

    gravityGame.cooldown += 1;
    if (gravityGame.cooldown > 120) {
      spawnComet(false);
      gravityGame.cooldown = 0;
    }

    gravityGame.comets.forEach(comet => {
      const dx = earth.x - comet.x;
      const dy = earth.y - comet.y;
      const dist = Math.hypot(dx, dy) || 1;
      const accel = 0.08 * gravityGame.gravityScale / (dist / earth.r + 0.25);
      comet.vx += dx / dist * accel;
      comet.vy += dy / dist * accel;
      comet.x += comet.vx;
      comet.y += comet.vy;
      comet.trail.push({ x: comet.x, y: comet.y });
      if (comet.trail.length > 16) comet.trail.shift();

      if (!comet.star && dist < earth.atmosphere && dist > earth.r * 1.03) {
        comet.star = true;
        gravityGame.stars += 1;
        vibrate(10);
      }
      if (!comet.dead && dist <= earth.r) {
        comet.dead = true;
        gravityGame.hits += 1;
        vibrate(25);
      }
      if (comet.x < -40 || comet.x > W + 40 || comet.y < -40 || comet.y > H + 40 || comet.dead) {
        comet.remove = true;
      }

      for (let i = 1; i < comet.trail.length; i++) {
        const a = comet.trail[i - 1];
        const b = comet.trail[i];
        const alpha = i / comet.trail.length;
        ctx.strokeStyle = comet.star
          ? `rgba(255,225,175,${0.06 + alpha * 0.46})`
          : `rgba(184,226,255,${0.05 + alpha * 0.30})`;
        ctx.lineWidth = comet.star ? 2 + alpha * 2 : 1.2 + alpha * 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.fillStyle = comet.star ? "rgba(255,237,190,0.95)" : "rgba(210,235,255,0.82)";
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.star ? 3.2 : 2.1, 0, Math.PI * 2);
      ctx.fill();
    });

    gravityGame.comets = gravityGame.comets.filter(comet => !comet.remove);
    drawHud(`Étoiles filantes ${gravityGame.stars}`, `Impacts ${gravityGame.hits}`);
  }

  // ---------------------------------------------------------------------------
  // Scene 5 - Floral sound assembly
  // ---------------------------------------------------------------------------

  let flowerBands = [];

  function initSound() {
    flowerBands = Array.from({ length: 18 }, (_, index) => ({
      angle: index / 18 * Math.PI * 2,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function drawPetal(cx, cy, angle, inner, outer, width, colorValue, alpha) {
    const ax = Math.cos(angle), ay = Math.sin(angle);
    const nx = Math.cos(angle + Math.PI / 2), ny = Math.sin(angle + Math.PI / 2);
    const x0 = cx + ax * inner;
    const y0 = cy + ay * inner;
    const x3 = cx + ax * outer;
    const y3 = cy + ay * outer;
    ctx.fillStyle = colorValue.replace("1)", `${alpha})`).replace("0.95)", `${alpha})`);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + nx * width, y0 + ny * width, x3 + nx * width * 0.5, y3 + ny * width * 0.3, x3, y3);
    ctx.bezierCurveTo(x3 - nx * width * 0.5, y3 - ny * width * 0.3, x0 - nx * width, y0 - ny * width, x0, y0);
    ctx.fill();
  }

  function drawSound() {
    ctx.fillStyle = "rgba(10,6,12,0.15)";
    ctx.fillRect(0, 0, W, H);

    let values = new Uint8Array(256);
    if (audioActive && analyser && audioData) {
      analyser.getByteFrequencyData(audioData);
      values = audioData;
    } else {
      for (let i = 0; i < values.length; i++) values[i] = 36 + 34 * Math.sin(time * 1.1 + i * 0.08);
    }

    const cx = W * 0.55;
    const cy = H * 0.58;
    const low = values.slice(2, 18).reduce((a, b) => a + b, 0) / 16 / 255;
    const mid = values.slice(18, 72).reduce((a, b) => a + b, 0) / 54 / 255;
    const high = values.slice(72, 160).reduce((a, b) => a + b, 0) / 88 / 255;
    const coreR = Math.min(W, H) * (0.055 + low * 0.05);

    flowerBands.forEach((band, i) => {
      const v = values[Math.floor(i / flowerBands.length * values.length)] / 255;
      const a = band.angle + Math.sin(time * 0.6 + band.phase) * 0.05;
      drawPetal(cx, cy, a, coreR * 0.5, coreR * (1.8 + low * 0.6), 14 + low * 18, `rgba(242,196,122,0.95)`, 0.35 + low * 0.45);
      drawPetal(cx, cy, a + 0.09, coreR, coreR * (2.6 + mid * 1.8 + v * 0.9), 18 + v * 28, `rgba(232,120,154,0.95)`, 0.18 + mid * 0.55);
      drawPetal(cx, cy, a - 0.05, coreR * 0.92, coreR * (3.4 + high * 2.2 + v * 1.4), 10 + v * 16, `rgba(103,201,214,0.95)`, 0.12 + high * 0.38);
    });

    for (let i = 0; i < 42; i++) {
      const angle = i / 42 * Math.PI * 2 + time * 0.15;
      const radius = coreR * (0.7 + high * 0.4) + Math.sin(time * 1.5 + i) * 6;
      ctx.fillStyle = `rgba(255,240,205,${0.18 + high * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 1.2 + high * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.8);
    centerGlow.addColorStop(0, "rgba(255,233,188,0.42)");
    centerGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(248,218,162,0.96)";
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    drawHud(`Graves ${Math.round(low * 100)}%`, `Aigus ${Math.round(high * 100)}%`);
  }

  // ---------------------------------------------------------------------------
  // Scene 6 - Chromatic resolution
  // ---------------------------------------------------------------------------

  let cameraShape = 0;
  let cameraResolution = 18;

  function initCamera() {
    cameraShape = 0;
    cameraResolution = 18;
  }

  function drawCameraFallback() {
    const cell = Math.max(14, Math.floor(Math.min(W, H) / cameraResolution * 1.8));
    for (let y = 0; y < H; y += cell) {
      for (let x = 0; x < W; x += cell) {
        const value = (Math.sin(x * 0.018 + time) + Math.cos(y * 0.015 - time * 0.8) + 2) / 4;
        const rgb = color(value);
        ctx.fillStyle = rgba(rgb, 0.78);
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
  }

  function drawCell(px, py, cw, ch) {
    if (cameraShape === 0) {
      ctx.fillRect(px, py, cw, ch);
      return;
    }
    if (cameraShape === 1) {
      ctx.beginPath();
      ctx.arc(px + cw / 2, py + ch / 2, Math.min(cw, ch) * 0.48, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(px + cw / 2, py);
    ctx.lineTo(px + cw, py + ch);
    ctx.lineTo(px, py + ch);
    ctx.closePath();
    ctx.fill();
  }

  function drawCamera() {
    ctx.fillStyle = "#100907";
    ctx.fillRect(0, 0, W, H);

    const cols = cameraResolution;
    const rows = Math.max(10, Math.round(cols * H / W));
    const cellW = W / cols;
    const cellH = H / rows;

    if (!cameraActive || video.readyState < 2) {
      drawCameraFallback();
      drawHud(`Résolution ${cols}`, "Mode local sans caméra");
      return;
    }

    camCanvas.width = cols;
    camCanvas.height = rows;
    camCtx.drawImage(video, 0, 0, cols, rows);
    const data = camCtx.getImageData(0, 0, cols, rows).data;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        ctx.fillStyle = `rgba(${data[i]},${data[i + 1]},${data[i + 2]},0.86)`;
        drawCell(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
      }
    }

    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.16, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(10,4,4,0.46)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    drawHud(`Résolution ${cols}`, ["Carré", "Cercle", "Triangle"][cameraShape]);
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  function drawHud(left, right) {
    ctx.fillStyle = "rgba(245,236,225,0.78)";
    ctx.font = "12px system-ui";
    ctx.fillText(left, 20, H - 24);
    ctx.textAlign = "right";
    ctx.fillText(right, W - 20, H - 24);
    ctx.textAlign = "left";
  }

  function resetScene(randomize = true) {
    time = 0;
    if (randomize) paletteIndex = Math.floor(Math.random() * palettes.length);
    if (scene === "waves") initWaves();
    if (scene === "field") initField();
    if (scene === "coriolis") initCoriolis();
    if (scene === "gravity") initGravity();
    if (scene === "sound") initSound();
    if (scene === "camera") initCamera();
    ctx.fillStyle = "#100907";
    ctx.fillRect(0, 0, W, H);
  }

  async function captureArtwork() {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      const link = document.createElement("a");
      link.download = `phenomenes-${scene}-${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      showToast("Image enregistrée localement");
    } catch {
      showToast("Enregistrement impossible");
    }
  }

  function animate(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    if (scene === "waves") drawWaves();
    else if (scene === "field") drawField();
    else if (scene === "coriolis") drawCoriolis();
    else if (scene === "gravity") drawGravity();
    else if (scene === "sound") drawSound();
    else drawCamera();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstall = event;
    ui.install.hidden = false;
  });
  ui.install.addEventListener("click", async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      ui.install.hidden = true;
      return;
    }
    showToast(/iphone|ipad|ipod/i.test(navigator.userAgent)
      ? "Safari : Partager → Sur l’écran d’accueil"
      : "Menu du navigateur → Installer l’application");
  });
  window.addEventListener("appinstalled", () => {
    ui.install.hidden = true;
    showToast("PHÉNOMÈNES est installée");
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) ui.install.hidden = false;

  applyDailySeed();
  resize();
  setScene("waves");
  requestAnimationFrame(animate);
})();
