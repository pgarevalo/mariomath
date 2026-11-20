(function () {
  'use strict';

  const CANVAS_W = 960;
  const CANVAS_H = 520;
  const PLAYER_W = 34;
  const PLAYER_H = 44;
  const MATH_TIME_LIMIT = 30; // Máximo 30 segundos por problema

  const state = {
    phase: 'setup', // 'setup' | 'turnReady' | 'playing' | 'dying' | 'math' | 'victory'
    numPlayers: 2,
    totalWorlds: 2,
    activeIdx: 0,
    lastChanceMode: false,
    players: [],
    keys: { left: false, right: false, jump: false },
    jumpBuffer: 0,
    currentChallenge: null,
    mathTimerInterval: null,
    deathTimer: 0,
    deathNote: '',
    floatingTexts: [],
    particles: [],
    clouds: [
      { x: 90, y: 72, s: 1.0 },
      { x: 360, y: 54, s: 0.8 },
      { x: 650, y: 88, s: 1.15 },
      { x: 980, y: 64, s: 0.9 },
      { x: 1320, y: 80, s: 1.05 },
      { x: 1720, y: 58, s: 0.85 },
      { x: 2150, y: 75, s: 1.1 },
      { x: 2520, y: 62, s: 0.95 }
    ],
    hills: [
      { x: 40, w: 190, h: 95 },
      { x: 520, w: 150, h: 72 },
      { x: 1080, w: 210, h: 105 },
      { x: 1640, w: 160, h: 80 },
      { x: 2220, w: 195, h: 98 }
    ]
  };

  const els = {};

  function cacheElements() {
    const ids = [
      'setup-screen', 'game-screen', 'victory-screen',
      'btn-mode-1p', 'btn-mode-2p', 'players-grid', 'p1-setup-box', 'setup-hero-sub',
      'p0-name', 'p1-name', 'p0-chars', 'p1-chars',
      'p0-topics-12', 'p0-topics-6', 'p1-topics-12', 'p1-topics-6',
      'total-worlds', 'btn-start-game',
      'hud-p0', 'hud-p1',
      'hud-avatar-0', 'hud-avatar-1',
      'hud-name-0', 'hud-name-1',
      'hud-score-0', 'hud-score-1',
      'hud-coins-0', 'hud-coins-1',
      'hud-streak-0', 'hud-streak-1',
      'hud-world-0', 'hud-world-1',
      'hud-status-0', 'hud-status-1',
      'hud-stage-title',
      'race-pin-0', 'race-pin-1',
      'btn-mute', 'btn-restart',
      'game-canvas',
      'turn-overlay', 'turn-avatar', 'turn-title', 'turn-subtitle', 'btn-begin-turn',
      'math-modal', 'math-event-banner', 'math-player-pill', 'math-timer-pill', 'math-timer-fill', 'math-topic-badge',
      'math-question-title', 'math-prompt', 'math-options',
      'math-feedback', 'math-result-title', 'math-explanation', 'btn-next-turn',
      'victory-headline', 'victory-sub', 'victory-cards',
      'btn-play-again', 'btn-back-setup',
      'btn-left', 'btn-right', 'btn-jump'
    ];
    ids.forEach(id => {
      els[id] = document.getElementById(id);
    });
  }

  // =========================================================================
  // CONFIGURACIÓN INICIAL Y SELECCIÓN DE PERSONAJES
  // =========================================================================
  const setupSelection = [
    { charId: 'mario', ageGroup: '12' },
    { charId: 'yoshi', ageGroup: '6' }
  ];

  function renderCharacterPickers() {
    const charList = Object.values(MarioSprites.CHARACTERS);
    [0, 1].forEach(pIdx => {
      const container = els[`p${pIdx}-chars`];
      container.innerHTML = '';
      charList.forEach(ch => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'char-card' + (setupSelection[pIdx].charId === ch.id ? ' selected' : '');
        btn.dataset.char = ch.id;

        const c = document.createElement('canvas');
        c.width = 56;
        c.height = 56;
        MarioSprites.renderAvatarBadge(c, ch.id);

        const lbl = document.createElement('span');
        lbl.className = 'char-name';
        lbl.textContent = ch.name;

        btn.appendChild(c);
        btn.appendChild(lbl);
        btn.addEventListener('click', () => {
          setupSelection[pIdx].charId = ch.id;
          container.querySelectorAll('.char-card').forEach(el => el.classList.remove('selected'));
          btn.classList.add('selected');
          MarioAudio.coin();
        });
        container.appendChild(btn);
      });
    });
  }

  function bindAgeSwitchers() {
    [0, 1].forEach(pIdx => {
      const radios = document.querySelectorAll(`input[name="p${pIdx}-age"]`);
      radios.forEach(r => {
        r.addEventListener('change', () => {
          setupSelection[pIdx].ageGroup = r.value;
          els[`p${pIdx}-topics-12`].classList.toggle('hidden', r.value !== '12');
          els[`p${pIdx}-topics-6`].classList.toggle('hidden', r.value !== '6');
        });
      });
    });
  }

  let selectedPlayerCount = 2;

  function setPlayerCountMode(count) {
    selectedPlayerCount = count === 1 ? 1 : 2;
    els['btn-mode-1p'].classList.toggle('active', selectedPlayerCount === 1);
    els['btn-mode-2p'].classList.toggle('active', selectedPlayerCount === 2);
    els['p1-setup-box'].classList.toggle('hidden', selectedPlayerCount === 1);
    els['players-grid'].classList.toggle('single-player-grid', selectedPlayerCount === 1);

    if (selectedPlayerCount === 1) {
      els['setup-hero-sub'].textContent =
        '¡Modo 1 Jugador (3 vidas ❤️)! Si aciertas en ≤30 s sigues adelante; mueres si te choca un enemigo, caes o fallas un reto.';
    } else {
      els['setup-hero-sub'].textContent =
        '¡Si aciertas en ≤30 s sigues jugando! Mueres y pierdes el turno si te choca un enemigo, caes a un foso o fallas un reto matemático.';
    }
  }

  function createFreshPlayerState(baseInfo, pIdx) {
    const level = MarioLevels.cloneLevel(1);
    const startY = level.groundY - PLAYER_H;
    return {
      index: pIdx,
      name: baseInfo.name,
      charId: baseInfo.charId,
      ageGroup: baseInfo.ageGroup,
      topics: baseInfo.topics,
      score: 0,
      coins: 0,
      streak: 0,
      bestStreak: 0,
      mathCorrect: 0,
      mathTotal: 0,
      deaths: 0,
      lives: 3,
      turnsPlayed: 0,
      worldIndex: 1,
      finishedAll: false,
      level,
      x: 80,
      y: startY,
      vx: 0,
      vy: 0,
      facing: 1,
      walkPhase: 0,
      onGround: true,
      coyoteTimer: 0,
      poweredTimer: 0,
      invulnTimer: 90,
      checkpointX: 80,
      cameraX: 0
    };
  }

  function readPlayerSetup(pIdx) {
    const rawName = (els[`p${pIdx}-name`].value || '').trim();
    const charId = setupSelection[pIdx].charId;
    const charName = MarioSprites.CHARACTERS[charId].name;
    const ageGroup = setupSelection[pIdx].ageGroup;
    const topicContainer = els[`p${pIdx}-topics-${ageGroup}`];
    const checked = Array.from(topicContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

    return createFreshPlayerState({
      name: rawName || `${charName} J${pIdx + 1}`,
      charId,
      ageGroup,
      topics: checked
    }, pIdx);
  }

  function startMatch(reusePlayers = false) {
    stopMathTimer();
    state.numPlayers = reusePlayers ? state.numPlayers : selectedPlayerCount;
    state.totalWorlds = parseInt(els['total-worlds'].value, 10) || 2;
    state.lastChanceMode = false;
    state.activeIdx = 0;
    state.currentChallenge = null;
    state.floatingTexts = [];
    state.particles = [];

    if (reusePlayers && state.players.length === state.numPlayers) {
      state.players = state.players.map((oldP, idx) => createFreshPlayerState(oldP, idx));
    } else if (state.numPlayers === 1) {
      state.players = [readPlayerSetup(0)];
    } else {
      state.players = [readPlayerSetup(0), readPlayerSetup(1)];
    }

    els['setup-screen'].classList.add('hidden');
    els['victory-screen'].classList.add('hidden');
    els['game-screen'].classList.remove('hidden');

    const topHud = els['hud-p0'].parentElement;
    topHud.classList.toggle('single-hud', state.numPlayers === 1);
    els['hud-p1'].classList.toggle('hidden', state.numPlayers === 1);
    els['race-pin-1'].classList.toggle('hidden', state.numPlayers === 1);

    MarioSprites.renderAvatarBadge(els['hud-avatar-0'], state.players[0].charId);
    const pinChar0 = MarioSprites.CHARACTERS[state.players[0].charId];
    els['race-pin-0'].textContent = pinChar0.badge;
    els['race-pin-0'].style.backgroundColor = pinChar0.hat === '#ffffff' ? '#2055d8' : pinChar0.hat;

    if (state.numPlayers === 2) {
      MarioSprites.renderAvatarBadge(els['hud-avatar-1'], state.players[1].charId);
      const pinChar1 = MarioSprites.CHARACTERS[state.players[1].charId];
      els['race-pin-1'].textContent = pinChar1.badge;
      els['race-pin-1'].style.backgroundColor = pinChar1.hat === '#ffffff' ? '#2055d8' : pinChar1.hat;
    }

    MarioAudio.ensureContext();
    MarioAudio.startMusic();
    updateHUD();
    prepareTurnOverlay();
  }

  // =========================================================================
  // GESTIÓN DE TURNOS, DIFICULTAD PROGRESIVA Y HUD
  // =========================================================================
  function getPlayerProgressRatio(p) {
    if (p.finishedAll) return 1;
    const stageRatio = Math.min(1, Math.max(0, p.x / p.level.goalX));
    return ((p.worldIndex - 1) + stageRatio) / state.totalWorlds;
  }

  function computeDifficultyTier(p, reason) {
    // Empieza en nivel 1 (fácil) y sube gradualmente de 1 a 4 según el avance y aciertos
    const progress = getPlayerProgressRatio(p);
    const solvedBoost = Math.min(0.32, p.mathCorrect * 0.045);
    const castleBoost = reason === 'castle' ? 0.16 : 0;
    const score = progress * 0.82 + solvedBoost + castleBoost;

    if (score < 0.27) return 1;
    if (score < 0.54) return 2;
    if (score < 0.80) return 3;
    return 4;
  }

  function updateHUD() {
    if (state.players.length === 0) return;
    state.players.forEach((p, i) => {
      const isActive = i === state.activeIdx;
      els[`hud-p${i}`].classList.toggle('active-player', isActive);
      els[`hud-name-${i}`].textContent = p.name;
      els[`hud-score-${i}`].textContent = `${p.score} pts`;
      els[`hud-coins-${i}`].textContent = `🪙 ${p.coins}`;
      els[`hud-streak-${i}`].textContent = `🔥 ${p.streak}`;
      els[`hud-world-${i}`].textContent = p.finishedAll
        ? '🏆 Meta'
        : `Mundo 1-${p.worldIndex}/${state.totalWorlds}`;
      if (state.numPlayers === 1) {
        els[`hud-status-${i}`].textContent = '❤️'.repeat(Math.max(0, p.lives)) || '💔 0';
      } else {
        els[`hud-status-${i}`].textContent = isActive ? '▶ SU TURNO' : 'ESPERA';
      }

      const pct = Math.round(getPlayerProgressRatio(p) * 92);
      els[`race-pin-${i}`].style.left = `${pct}%`;
    });

    const activeP = state.players[state.activeIdx];
    els['hud-stage-title'].textContent = activeP.level.name;
  }

  function prepareTurnOverlay(extraNote) {
    state.phase = 'turnReady';
    resetMovementKeys();
    const p = state.players[state.activeIdx];
    p.vx = 0;
    p.vy = 0;
    p.invulnTimer = Math.max(p.invulnTimer, 120);

    MarioSprites.renderAvatarBadge(els['turn-avatar'], p.charId);
    els['turn-title'].textContent = state.numPlayers === 1
      ? `¡Preparado, ${p.name}!`
      : `¡Turno de ${p.name}!`;
    const ageDesc = p.ageGroup === '6'
      ? 'Sumas con llevadas y Restas'
      : 'M.C.D., m.c.m. y Fracciones';
    const defaultSub = state.numPlayers === 1
      ? `${'❤️'.repeat(Math.max(1, p.lives))} · ${p.level.name} · ${ageDesc}`
      : `${p.level.name} · Retos de ${ageDesc}`;
    els['turn-subtitle'].textContent = extraNote || defaultSub;

    els['math-modal'].classList.add('hidden');
    els['turn-overlay'].classList.remove('hidden');
    MarioAudio.turnSwitch();
    updateHUD();
  }

  function beginActiveTurn() {
    if (state.phase !== 'turnReady') return;
    els['turn-overlay'].classList.add('hidden');
    state.phase = 'playing';
    MarioAudio.jump();
  }

  // =========================================================================
  // MUERTE DEL PERSONAJE (EN JUEGO NORMAL O AL FALLAR PREGUNTA)
  // =========================================================================
  function triggerPlatformDeath(reasonMessage) {
    if (state.phase !== 'playing') return;
    const p = state.players[state.activeIdx];
    state.phase = 'dying';
    resetMovementKeys();

    MarioAudio.playerDie();
    p.vx = 0;
    p.vy = -10.2; // Salto clásico de muerte estilo Super Mario Bros
    state.deathTimer = 68;
    state.deathNote = reasonMessage;

    spawnSparkles(p.x + PLAYER_W / 2, Math.min(p.y, p.level.groundY - 20), '#ef4444', 18);
    spawnFloatingText(p.x + PLAYER_W / 2, Math.min(p.y - 10, p.level.groundY - 30), '💀 ¡HAS MUERTO!', '#ff4d4f');
  }

  function respawnDeadPlayer(p) {
    p.deaths++;
    if (state.numPlayers === 1) {
      p.lives = Math.max(0, p.lives - 1);
    }
    p.streak = 0;
    p.poweredTimer = 0;
    const lostCoins = Math.min(3, p.coins);
    p.coins -= lostCoins;

    p.x = p.checkpointX;
    p.y = p.level.groundY - PLAYER_H;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.invulnTimer = 140;
    p.cameraX = Math.max(0, Math.min(p.level.width - CANVAS_W, p.x - CANVAS_W * 0.35));
    return lostCoins;
  }

  function endTurnAndSwitchOrFinish(customNote) {
    const p = state.players[state.activeIdx];
    p.turnsPlayed++;
    updateHUD();

    if (state.numPlayers === 1) {
      if (p.finishedAll || p.lives <= 0) {
        showVictoryScreen();
      } else {
        prepareTurnOverlay(customNote || `Te ${p.lives === 1 ? 'queda 1 vida ❤️' : `quedan ${p.lives} vidas ❤️`}`);
      }
      return;
    }

    const otherIdx = 1 - state.activeIdx;
    const otherP = state.players[otherIdx];

    let matchEndsNow = false;
    let overlayNote = customNote || '';

    if (p.finishedAll || otherP.finishedAll || state.lastChanceMode) {
      if (p.finishedAll && !otherP.finishedAll && otherP.turnsPlayed < p.turnsPlayed) {
        state.lastChanceMode = true;
        overlayNote = `⚡ ¡Último turno de réplica para ${otherP.name} para igualar turnos!`;
      } else if (
        state.lastChanceMode ||
        (p.finishedAll && otherP.turnsPlayed >= p.turnsPlayed) ||
        (otherP.finishedAll && p.turnsPlayed >= otherP.turnsPlayed)
      ) {
        matchEndsNow = true;
      }
    }

    if (matchEndsNow) {
      showVictoryScreen();
      return;
    }

    if (!otherP.finishedAll) {
      state.activeIdx = otherIdx;
    }
    prepareTurnOverlay(overlayNote);
  }

  function updateDyingAnimation() {
    const p = state.players[state.activeIdx];
    p.y += p.vy;
    p.vy += 0.48;
    state.deathTimer--;

    if (state.deathTimer <= 0) {
      respawnDeadPlayer(p);
      if (state.numPlayers === 1) {
        const livesMsg = p.lives > 0
          ? `${state.deathNote} · Te ${p.lives === 1 ? 'queda 1 vida ❤️' : `quedan ${p.lives} vidas ❤️`}`
          : `${state.deathNote} · ¡Sin vidas!`;
        endTurnAndSwitchOrFinish(livesMsg);
      } else {
        const otherP = state.players[1 - state.activeIdx];
        endTurnAndSwitchOrFinish(`${state.deathNote} · ¡Ahora juega ${otherP.name}!`);
      }
    }
  }

  // =========================================================================
  // FÍSICAS Y BUCLE DE JUEGO PLATAFORMERO
  // =========================================================================
  function resetMovementKeys() {
    state.keys.left = false;
    state.keys.right = false;
    state.keys.jump = false;
    state.jumpBuffer = 0;
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function getSolidObstacles(level) {
    const solids = [];
    for (const g of level.ground) {
      solids.push({ x: g.x, y: g.y, w: g.w, h: g.h, kind: 'ground' });
    }
    for (const b of level.blocks) {
      solids.push({ x: b.x, y: b.y, w: MarioLevels.TILE, h: MarioLevels.TILE, kind: 'block', ref: b });
    }
    for (const pipe of level.pipes) {
      solids.push({ x: pipe.x, y: pipe.y, w: pipe.w, h: pipe.h, kind: 'pipe' });
    }
    return solids;
  }

  function spawnFloatingText(x, y, text, color = '#ffd700') {
    state.floatingTexts.push({ x, y, text, color, life: 55 });
  }

  function spawnSparkles(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1.8 + Math.random() * 3.2;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        life: 32 + Math.floor(Math.random() * 18)
      });
    }
  }

  function updatePhysics() {
    const p = state.players[state.activeIdx];
    const lvl = p.level;
    const solids = getSolidObstacles(lvl);

    if (p.invulnTimer > 0) p.invulnTimer--;
    if (p.poweredTimer > 0) p.poweredTimer--;

    const maxSpeed = p.poweredTimer > 0 ? 5.1 : 4.3;
    const accel = p.onGround ? 0.55 : 0.36;

    if (state.keys.left) {
      p.vx = Math.max(-maxSpeed, p.vx - accel);
      p.facing = -1;
    } else if (state.keys.right) {
      p.vx = Math.min(maxSpeed, p.vx + accel);
      p.facing = 1;
    } else {
      p.vx *= p.onGround ? 0.78 : 0.91;
      if (Math.abs(p.vx) < 0.08) p.vx = 0;
    }

    if (Math.abs(p.vx) > 0.3 && p.onGround) {
      p.walkPhase += Math.abs(p.vx) * 0.25;
    }

    if (p.onGround) {
      p.coyoteTimer = 8;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer--;
    }

    if (state.jumpBuffer > 0) state.jumpBuffer--;

    if (state.jumpBuffer > 0 && p.coyoteTimer > 0) {
      p.vy = p.poweredTimer > 0 ? -12.3 : -11.6;
      p.onGround = false;
      p.coyoteTimer = 0;
      state.jumpBuffer = 0;
      MarioAudio.jump();
    }

    if (!state.keys.jump && p.vy < -4.5) {
      p.vy *= 0.86;
    }

    p.vy = Math.min(12.5, p.vy + 0.52);

    // Movimiento horizontal
    p.x += p.vx;
    if (p.x < 16) {
      p.x = 16;
      p.vx = 0;
    }

    for (const s of solids) {
      if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, s.x, s.y, s.w, s.h)) {
        if (p.vx > 0) {
          p.x = s.x - PLAYER_W;
        } else if (p.vx < 0) {
          p.x = s.x + s.w;
        }
        p.vx = 0;
      }
    }

    // Movimiento vertical
    p.y += p.vy;
    p.onGround = false;
    let hitQuestionBlock = null;

    for (const s of solids) {
      if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, s.x, s.y, s.w, s.h)) {
        if (p.vy >= 0) {
          p.y = s.y - PLAYER_H;
          p.vy = 0;
          p.onGround = true;
        } else {
          p.y = s.y + s.h;
          p.vy = 1.4;
          if (s.kind === 'block' && s.ref.type === 'question' && !s.ref.used) {
            hitQuestionBlock = s.ref;
          } else if (s.kind === 'block' && s.ref.type === 'brick') {
            spawnSparkles(s.x + 20, s.y + 20, '#d86020', 6);
            MarioAudio.stomp();
          }
        }
      }
    }

    // Cámara suave
    const targetCam = Math.max(0, Math.min(lvl.width - CANVAS_W, p.x - CANVAS_W * 0.35));
    p.cameraX += (targetCam - p.cameraX) * 0.14;

    // Bandera de punto de control intermedio
    if (lvl.checkpointX && !lvl.checkpointReached && p.x + PLAYER_W >= lvl.checkpointX) {
      lvl.checkpointReached = true;
      p.checkpointX = lvl.checkpointX;
      p.score += 50;
      MarioAudio.checkpoint();
      spawnSparkles(lvl.checkpointX, lvl.groundY - 60, '#22c55e', 16);
      spawnFloatingText(lvl.checkpointX, lvl.groundY - 92, '🚩 ¡CONTROL! +50', '#4ade80');
    }

    // Monedas
    for (const coin of lvl.coins) {
      if (coin.collected) continue;
      if (p.poweredTimer > 0) {
        const dx = (p.x + PLAYER_W / 2) - coin.x;
        const dy = (p.y + PLAYER_H / 2) - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 1) {
          coin.x += (dx / dist) * 3.8;
          coin.y += (dy / dist) * 3.8;
        }
      }
      if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, coin.x - 10, coin.y - 10, 22, 22)) {
        coin.collected = true;
        p.coins += 1;
        p.score += 20;
        MarioAudio.coin();
        spawnFloatingText(coin.x, coin.y - 10, '+20', '#ffe066');
        updateHUD();
      }
    }

    // Golpear un bloque ? -> ¡Dispara reto matemático!
    if (hitQuestionBlock) {
      hitQuestionBlock.used = true;
      MarioAudio.blockHit();
      spawnSparkles(hitQuestionBlock.x + 20, hitQuestionBlock.y, '#ffd700', 14);
      triggerMathChallenge('block', { block: hitQuestionBlock });
      return;
    }

    // Enemigos: pisarlos los derrota; chocar con ellos MATA directamente sin pregunta
    for (const enemy of lvl.enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.vx;
      if (enemy.x <= enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.vx);
      } else if (enemy.x + enemy.w >= enemy.maxX) {
        enemy.x = enemy.maxX - enemy.w;
        enemy.vx = -Math.abs(enemy.vx);
      }

      if (rectsOverlap(p.x + 3, p.y + 2, PLAYER_W - 6, PLAYER_H - 2, enemy.x + 2, enemy.y + 4, enemy.w - 4, enemy.h - 4)) {
        const prevBottom = p.y + PLAYER_H - p.vy;
        if (p.vy > 0 && prevBottom <= enemy.y + 15) {
          enemy.alive = false;
          p.vy = -8.6;
          p.score += 100;
          MarioAudio.stomp();
          spawnSparkles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ffb703', 12);
          spawnFloatingText(enemy.x, enemy.y - 8, '+100 ¡PLAF!', '#ffffff');
          updateHUD();
        } else if (p.invulnTimer <= 0) {
          triggerPlatformDeath(`💀 ¡Un enemigo ha derrotado a ${p.name}!`);
          return;
        }
      }
    }

    // Caer por un agujero -> MATA directamente sin pregunta
    if (p.y > lvl.groundY + 68) {
      triggerPlatformDeath(`💀 ¡${p.name} ha caído por un agujero!`);
      return;
    }

    // Llegar al castillo final -> Reto matemático de la bandera
    if (p.x + PLAYER_W >= lvl.goalX - 6) {
      MarioAudio.blockHit();
      triggerMathChallenge('castle', {});
      return;
    }

    updateHUD();
  }

  function updateEffects() {
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 0.9;
      ft.life--;
      if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.18;
      pt.life--;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
  }

  // =========================================================================
  // RETOS MATEMÁTICOS CON CUENTA ATRÁS DE 30s Y MUERTE AL FALLAR
  // =========================================================================
  function stopMathTimer() {
    if (state.mathTimerInterval) {
      clearInterval(state.mathTimerInterval);
      state.mathTimerInterval = null;
    }
  }

  function updateMathTimerUI(secondsLeft) {
    const ceilSec = Math.max(0, Math.ceil(secondsLeft));
    const pct = Math.max(0, Math.min(100, (secondsLeft / MATH_TIME_LIMIT) * 100));

    const pill = els['math-timer-pill'];
    const fill = els['math-timer-fill'];

    pill.textContent = `⏱️ ${ceilSec} s`;
    fill.style.width = `${pct}%`;

    pill.classList.remove('timer-warn', 'timer-danger');
    fill.classList.remove('timer-warn', 'timer-danger');

    if (secondsLeft <= 7) {
      pill.classList.add('timer-danger');
      fill.classList.add('timer-danger');
    } else if (secondsLeft <= 15) {
      pill.classList.add('timer-warn');
      fill.classList.add('timer-warn');
    }
  }

  function startMathTimer() {
    stopMathTimer();
    const deadline = performance.now() + MATH_TIME_LIMIT * 1000;
    let lastBeepSecond = 6;
    updateMathTimerUI(MATH_TIME_LIMIT);

    state.mathTimerInterval = setInterval(() => {
      if (!state.currentChallenge || state.currentChallenge.answered || state.phase !== 'math') {
        stopMathTimer();
        return;
      }

      const remaining = (deadline - performance.now()) / 1000;
      if (remaining <= 0) {
        updateMathTimerUI(0);
        stopMathTimer();
        handleMathAnswer(-1, true);
        return;
      }

      updateMathTimerUI(remaining);
      const secInt = Math.ceil(remaining);
      if (secInt <= 5 && secInt < lastBeepSecond) {
        lastBeepSecond = secInt;
        MarioAudio.tick(secInt <= 3);
      }
    }, 80);
  }

  function triggerMathChallenge(reason, contextData) {
    state.phase = 'math';
    resetMovementKeys();

    const p = state.players[state.activeIdx];
    const tier = computeDifficultyTier(p, reason);
    const question = MarioMath.generateQuestionForPlayer(p, tier);

    state.currentChallenge = {
      reason,
      contextData,
      question,
      answered: false
    };

    const banner = els['math-event-banner'];
    banner.className = 'math-event-banner';
    if (reason === 'block') {
      banner.classList.add('banner-block');
      banner.textContent = '🟨 ¡BLOQUE ? MATEMÁTICO! · Si aciertas en ≤30 s sigues jugando; si fallas, mueres';
    } else {
      banner.classList.add('banner-castle');
      banner.textContent = '🏰 ¡LLAVE DEL CASTILLO FINAL! · ¡Acierta en ≤30 s para conquistar el Mundo (+500 pts)!';
    }

    const ch = MarioSprites.CHARACTERS[p.charId];
    els['math-player-pill'].textContent = `${ch.emoji} ${p.name}`;
    els['math-topic-badge'].textContent = question.badge;
    els['math-question-title'].textContent = question.title;
    els['math-prompt'].innerHTML = question.promptHTML;

    const letters = ['A', 'B', 'C', 'D'];
    els['math-options'].innerHTML = '';
    question.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'math-opt-btn';
      btn.innerHTML = `<span class="opt-key">${letters[idx]}</span><span class="opt-val">${opt.html}</span>`;
      btn.addEventListener('click', () => handleMathAnswer(idx, false));
      els['math-options'].appendChild(btn);
    });

    els['math-feedback'].classList.add('hidden');
    els['math-modal'].classList.remove('hidden');
    startMathTimer();
  }

  function handleMathAnswer(chosenIdx, isTimeout = false) {
    const challenge = state.currentChallenge;
    if (!challenge || challenge.answered) return;
    challenge.answered = true;
    stopMathTimer();

    const isSolo = state.numPlayers === 1;
    const p = state.players[state.activeIdx];
    const otherP = isSolo ? null : state.players[1 - state.activeIdx];
    const { question, reason, contextData } = challenge;
    const isCorrect = !isTimeout && chosenIdx === question.correctIndex;

    p.mathTotal++;

    const optionButtons = els['math-options'].querySelectorAll('.math-opt-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === question.correctIndex) {
        btn.classList.add('opt-correct');
      } else if (!isTimeout && idx === chosenIdx && !isCorrect) {
        btn.classList.add('opt-wrong');
      }
    });

    let outcomeSummary = '';

    if (isCorrect) {
      MarioAudio.correct();
      p.mathCorrect++;
      p.streak++;
      if (p.streak > p.bestStreak) p.bestStreak = p.streak;
      const streakBonus = p.streak >= 2 ? (p.streak - 1) * 30 : 0;

      if (reason === 'block') {
        const gain = 250 + streakBonus;
        p.score += gain;
        p.coins += 5;
        p.poweredTimer = 540;
        spawnSparkles(p.x + PLAYER_W / 2, p.y, '#ffd700', 22);
        outcomeSummary = `🌟 ¡CORRECTO! +${gain} pts, +5 🪙 y Super Poder. ¡Sigues jugando!`;
      } else if (reason === 'castle') {
        MarioAudio.castleWin();
        const gain = 500 + streakBonus;
        p.score += gain;
        p.coins += 5;
        p.level.flagUnlocked = true;
        spawnSparkles(p.level.goalX, p.level.groundY - 140, '#ffd700', 32);

        if (p.worldIndex < state.totalWorlds) {
          p.worldIndex++;
          if (isSolo && p.lives < 5) p.lives++;
          p.level = MarioLevels.cloneLevel(p.worldIndex);
          p.x = 80;
          p.y = p.level.groundY - PLAYER_H;
          p.checkpointX = 80;
          p.cameraX = 0;
          outcomeSummary = `🏰 ¡CASTILLO CONQUISTADO! +${gain} pts${isSolo ? ' y +1 ❤️' : ''} · ¡Avanzas al Mundo 1-${p.worldIndex}!`;
        } else {
          p.finishedAll = true;
          outcomeSummary = `🏆 ¡META FINAL CONQUISTADA! +${gain} pts.`;
        }
      }
    } else {
      if (isTimeout) {
        MarioAudio.timeout();
      } else {
        MarioAudio.playerDie();
      }

      if (reason === 'block' && contextData && contextData.block) {
        contextData.block.used = false;
      }

      const lostCoins = respawnDeadPlayer(p);
      const causeText = isTimeout
        ? `⏰ ¡TIEMPO AGOTADO (30 s)!`
        : `💀 ¡FALLASTE LA OPERACIÓN!`;

      if (isSolo) {
        const lifeTail = p.lives > 0
          ? `Pierdes 1 vida (te ${p.lives === 1 ? 'queda 1 ❤️' : `quedan ${p.lives} ❤️`}).`
          : '¡Te has quedado sin vidas 💔!';
        outcomeSummary = `${causeText} Era ${question.correctText}. Has muerto${lostCoins > 0 ? ` (-${lostCoins} 🪙)` : ''}. ${lifeTail}`;
      } else {
        outcomeSummary = `${causeText} Era ${question.correctText}. Has muerto${lostCoins > 0 ? ` (-${lostCoins} 🪙)` : ''} y pierdes el turno.`;
      }
    }

    const keepPlaying = isCorrect && !p.finishedAll;
    challenge.keepPlaying = keepPlaying;
    challenge.isCorrect = isCorrect;

    updateHUD();

    const fb = els['math-feedback'];
    fb.className = 'math-feedback ' + (isCorrect ? 'fb-correct' : 'fb-wrong');
    els['math-result-title'].textContent = outcomeSummary;
    els['math-explanation'].textContent = `📘 Explicación: ${question.explanation}`;

    if (keepPlaying) {
      els['btn-next-turn'].textContent = '▶ ¡Seguir jugando! (Espacio / Enter)';
    } else if (isSolo) {
      if (p.finishedAll) {
        els['btn-next-turn'].textContent = '🏆 ¡Ver Victoria Final! (Espacio / Enter)';
      } else if (p.lives <= 0) {
        els['btn-next-turn'].textContent = '🏁 Ver Resumen Final (Espacio / Enter)';
      } else {
        els['btn-next-turn'].textContent = '🔄 Reaparecer en control ▶ (Espacio / Enter)';
      }
    } else if (p.finishedAll && (otherP.finishedAll || state.lastChanceMode || otherP.turnsPlayed >= p.turnsPlayed + 1)) {
      els['btn-next-turn'].textContent = '🏆 ¡Ver Podio y Campeón! (Espacio / Enter)';
    } else {
      els['btn-next-turn'].textContent = `💀 Pasar el turno a ${otherP.name} ▶ (Espacio / Enter)`;
    }
    fb.classList.remove('hidden');
  }

  function advanceAfterMathModal() {
    const challenge = state.currentChallenge;
    if (!challenge || !challenge.answered) return;

    stopMathTimer();
    els['math-modal'].classList.add('hidden');

    const { keepPlaying, isCorrect } = challenge;
    state.currentChallenge = null;

    if (keepPlaying) {
      const p = state.players[state.activeIdx];
      p.invulnTimer = Math.max(p.invulnTimer, 95);
      resetMovementKeys();
      state.phase = 'playing';
      return;
    }

    const p = state.players[state.activeIdx];
    if (state.numPlayers === 1) {
      const soloNote = p.lives > 0
        ? `💀 Moriste en el reto · Te ${p.lives === 1 ? 'queda 1 vida ❤️' : `quedan ${p.lives} vidas ❤️`}`
        : '💔 ¡Sin vidas!';
      endTurnAndSwitchOrFinish(soloNote);
      return;
    }

    const otherP = state.players[1 - state.activeIdx];
    const note = isCorrect
      ? `🏆 ¡${p.name} ha llegado a la meta! Turno de ${otherP.name}.`
      : `💀 ${p.name} murió en el reto matemático · ¡Turno de ${otherP.name}!`;
    endTurnAndSwitchOrFinish(note);
  }

  // =========================================================================
  // PANTALLA DE PODIO Y ESTADÍSTICAS (1 O 2 JUGADORES)
  // =========================================================================
  function showVictoryScreen() {
    stopMathTimer();
    state.phase = 'victory';
    MarioAudio.stopMusic();

    els['game-screen'].classList.add('hidden');
    els['victory-screen'].classList.remove('hidden');

    if (state.numPlayers === 1) {
      const p0 = state.players[0];
      if (p0.finishedAll) {
        MarioAudio.castleWin();
        els['victory-headline'].textContent = `🏆 ¡VICTORIA TOTAL, ${p0.name.toUpperCase()}!`;
        els['victory-sub'].textContent = `¡Has conquistado todos los mundos con ${p0.score} puntos!`;
      } else {
        MarioAudio.playerDie();
        els['victory-headline'].textContent = `💀 ¡FIN DE LA PARTIDA, ${p0.name.toUpperCase()}!`;
        els['victory-sub'].textContent = `Llegaste hasta ${p0.level.name} sumando ${p0.score} puntos. ¡Vuelve a intentarlo!`;
      }
    } else {
      MarioAudio.castleWin();
      const [p0, p1] = state.players;
      let winner = null;
      if (p0.score > p1.score) winner = p0;
      else if (p1.score > p0.score) winner = p1;

      if (winner) {
        els['victory-headline'].textContent = `🏆 ¡${winner.name} gana la Copa Mario Mates!`;
        els['victory-sub'].textContent = `¡Partidazo increíble entre ${p0.name} y ${p1.name}!`;
      } else {
        els['victory-headline'].textContent = '🏆 ¡EMPATE ÉPICO EN EL REINO CHAMPIÑÓN!';
        els['victory-sub'].textContent = `¡${p0.name} y ${p1.name} han conseguido exactamente la misma puntuación!`;
      }
    }

    els['victory-cards'].innerHTML = '';
    const maxScore = Math.max(...state.players.map(pl => pl.score));
    state.players.forEach(p => {
      const acc = p.mathTotal > 0 ? Math.round((p.mathCorrect / p.mathTotal) * 100) : 100;
      const isTopScore = state.numPlayers === 1 ? p.finishedAll : p.score >= maxScore;
      const card = document.createElement('div');
      card.className = 'victory-card' + (isTopScore ? ' winner-glow' : '');

      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 72;
      badgeCanvas.height = 72;
      MarioSprites.renderAvatarBadge(badgeCanvas, p.charId);

      const medal = p.finishedAll
        ? '🏰 Conquistador del Castillo'
        : acc >= 80
          ? '🧠 Súper Mente Matemática'
          : '⭐ Héroe Champiñón';

      const info = document.createElement('div');
      info.className = 'victory-info';
      info.innerHTML = `
        <h3>${p.name}</h3>
        <div class="v-medal">${medal}</div>
        <ul class="v-stats">
          <li><strong>Puntuación total:</strong> <span>${p.score} pts</span></li>
          <li><strong>Aciertos de mates:</strong> <span>${p.mathCorrect} de ${p.mathTotal} (${acc}%)</span></li>
          <li><strong>Mejor racha seguida:</strong> <span>🔥 ${p.bestStreak}</span></li>
          <li><strong>Monedas finales:</strong> <span>🪙 ${p.coins}</span></li>
        </ul>
      `;

      card.appendChild(badgeCanvas);
      card.appendChild(info);
      els['victory-cards'].appendChild(card);
    });
  }

  // =========================================================================
  // RENDERIZADO DEL MUNDO MARIO EN CANVAS
  // =========================================================================
  function drawBackground(ctx, lvl, camX) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, lvl.skyTop);
    grad.addColorStop(1, lvl.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (lvl.theme !== 'underground') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      for (const cl of state.clouds) {
        const sx = cl.x - camX * 0.35;
        if (sx < -140 || sx > CANVAS_W + 140) continue;
        ctx.beginPath();
        ctx.arc(sx, cl.y, 20 * cl.s, 0, Math.PI * 2);
        ctx.arc(sx + 22 * cl.s, cl.y - 8 * cl.s, 25 * cl.s, 0, Math.PI * 2);
        ctx.arc(sx + 46 * cl.s, cl.y, 19 * cl.s, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(110, 185, 255, 0.16)';
      for (let i = 0; i < 14; i++) {
        const cx = ((i * 230) - camX * 0.4) % (CANVAS_W + 220);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 26, 68);
        ctx.lineTo(cx + 52, 0);
        ctx.closePath();
        ctx.fill();
      }
    }

    for (const h of state.hills) {
      const hx = h.x - camX * 0.55;
      if (hx + h.w < -40 || hx > CANVAS_W + 40) continue;
      ctx.fillStyle = lvl.theme === 'underground' ? '#162f59' : lvl.theme === 'sky' ? '#ff9a76' : '#2d9c3c';
      ctx.beginPath();
      ctx.moveTo(hx, lvl.groundY);
      ctx.quadraticCurveTo(hx + h.w / 2, lvl.groundY - h.h * 1.6, hx + h.w, lvl.groundY);
      ctx.closePath();
      ctx.fill();
    }
  }

  function renderGame(timestamp) {
    const canvas = els['game-canvas'];
    if (!canvas || state.players.length === 0) return;
    const ctx = canvas.getContext('2d');

    const p = state.players[state.activeIdx];
    const rival = state.numPlayers === 2 ? state.players[1 - state.activeIdx] : null;
    const lvl = p.level;
    const camX = p.cameraX;

    drawBackground(ctx, lvl, camX);

    ctx.save();
    ctx.translate(-camX, 0);

    // Suelo
    for (const g of lvl.ground) {
      if (g.x + g.w < camX - 40 || g.x > camX + CANVAS_W + 40) continue;
      MarioSprites.drawGroundTile(ctx, g.x, g.y, g.w, lvl.theme);
      ctx.fillStyle = lvl.theme === 'underground' ? '#0d254c' : lvl.theme === 'sky' ? '#ce93d8' : '#8a3c0e';
      ctx.fillRect(g.x, g.y + g.w, g.w, 40);
    }

    // Tuberías
    for (const pipe of lvl.pipes) {
      if (pipe.x + pipe.w < camX - 50 || pipe.x > camX + CANVAS_W + 50) continue;
      MarioSprites.drawPipe(ctx, pipe.x, pipe.y, pipe.w, pipe.h);
    }

    // Bandera de punto de control intermedio
    if (lvl.checkpointX) {
      MarioSprites.drawCheckpointFlag(ctx, lvl.checkpointX, lvl.groundY, !!lvl.checkpointReached);
    }

    // Bloques
    for (const b of lvl.blocks) {
      if (b.x + 40 < camX - 40 || b.x > camX + CANVAS_W + 40) continue;
      if (b.type === 'question') {
        MarioSprites.drawQuestionBlock(ctx, b.x, b.y, MarioLevels.TILE, !!b.used, timestamp);
      } else {
        MarioSprites.drawBrick(ctx, b.x, b.y, MarioLevels.TILE);
      }
    }

    // Monedas
    for (const coin of lvl.coins) {
      if (coin.collected) continue;
      if (coin.x < camX - 30 || coin.x > camX + CANVAS_W + 30) continue;
      const scaleX = 0.45 + Math.abs(Math.sin(timestamp * 0.006)) * 0.55;
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.scale(scaleX, 1);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c79100';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Castillo y bandera final
    MarioSprites.drawCastleAndFlag(ctx, lvl.goalX, lvl.groundY, !!lvl.flagUnlocked);

    // Fantasma de referencia del hermano (solo en modo 2 jugadores)
    if (rival && rival.worldIndex === p.worldIndex && !rival.finishedAll) {
      MarioSprites.drawCharacter(ctx, rival.charId, rival.x, rival.y, PLAYER_W, PLAYER_H, {
        facing: rival.facing,
        alpha: 0.38
      });
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👻 ${rival.name}`, rival.x + PLAYER_W / 2, rival.y - 8);
    }

    // Enemigos
    for (const enemy of lvl.enemies) {
      if (!enemy.alive) continue;
      if (enemy.x + enemy.w < camX - 40 || enemy.x > camX + CANVAS_W + 40) continue;
      MarioSprites.drawEnemy(ctx, enemy, timestamp);
    }

    // Jugador activo
    const blinkHide = state.phase !== 'dying' && p.invulnTimer > 0 && Math.floor(p.invulnTimer / 5) % 2 === 1;
    MarioSprites.drawCharacter(ctx, p.charId, p.x, p.y, PLAYER_W, PLAYER_H, {
      facing: p.facing,
      walkPhase: p.walkPhase,
      jumping: !p.onGround || state.phase === 'dying',
      powered: p.poweredTimer > 0,
      alpha: blinkHide ? 0.48 : 1
    });

    // Partículas y textos flotantes
    for (const pt of state.particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const ft of state.floatingTexts) {
      ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  function gameLoop(timestamp) {
    if (state.phase === 'playing') {
      updatePhysics();
      updateEffects();
    } else if (state.phase === 'dying') {
      updateDyingAnimation();
      updateEffects();
    } else if (state.phase === 'turnReady' || state.phase === 'math') {
      updateEffects();
    }

    if (
      state.phase === 'playing' ||
      state.phase === 'dying' ||
      state.phase === 'turnReady' ||
      state.phase === 'math'
    ) {
      renderGame(timestamp);
    }

    requestAnimationFrame(gameLoop);
  }

  // =========================================================================
  // CONTROLES DE TECLADO Y PANTALLA TÁCTIL
  // =========================================================================
  function bindInputs() {
    window.addEventListener('keydown', e => {
      if (state.phase === 'turnReady') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight' || e.code === 'ArrowUp') {
          e.preventDefault();
          beginActiveTurn();
        }
        return;
      }

      if (state.phase === 'math' && state.currentChallenge) {
        if (!state.currentChallenge.answered) {
          const map = {
            Digit1: 0, Numpad1: 0, KeyA: 0,
            Digit2: 1, Numpad2: 1, KeyB: 1,
            Digit3: 2, Numpad3: 2, KeyC: 2,
            Digit4: 3, Numpad4: 3, KeyD: 3
          };
          if (Object.prototype.hasOwnProperty.call(map, e.code)) {
            e.preventDefault();
            handleMathAnswer(map[e.code], false);
          }
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          advanceAfterMathModal();
        }
        return;
      }

      if (state.phase !== 'playing') return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        state.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        state.keys.right = true;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!state.keys.jump) {
          state.jumpBuffer = 8;
        }
        state.keys.jump = true;
      }
    });

    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        state.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        state.keys.right = false;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        state.keys.jump = false;
      }
    });

    const bindHoldButton = (btn, keyName, isJump) => {
      if (!btn) return;
      const press = ev => {
        ev.preventDefault();
        if (state.phase === 'turnReady') {
          beginActiveTurn();
          return;
        }
        if (state.phase !== 'playing') return;
        if (isJump && !state.keys.jump) state.jumpBuffer = 8;
        state.keys[keyName] = true;
      };
      const release = ev => {
        ev.preventDefault();
        state.keys[keyName] = false;
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
    };

    bindHoldButton(els['btn-left'], 'left', false);
    bindHoldButton(els['btn-right'], 'right', false);
    bindHoldButton(els['btn-jump'], 'jump', true);

    els['btn-mode-1p'].addEventListener('click', () => {
      setPlayerCountMode(1);
      MarioAudio.coin();
    });
    els['btn-mode-2p'].addEventListener('click', () => {
      setPlayerCountMode(2);
      MarioAudio.coin();
    });

    els['btn-start-game'].addEventListener('click', () => startMatch(false));
    els['btn-begin-turn'].addEventListener('click', beginActiveTurn);
    els['btn-next-turn'].addEventListener('click', advanceAfterMathModal);

    els['btn-play-again'].addEventListener('click', () => startMatch(true));
    els['btn-back-setup'].addEventListener('click', () => {
      stopMathTimer();
      MarioAudio.stopMusic();
      state.phase = 'setup';
      els['victory-screen'].classList.add('hidden');
      els['game-screen'].classList.add('hidden');
      els['setup-screen'].classList.remove('hidden');
    });

    els['btn-restart'].addEventListener('click', () => {
      stopMathTimer();
      MarioAudio.stopMusic();
      state.phase = 'setup';
      els['math-modal'].classList.add('hidden');
      els['game-screen'].classList.add('hidden');
      els['setup-screen'].classList.remove('hidden');
    });

    els['btn-mute'].addEventListener('click', () => {
      const muted = MarioAudio.toggleMute();
      els['btn-mute'].textContent = muted ? '🔇 Silencio' : '🔊 Sonido';
      if (!muted && (state.phase === 'playing' || state.phase === 'turnReady' || state.phase === 'math')) {
        MarioAudio.startMusic();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    renderCharacterPickers();
    bindAgeSwitchers();
    bindInputs();
    requestAnimationFrame(gameLoop);
  });
})();
