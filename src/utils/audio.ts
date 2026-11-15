/**
 * Procedural Web Audio API sound generator for Chaos Tic-Tac-Toe
 * Zero external audio dependencies - 100% reliable across browsers.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private sfxVolume = 0.7;
  private musicVolume = 0.35;
  private sfxEnabled = true;
  private musicEnabled = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.value = this.sfxEnabled ? this.sfxVolume : 0;
        this.sfxGainNode.connect(this.ctx.destination);

        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.value = this.musicEnabled ? this.musicVolume : 0;
        this.musicGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(sfxEnabled: boolean, sfxVolume: number, musicEnabled: boolean, musicVolume: number) {
    this.sfxEnabled = sfxEnabled;
    this.sfxVolume = sfxVolume;
    this.musicEnabled = musicEnabled;
    this.musicVolume = musicVolume;

    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(sfxEnabled ? sfxVolume : 0, this.ctx.currentTime);
    }

    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(musicEnabled ? musicVolume : 0, this.ctx.currentTime);
    }

    if (musicEnabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!musicEnabled && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  // Basic Button Click
  public playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Placing an X (crisp electric chord)
  public playMoveX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [440, 659.25].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.02);
      gain.gain.setValueAtTime(0.3, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15 + i * 0.02);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + i * 0.02);
      osc.stop(t + 0.18 + i * 0.02);
    });
  }

  // Placing an O (warm rounded dual-tone)
  public playMoveO() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [329.63, 493.88].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.02);
      gain.gain.setValueAtTime(0.3, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16 + i * 0.02);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + i * 0.02);
      osc.stop(t + 0.2 + i * 0.02);
    });
  }

  // Nuclear Bomb explosion: white noise burst + sub bass drop
  public playNuke() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;

    // Sub oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.8);
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGainNode);
    subOsc.start(t);
    subOsc.stop(t + 0.95);

    // Noise buffer for blast
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.7);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGainNode);
    noise.start(t);
  }

  // Blind ability: sinister low drone
  public playBlind() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.linearRampToValueAtTime(65, t + 0.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  // Shuffle ability: rapid pitch sweep
  public playShuffle() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [260, 420, 640, 520, 780, 960].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.2, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.09);
    });
  }

  // Outer board expansion: ascending majestic chords
  public playExpand() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.25, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.28);
    });
  }

  // Lunge: rapid double laser swoosh
  public playLunge() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, t + offset);
      osc.frequency.exponentialRampToValueAtTime(200, t + offset + 0.1);
      gain.gain.setValueAtTime(0.3, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.11);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + offset);
      osc.stop(t + offset + 0.12);
    });
  }

  // Skip a turn: electric zap
  public playSkip() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(400, t + 0.06);
    osc.frequency.setValueAtTime(200, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Fakeout placement: mysterious purple chime
  public playFakeoutPlaced() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [587.33, 739.99, 880].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.2, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.28);
    });
  }

  // Fakeout busted / clicked: glass pop / dissipate
  public playFakeoutBusted() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.18);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Turnover Bomb: polarity inversion sweep
  public playTurnover() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [520, 340, 680, 260].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, t + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.18);
    });
  }

  // Stab Shot: sharp sniper snap (hit) or dull ricochet (miss)
  public playStabShot(hit: boolean) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = hit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(hit ? 1200 : 320, t);
    osc.frequency.exponentialRampToValueAtTime(hit ? 180 : 120, t + 0.25);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.28);
    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Retract: descending compression tone
  public playRetract() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [659.25, 523.25, 392.0, 261.63].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      gain.gain.setValueAtTime(0.25, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.22);
    });
  }

  // Invalid move or blind bump
  public playInvalid() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(130, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Victory fanfare
  public playVictory() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.35, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + (idx === notes.length - 1 ? 0.6 : 0.2));
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + (idx === notes.length - 1 ? 0.65 : 0.22));
    });
  }

  // Draw sound
  public playDraw() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    [440, 415.3, 392].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.25, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.28);
    });
  }

  // Ambient cyber-synth background music
  private startAmbientMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;
    const chords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [196, 246.94, 293.66], // G
      [164.81, 196, 246.94], // Em
    ];
    let step = 0;

    const playChordStep = () => {
      if (!this.ctx || !this.musicGainNode || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime;
      const chord = chords[step % chords.length];
      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 1.85);
      });
      step++;
    };

    playChordStep();
    this.musicInterval = window.setInterval(playChordStep, 2000);
  }

  private stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundController();
