
class AtmosphereController {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambienceNodes = {};
    this.currentTier = 'Bureaucratic';
    this.isInitialized = false;
    this.inkOscillator = null;
    this.inkGain = null;
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Master volume
      
      this.isInitialized = true;
      this.setupInkSound();
      // Start initial ambience (muted until user interaction usually)
      this.transitionToTier(this.currentTier);
    } catch (e) {
      console.warn("Audio Context not supported or blocked");
    }
  }

  setupInkSound() {
    if (!this.ctx) return;
    // Create a noise buffer for scratching sound
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.inkNoiseBuffer = buffer;
  }

  playInkSound(speed) {
    if (!this.ctx || !this.isInitialized) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const src = this.ctx.createBufferSource();
    src.buffer = this.inkNoiseBuffer;
    src.loop = true;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    
    const gain = this.ctx.createGain();
    
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Pitch shifting based on speed
    // Base playback rate is 1.0
    // Fast strokes (speed > 5) -> higher pitch (up to 1.2)
    // Slow strokes (speed < 1) -> lower pitch (down to 0.6)
    let rate = 1.0;
    if (speed > 5) rate = 1.2;
    else if (speed < 1) rate = 0.6 + (speed * 0.3);
    else rate = 0.8 + (speed * 0.05);

    src.playbackRate.value = rate;
    
    // Frequency also modulates with speed
    filter.frequency.value = 800 + (speed * 100);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    src.start();
    src.stop(this.ctx.currentTime + 0.15);
  }

  setVibeTier(tier) {
    if (this.currentTier === tier) return;
    this.currentTier = tier;
    this.transitionToTier(tier);
  }

  transitionToTier(tier) {
    if (!this.ctx) return;
    
    // Placeholder for switching background tracks
    // In a real app, we would crossfade between audio elements or oscillators
    // For now, we simulate the environment change via console or subtle noise color change
    // Since we don't have actual asset files for ambience loaded via URL in this mock
    
    // Example: Bureaucratic = White Noise (Hum)
    // Eldritch = Pink Noise (Wind)
    // Majestic = Brown Noise (Rumble/Warmth)
    
    this.stopCurrentAmbience();
    this.playAmbienceForTier(tier);
  }

  stopCurrentAmbience() {
     if (this.currentAmbience) {
         this.currentAmbience.stop();
         this.currentAmbience = null;
     }
  }

  playAmbienceForTier(tier) {
      // Very simple synthesized ambience
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      if (tier === 'Bureaucratic') {
          osc.type = 'sine';
          osc.frequency.value = 60; // Hum
          gain.gain.value = 0.05;
      } else if (tier === 'Eldritch') {
          osc.type = 'triangle';
          osc.frequency.value = 40; // Low drone
           // Modulate frequency for eeriness
          const lfo = this.ctx.createOscillator();
          lfo.frequency.value = 0.5;
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.value = 10;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();
          
          gain.gain.value = 0.08;
      } else { // Majestic
          osc.type = 'sine';
          osc.frequency.value = 100; // Warm low tone
          gain.gain.value = 0.05;
      }
      
      osc.start();
      this.currentAmbience = osc;
  }
}

export default new AtmosphereController();
