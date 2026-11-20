(function (root) {
  'use strict';

  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.musicEnabled = true;
      this.musicTimer = null;
      this.musicStep = 0;
    }

    ensureContext() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    playTone(freq, duration, type = 'square', volume = 0.08, delay = 0, slideTo = null) {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      }

      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.01);
    }

    jump() {
      this.playTone(220, 0.16, 'square', 0.07, 0, 560);
    }

    coin() {
      this.playTone(987.77, 0.07, 'square', 0.07, 0);
      this.playTone(1318.51, 0.22, 'square', 0.07, 0.07);
    }

    stomp() {
      this.playTone(360, 0.08, 'triangle', 0.11, 0, 140);
      this.playTone(520, 0.1, 'square', 0.06, 0.06, 760);
    }

    blockHit() {
      this.playTone(330, 0.06, 'square', 0.08, 0);
      this.playTone(440, 0.06, 'square', 0.08, 0.06);
      this.playTone(659.25, 0.14, 'square', 0.08, 0.12);
    }

    dangerAlert() {
      this.playTone(440, 0.08, 'sawtooth', 0.07, 0);
      this.playTone(349.23, 0.08, 'sawtooth', 0.07, 0.09);
      this.playTone(523.25, 0.14, 'triangle', 0.08, 0.18);
    }

    correct() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this.playTone(n, 0.11, 'square', 0.08, idx * 0.08);
      });
    }

    wrong() {
      this.playTone(311.13, 0.16, 'sawtooth', 0.07, 0, 240);
      this.playTone(233.08, 0.28, 'sawtooth', 0.07, 0.17, 175);
    }

    tick(urgent = false) {
      this.playTone(urgent ? 880 : 660, 0.045, 'square', urgent ? 0.065 : 0.04, 0);
    }

    timeout() {
      this.playTone(349.23, 0.14, 'sawtooth', 0.08, 0, 277.18);
      this.playTone(261.63, 0.16, 'sawtooth', 0.08, 0.15, 196.0);
      this.playTone(196.0, 0.32, 'sawtooth', 0.09, 0.32, 130.81);
    }

    playerDie() {
      const seq = [
        [493.88, 0.09], [698.46, 0.09], [698.46, 0.11],
        [659.25, 0.11], [587.33, 0.11], [523.25, 0.24]
      ];
      let delay = 0;
      for (const [f, d] of seq) {
        this.playTone(f, d, 'square', 0.08, delay);
        delay += d + 0.02;
      }
    }

    checkpoint() {
      this.playTone(587.33, 0.08, 'triangle', 0.09, 0);
      this.playTone(880.0, 0.18, 'triangle', 0.09, 0.08);
    }

    turnSwitch() {
      this.playTone(392.0, 0.08, 'triangle', 0.09, 0);
      this.playTone(523.25, 0.12, 'triangle', 0.09, 0.09);
    }

    castleWin() {
      const fanfare = [
        [523.25, 0.11], [659.25, 0.11], [783.99, 0.11],
        [1046.5, 0.22], [783.99, 0.11], [1046.5, 0.36]
      ];
      let t = 0;
      for (const [freq, dur] of fanfare) {
        this.playTone(freq, dur, 'square', 0.08, t);
        t += dur + 0.02;
      }
    }

    startMusic() {
      this.stopMusic();
      if (this.muted || !this.musicEnabled) return;

      // Melodía alegre original estilo plataformas 8-bit
      const melody = [
        659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0,
        783.99, 0, 0, 0, 392.0, 0, 0, 0,
        523.25, 0, 0, 392.0, 0, 0, 329.63, 0,
        440.0, 0, 493.88, 0, 466.16, 440.0, 0, 0
      ];
      this.musicStep = 0;
      this.musicTimer = setInterval(() => {
        if (this.muted || !this.musicEnabled) return;
        const note = melody[this.musicStep % melody.length];
        if (note > 0) {
          this.playTone(note, 0.11, 'triangle', 0.03, 0);
        }
        this.musicStep++;
      }, 175);
    }

    stopMusic() {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopMusic();
      }
      return this.muted;
    }
  }

  root.MarioAudio = new SoundManager();
})(typeof self !== 'undefined' ? self : this);
