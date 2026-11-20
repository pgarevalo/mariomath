(function (root) {
  'use strict';

  const CHARACTERS = {
    mario: {
      id: 'mario',
      name: 'Mario',
      emoji: '🍄',
      hat: '#e52521',
      shirt: '#e52521',
      overalls: '#1958d1',
      skin: '#ffcc99',
      shoes: '#6b3710',
      badge: 'M',
      accent: '#ffd700'
    },
    luigi: {
      id: 'luigi',
      name: 'Luigi',
      emoji: '💚',
      hat: '#2eb82e',
      shirt: '#2eb82e',
      overalls: '#183f9e',
      skin: '#ffcc99',
      shoes: '#5b3111',
      badge: 'L',
      accent: '#7dff7d'
    },
    yoshi: {
      id: 'yoshi',
      name: 'Yoshi',
      emoji: '🦖',
      hat: '#58d828',
      shirt: '#ffffff',
      overalls: '#58d828',
      skin: '#58d828',
      shoes: '#ff7018',
      badge: 'Y',
      accent: '#e52521',
      isDino: true
    },
    peach: {
      id: 'peach',
      name: 'Peach',
      emoji: '👑',
      hat: '#ffd700',
      shirt: '#ff7eb9',
      overalls: '#ff4da6',
      skin: '#ffe0bd',
      shoes: '#d92672',
      badge: 'P',
      accent: '#00c8ff',
      isRoyal: true
    },
    toad: {
      id: 'toad',
      name: 'Toad',
      emoji: '🍄',
      hat: '#ffffff',
      shirt: '#2055d8',
      overalls: '#ffffff',
      skin: '#ffd4a3',
      shoes: '#703b14',
      badge: 'T',
      accent: '#e52521',
      isMushroomHead: true
    },
    wario: {
      id: 'wario',
      name: 'Wario',
      emoji: '⚡',
      hat: '#ffd800',
      shirt: '#ffd800',
      overalls: '#7b1fa2',
      skin: '#ffca99',
      shoes: '#2b9e2b',
      badge: 'W',
      accent: '#ffd800'
    }
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCharacter(ctx, charId, x, y, w, h, opts = {}) {
    const ch = CHARACTERS[charId] || CHARACTERS.mario;
    const facing = opts.facing || 1;
    const walkPhase = opts.walkPhase || 0;
    const jumping = !!opts.jumping;
    const powered = !!opts.powered;
    const alpha = typeof opts.alpha === 'number' ? opts.alpha : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + w / 2, y + h / 2);
    if (facing < 0) ctx.scale(-1, 1);

    // Aura dorada si tiene superpoder matemático activo
    if (powered) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 224, 51, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) * 0.68, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const legSwing = jumping ? 5 : Math.sin(walkPhase * 0.35) * 4;

    if (ch.isDino) {
      // YOSHI adorable
      // Cola y montura roja
      ctx.fillStyle = ch.skin;
      ctx.beginPath();
      ctx.moveTo(-w * 0.25, h * 0.12);
      ctx.lineTo(-w * 0.52, h * 0.02);
      ctx.lineTo(-w * 0.28, h * 0.28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e52521';
      ctx.beginPath();
      ctx.arc(-w * 0.22, h * 0.02, w * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo verde y barriguita blanca
      ctx.fillStyle = ch.skin;
      roundRect(ctx, -w * 0.26, -h * 0.08, w * 0.46, h * 0.42, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, -w * 0.06, -h * 0.02, w * 0.24, h * 0.32, 6);
      ctx.fill();

      // Cabeza y gran hocico redondeado
      ctx.fillStyle = ch.skin;
      ctx.beginPath();
      ctx.arc(-w * 0.02, -h * 0.22, w * 0.24, 0, Math.PI * 2);
      ctx.arc(w * 0.24, -h * 0.18, w * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Crestas naranjas
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.arc(-w * 0.24, -h * 0.30, 4, 0, Math.PI * 2);
      ctx.arc(-w * 0.28, -h * 0.16, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ojos blancos grandes y pupila
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(w * 0.03, -h * 0.34, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(w * 0.05, -h * 0.34, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Botas naranjas
      ctx.fillStyle = ch.shoes;
      roundRect(ctx, -w * 0.22 - legSwing * 0.5, h * 0.30, 12, 9, 4);
      ctx.fill();
      roundRect(ctx, w * 0.04 + legSwing * 0.5, h * 0.30, 12, 9, 4);
      ctx.fill();
    } else {
      // Piernas / Zapatos
      ctx.fillStyle = ch.shoes;
      roundRect(ctx, -w * 0.32 - legSwing * 0.5, h * 0.30, 12, 9, 4);
      ctx.fill();
      roundRect(ctx, w * 0.04 + legSwing * 0.5, h * 0.30, 12, 9, 4);
      ctx.fill();

      // Cuerpo / Peto o vestido
      if (ch.isRoyal) {
        // Vestido de Peach + cabello rubio
        ctx.fillStyle = '#ffd54f';
        roundRect(ctx, -w * 0.36, -h * 0.24, w * 0.35, h * 0.34, 6);
        ctx.fill();

        ctx.fillStyle = ch.overalls;
        ctx.beginPath();
        ctx.moveTo(-w * 0.24, -h * 0.04);
        ctx.lineTo(w * 0.24, -h * 0.04);
        ctx.lineTo(w * 0.36, h * 0.34);
        ctx.lineTo(-w * 0.36, h * 0.34);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = ch.shirt;
        roundRect(ctx, -w * 0.22, -h * 0.08, w * 0.44, h * 0.22, 6);
        ctx.fill();
      } else {
        // Camiseta y peto clásico
        ctx.fillStyle = ch.shirt;
        roundRect(ctx, -w * 0.30, -h * 0.06, w * 0.60, h * 0.28, 6);
        ctx.fill();

        ctx.fillStyle = ch.overalls;
        roundRect(ctx, -w * 0.22, h * 0.02, w * 0.44, h * 0.30, 5);
        ctx.fill();

        // Botones amarillos del peto
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-w * 0.08, h * 0.10, 2.5, 0, Math.PI * 2);
        ctx.arc(w * 0.10, h * 0.10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cabeza
      ctx.fillStyle = ch.skin;
      ctx.beginPath();
      ctx.arc(0, -h * 0.20, w * 0.26, 0, Math.PI * 2);
      ctx.fill();

      // Nariz y ojos
      ctx.fillStyle = ch.skin;
      ctx.beginPath();
      ctx.arc(w * 0.22, -h * 0.18, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(w * 0.10, -h * 0.24, 2.3, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bigote para Mario, Luigi y Wario
      if (!ch.isRoyal && !ch.isMushroomHead) {
        ctx.fillStyle = '#3e1f0d';
        roundRect(ctx, w * 0.04, -h * 0.14, 12, 4, 2);
        ctx.fill();
      }

      // Sombrero / Corona / Gorro champiñón
      if (ch.isMushroomHead) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.36, w * 0.40, h * 0.20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e52521';
        ctx.beginPath();
        ctx.arc(-w * 0.18, -h * 0.37, 5, 0, Math.PI * 2);
        ctx.arc(w * 0.16, -h * 0.37, 5, 0, Math.PI * 2);
        ctx.arc(0, -h * 0.44, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (ch.isRoyal) {
        // Corona dorada de Peach
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-10, -h * 0.38);
        ctx.lineTo(-10, -h * 0.50);
        ctx.lineTo(-4, -h * 0.43);
        ctx.lineTo(0, -h * 0.52);
        ctx.lineTo(4, -h * 0.43);
        ctx.lineTo(10, -h * 0.50);
        ctx.lineTo(10, -h * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#00b0ff';
        ctx.beginPath();
        ctx.arc(0, -h * 0.43, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Gorra con visera
        ctx.fillStyle = ch.hat;
        ctx.beginPath();
        ctx.arc(0, -h * 0.31, w * 0.27, Math.PI, 0);
        ctx.fill();
        roundRect(ctx, -w * 0.26, -h * 0.34, w * 0.64, 6, 3);
        ctx.fill();

        // Insignia blanca
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w * 0.05, -h * 0.38, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawEnemy(ctx, enemy, time) {
    const { x, y, w, h, type, vx } = enemy;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    const step = Math.sin(time * 0.012) * 3;

    if (type === 'koopa') {
      // Koopa Troopa (tortuga verde)
      if (vx > 0) ctx.scale(-1, 1);
      // Caparazón verde
      ctx.fillStyle = '#26a63a';
      ctx.beginPath();
      ctx.ellipse(2, 2, w * 0.36, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cabeza amarilla
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(-w * 0.28, -h * 0.18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-w * 0.33, -h * 0.21, 2, 0, Math.PI * 2);
      ctx.fill();

      // Zapatillas
      ctx.fillStyle = '#ff9800';
      roundRect(ctx, -10 + step, h * 0.28, 9, 6, 3);
      ctx.fill();
      roundRect(ctx, 2 - step, h * 0.28, 9, 6, 3);
      ctx.fill();
    } else {
      // Goomba clásico
      // Pies negros caminando
      ctx.fillStyle = '#22140b';
      roundRect(ctx, -12 + step, h * 0.26, 10, 7, 3);
      ctx.fill();
      roundRect(ctx, 2 - step, h * 0.26, 10, 7, 3);
      ctx.fill();

      // Tallo crema
      ctx.fillStyle = '#ffe0b2';
      roundRect(ctx, -8, h * 0.04, 16, 10, 4);
      ctx.fill();

      // Cabeza marrón champiñón
      ctx.fillStyle = '#a84b18';
      ctx.beginPath();
      ctx.moveTo(-w * 0.46, h * 0.08);
      ctx.quadraticCurveTo(0, -h * 0.72, w * 0.46, h * 0.08);
      ctx.closePath();
      ctx.fill();

      // Ojos enfadados simpáticos
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-5, -3, 3.2, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -3, 3.2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawQuestionBlock(ctx, x, y, size, used, time) {
    ctx.save();
    if (used) {
      ctx.fillStyle = '#8d6e63';
      roundRect(ctx, x, y, size, size, 5);
      ctx.fill();
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      const pulse = Math.sin(time * 0.008) * 1.5;
      ctx.fillStyle = '#ffb300';
      roundRect(ctx, x, y - pulse, size, size, 5);
      ctx.fill();
      ctx.strokeStyle = '#b26a00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Brillo interior
      ctx.fillStyle = '#ffe082';
      roundRect(ctx, x + 3, y + 3 - pulse, size - 6, 6, 2);
      ctx.fill();

      // Remaches en las esquinas
      ctx.fillStyle = '#795548';
      const r = 2;
      ctx.fillRect(x + 4, y + 4 - pulse, r, r);
      ctx.fillRect(x + size - 6, y + 4 - pulse, r, r);
      ctx.fillRect(x + 4, y + size - 6 - pulse, r, r);
      ctx.fillRect(x + size - 6, y + size - 6 - pulse, r, r);

      // Signo ?
      ctx.fillStyle = '#5d2906';
      ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + size / 2 + 1, y + size / 2 + 2 - pulse);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('?', x + size / 2, y + size / 2 + 1 - pulse);
    }
    ctx.restore();
  }

  function drawBrick(ctx, x, y, size) {
    ctx.save();
    ctx.fillStyle = '#c84c0c';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#5c1f02';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size, y + size / 2);
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.moveTo(x + size / 4, y + size / 2);
    ctx.lineTo(x + size / 4, y + size);
    ctx.moveTo(x + (size * 3) / 4, y + size / 2);
    ctx.lineTo(x + (size * 3) / 4, y + size);
    ctx.stroke();
    ctx.restore();
  }

  function drawGroundTile(ctx, x, y, size, theme) {
    ctx.save();
    if (theme === 'underground') {
      ctx.fillStyle = '#1d4f91';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#4f86d6';
      ctx.fillRect(x + 2, y + 2, size - 4, 8);
      ctx.strokeStyle = '#0d254c';
    } else if (theme === 'sky') {
      ctx.fillStyle = '#f3e5f5';
      roundRect(ctx, x, y, size, size, 6);
      ctx.fill();
      ctx.fillStyle = '#ffb74d';
      ctx.fillRect(x + 2, y + 2, size - 4, 8);
      ctx.strokeStyle = '#9c27b0';
    } else {
      ctx.fillStyle = '#b85418';
      ctx.fillRect(x, y, size, size);
      // Césped verde arriba
      ctx.fillStyle = '#38b000';
      ctx.fillRect(x, y, size, 10);
      ctx.fillStyle = '#70e000';
      ctx.fillRect(x + 2, y + 2, size - 4, 4);
      ctx.strokeStyle = '#6b2c06';
    }
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    ctx.restore();
  }

  function drawPipe(ctx, x, y, w, h) {
    ctx.save();
    // Cuerpo de la tubería
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#1e8e26');
    grad.addColorStop(0.32, '#76ff4d');
    grad.addColorStop(0.75, '#25a52e');
    grad.addColorStop(1, '#115916');

    ctx.fillStyle = grad;
    ctx.fillRect(x + 4, y + 22, w - 8, h - 22);
    ctx.strokeStyle = '#0c3d10';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 4, y + 22, w - 8, h - 22);

    // Boca superior de la tubería
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, 24, 4);
    ctx.fill();
    ctx.strokeRect(x, y, w, 24);
    ctx.restore();
  }

  function drawCastleAndFlag(ctx, goalX, groundY, flagUnlocked) {
    ctx.save();
    // Mástil de bandera
    const poleX = goalX;
    const poleTopY = groundY - 220;
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(poleX - 3, poleTopY, 6, 220);

    // Bola dorada arriba
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(poleX, poleTopY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9e7b00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bandera (baja cuando se resuelve el reto final)
    const flagY = flagUnlocked ? groundY - 52 : poleTopY + 14;
    ctx.fillStyle = flagUnlocked ? '#ffd700' : '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(poleX - 3, flagY);
    ctx.lineTo(poleX - 54, flagY + 18);
    ctx.lineTo(poleX - 3, flagY + 36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('★', poleX - 34, flagY + 23);

    // Base del mástil
    ctx.fillStyle = '#9e4710';
    ctx.fillRect(poleX - 16, groundY - 24, 32, 24);

    // Castillo estilo Super Mario a la derecha
    const cx = goalX + 95;
    const cw = 136;
    const ch = 128;
    const cy = groundY - ch;

    ctx.fillStyle = '#c45119';
    ctx.fillRect(cx, cy + 36, cw, ch - 36);
    ctx.strokeStyle = '#6d2606';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy + 36, cw, ch - 36);

    // Torreón superior
    ctx.fillStyle = '#b34410';
    ctx.fillRect(cx + 24, cy, cw - 48, 40);
    ctx.strokeRect(cx + 24, cy, cw - 48, 40);

    // Almenas
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#c45119';
      ctx.fillRect(cx + i * 28, cy + 24, 20, 14);
    }
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#c45119';
      ctx.fillRect(cx + 24 + i * 32, cy - 12, 20, 14);
    }

    // Puerta arqueada oscura (con candado matemático si aún está cerrada)
    ctx.fillStyle = '#1b110c';
    ctx.beginPath();
    ctx.arc(cx + cw / 2, groundY - 34, 22, Math.PI, 0);
    ctx.lineTo(cx + cw / 2 + 22, groundY);
    ctx.lineTo(cx + cw / 2 - 22, groundY);
    ctx.closePath();
    ctx.fill();

    if (!flagUnlocked) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx + cw / 2, groundY - 16);
    }
    ctx.restore();
  }

  function drawCheckpointFlag(ctx, x, groundY, unlocked) {
    ctx.save();
    const poleH = 86;
    const topY = groundY - poleH;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 2, topY, 4, poleH);

    ctx.fillStyle = unlocked ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x + 2, topY + 6);
    ctx.lineTo(x + 34, topY + 17);
    ctx.lineTo(x + 2, topY + 28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, topY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderAvatarBadge(canvas, charId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter(ctx, charId, 8, 6, canvas.width - 16, canvas.height - 10, {
      facing: 1,
      walkPhase: 0
    });
  }

  root.MarioSprites = {
    CHARACTERS,
    drawCharacter,
    drawEnemy,
    drawQuestionBlock,
    drawBrick,
    drawGroundTile,
    drawPipe,
    drawCastleAndFlag,
    drawCheckpointFlag,
    renderAvatarBadge
  };
})(typeof self !== 'undefined' ? self : this);
