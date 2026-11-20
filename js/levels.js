(function (root) {
  'use strict';

  const TILE = 40;
  const GROUND_Y = 440; // Canvas de 960 x 520

  function buildLevel1() {
    // Mundo 1-1: Pradera Champiñón (amigable para 6 y 12 años)
    const lengthTiles = 72; // 2880 px
    const pits = [
      [22, 23],
      [46, 47]
    ];

    const isPit = t => pits.some(([a, b]) => t >= a && t <= b);

    const ground = [];
    for (let t = 0; t < lengthTiles; t++) {
      if (!isPit(t)) {
        ground.push({ x: t * TILE, y: GROUND_Y, w: TILE, h: 80 });
      }
    }

    const blocks = [
      // Primer grupo de bienvenida
      { x: 7 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 10 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 11 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 12 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 13 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      // Escalón sobre el primer foso (ayuda al peque de 6 años)
      { x: 21 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 24 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },

      // Zona media con bloques ? jugosos
      { x: 28 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 33 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 34 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 35 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 35 * TILE, y: GROUND_Y - 6 * TILE, type: 'question' },

      // Zona antes del segundo foso y recta final
      { x: 42 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 51 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 52 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 53 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 54 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },

      // Escalera clásica hacia la bandera
      { x: 59 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 60 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 60 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 61 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 61 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 61 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' }
    ];

    const pipes = [
      { x: 16 * TILE, y: GROUND_Y - 68, w: 64, h: 68 },
      { x: 38 * TILE, y: GROUND_Y - 84, w: 64, h: 84 },
      { x: 49 * TILE, y: GROUND_Y - 64, w: 64, h: 64 }
    ];

    const coins = [];
    const addCoinArc = (startTile, count, heightTiles) => {
      for (let i = 0; i < count; i++) {
        coins.push({
          x: (startTile + i) * TILE + 12,
          y: GROUND_Y - heightTiles * TILE - (i === Math.floor(count / 2) ? 18 : 0),
          collected: false
        });
      }
    };
    addCoinArc(5, 3, 1.5);
    addCoinArc(18, 3, 2.5);
    addCoinArc(22, 2, 3.2);
    addCoinArc(30, 3, 1.5);
    addCoinArc(45, 3, 3.2);
    addCoinArc(55, 3, 1.5);

    const enemies = [
      { x: 14 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.1, minX: 8 * TILE, maxX: 15.5 * TILE, type: 'goomba', alive: true },
      { x: 29 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: 1.2, minX: 25 * TILE, maxX: 35.5 * TILE, type: 'goomba', alive: true },
      { x: 43 * TILE, y: GROUND_Y - 38, w: 34, h: 38, vx: -1.3, minX: 41 * TILE, maxX: 45 * TILE, type: 'koopa', alive: true },
      { x: 56 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.2, minX: 51 * TILE, maxX: 58 * TILE, type: 'goomba', alive: true }
    ];

    return {
      id: 1,
      name: 'Mundo 1-1 · Pradera Champiñón',
      theme: 'overworld',
      skyTop: '#5c94fc',
      skyBottom: '#9ec5ff',
      groundY: GROUND_Y,
      checkpointX: 36.2 * TILE,
      checkpointReached: false,
      goalX: 65 * TILE,
      width: lengthTiles * TILE,
      ground,
      blocks,
      pipes,
      coins,
      enemies
    };
  }

  function buildLevel2() {
    // Mundo 1-2: Cuevas de Cristal Subterráneas
    const lengthTiles = 74;
    const pits = [
      [19, 20],
      [39, 40],
      [54, 55]
    ];
    const isPit = t => pits.some(([a, b]) => t >= a && t <= b);

    const ground = [];
    for (let t = 0; t < lengthTiles; t++) {
      if (!isPit(t)) {
        ground.push({ x: t * TILE, y: GROUND_Y, w: TILE, h: 80 });
      }
    }

    const blocks = [
      { x: 6 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 7 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 8 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      // Plataformas elevadas subterráneas
      { x: 14 * TILE, y: GROUND_Y - 2.5 * TILE, type: 'brick' },
      { x: 15 * TILE, y: GROUND_Y - 2.5 * TILE, type: 'question' },
      { x: 16 * TILE, y: GROUND_Y - 2.5 * TILE, type: 'brick' },

      { x: 24 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 25 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      { x: 31 * TILE, y: GROUND_Y - 2.5 * TILE, type: 'brick' },
      { x: 32 * TILE, y: GROUND_Y - 2.5 * TILE, type: 'brick' },
      { x: 33 * TILE, y: GROUND_Y - 5.2 * TILE, type: 'question' },

      { x: 43 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 44 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 45 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },

      { x: 50 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 58 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      // Escalera final
      { x: 61 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 62 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 62 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 63 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 63 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 63 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' }
    ];

    const pipes = [
      { x: 11 * TILE, y: GROUND_Y - 64, w: 64, h: 64 },
      { x: 28 * TILE, y: GROUND_Y - 80, w: 64, h: 80 },
      { x: 47 * TILE, y: GROUND_Y - 68, w: 64, h: 68 }
    ];

    const coins = [];
    [9, 10, 19, 20, 31, 32, 39, 40, 52, 53, 59, 60].forEach((t, idx) => {
      coins.push({
        x: t * TILE + 12,
        y: GROUND_Y - (idx % 2 === 0 ? 3.5 : 2.2) * TILE,
        collected: false
      });
    });

    const enemies = [
      { x: 16 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.2, minX: 13 * TILE, maxX: 18 * TILE, type: 'goomba', alive: true },
      { x: 26 * TILE, y: GROUND_Y - 38, w: 34, h: 38, vx: 1.35, minX: 21.5 * TILE, maxX: 27.2 * TILE, type: 'koopa', alive: true },
      { x: 36 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.3, minX: 30 * TILE, maxX: 38 * TILE, type: 'goomba', alive: true },
      { x: 45 * TILE, y: GROUND_Y - 38, w: 34, h: 38, vx: 1.35, minX: 42.5 * TILE, maxX: 46.2 * TILE, type: 'koopa', alive: true },
      { x: 58 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.25, minX: 56 * TILE, maxX: 60.2 * TILE, type: 'goomba', alive: true }
    ];

    return {
      id: 2,
      name: 'Mundo 1-2 · Cueva Subterránea',
      theme: 'underground',
      skyTop: '#0d1b3e',
      skyBottom: '#1c356b',
      groundY: GROUND_Y,
      checkpointX: 41.2 * TILE,
      checkpointReached: false,
      goalX: 67 * TILE,
      width: lengthTiles * TILE,
      ground,
      blocks,
      pipes,
      coins,
      enemies
    };
  }

  function buildLevel3() {
    // Mundo 1-3: Reino de las Nubes y Gran Castillo
    const lengthTiles = 76;
    const pits = [
      [17, 18],
      [34, 35],
      [51, 52]
    ];
    const isPit = t => pits.some(([a, b]) => t >= a && t <= b);

    const ground = [];
    for (let t = 0; t < lengthTiles; t++) {
      if (!isPit(t)) {
        ground.push({ x: t * TILE, y: GROUND_Y, w: TILE, h: 80 });
      }
    }

    const blocks = [
      { x: 6 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 10 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 11 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 12 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 13 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },

      // Puente de nubes sobre foso
      { x: 17 * TILE, y: GROUND_Y - 2.2 * TILE, type: 'brick' },
      { x: 18 * TILE, y: GROUND_Y - 2.2 * TILE, type: 'brick' },

      { x: 23 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 28 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 29 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 30 * TILE, y: GROUND_Y - 5.5 * TILE, type: 'question' },

      { x: 34 * TILE, y: GROUND_Y - 2.2 * TILE, type: 'brick' },
      { x: 40 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 41 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      { x: 47 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 48 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },
      { x: 56 * TILE, y: GROUND_Y - 3 * TILE, type: 'question' },

      // Gran escalinata real
      { x: 62 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 63 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 63 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 64 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 64 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 64 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 65 * TILE, y: GROUND_Y - 1 * TILE, type: 'brick' },
      { x: 65 * TILE, y: GROUND_Y - 2 * TILE, type: 'brick' },
      { x: 65 * TILE, y: GROUND_Y - 3 * TILE, type: 'brick' },
      { x: 65 * TILE, y: GROUND_Y - 4 * TILE, type: 'brick' }
    ];

    const pipes = [
      { x: 20 * TILE, y: GROUND_Y - 68, w: 64, h: 68 },
      { x: 37 * TILE, y: GROUND_Y - 76, w: 64, h: 76 },
      { x: 54 * TILE, y: GROUND_Y - 68, w: 64, h: 68 }
    ];

    const coins = [];
    for (let i = 0; i < 16; i++) {
      const t = 7 + i * 3.5;
      coins.push({
        x: Math.floor(t) * TILE + 12,
        y: GROUND_Y - (i % 3 === 0 ? 4.2 : 1.8) * TILE,
        collected: false
      });
    }

    const enemies = [
      { x: 14 * TILE, y: GROUND_Y - 38, w: 34, h: 38, vx: -1.35, minX: 8 * TILE, maxX: 16 * TILE, type: 'koopa', alive: true },
      { x: 26 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: 1.35, minX: 22 * TILE, maxX: 32.5 * TILE, type: 'goomba', alive: true },
      { x: 43 * TILE, y: GROUND_Y - 38, w: 34, h: 38, vx: -1.45, minX: 41 * TILE, maxX: 49.5 * TILE, type: 'koopa', alive: true },
      { x: 59 * TILE, y: GROUND_Y - 34, w: 34, h: 34, vx: -1.35, minX: 56 * TILE, maxX: 61 * TILE, type: 'goomba', alive: true }
    ];

    return {
      id: 3,
      name: 'Mundo 1-3 · Cumbre del Castillo Estelar',
      theme: 'sky',
      skyTop: '#ff7e5f',
      skyBottom: '#feb47b',
      groundY: GROUND_Y,
      checkpointX: 39 * TILE,
      checkpointReached: false,
      goalX: 69 * TILE,
      width: lengthTiles * TILE,
      ground,
      blocks,
      pipes,
      coins,
      enemies
    };
  }

  function cloneLevel(levelIndex) {
    const builders = [buildLevel1, buildLevel2, buildLevel3];
    const fn = builders[(levelIndex - 1) % builders.length];
    return JSON.parse(JSON.stringify(fn()));
  }

  root.MarioLevels = {
    TILE,
    GROUND_Y,
    cloneLevel
  };
})(typeof self !== 'undefined' ? self : this);
