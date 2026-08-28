import { useGameStore } from "./store";

export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  sfx: GainNode | null = null;
  noise: AudioBuffer | null = null;
  engine: OscillatorNode | null = null;
  engineGain: GainNode | null = null;

  unlock() {
    if (!this.ctx) {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.sfx = ctx.createGain();
      this.sfx.gain.value = 0.7;
      this.master.connect(ctx.destination);
      this.sfx.connect(this.master);
      this.noise = this.makeNoise(ctx);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.applyMute();
  }

  applyMute() {
    if (!this.master || !this.ctx) return;
    const muted = useGameStore.getState().muted;
    this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.02);
  }

  gun() {
    this.blip(980, 0.045, 0.09, "square");
    this.burst(0.03, 0.05, 1800);
  }

  overheat() {
    this.sweep(380, 140, 0.32, 0.09);
    this.burst(0.14, 0.08, 700);
  }

  gunReady() {
    this.blip(760, 0.05, 0.05, "square");
    this.blip(1100, 0.06, 0.04, "triangle");
  }

  bombDrop() {
    this.sweep(420, 140, 0.22, 0.08);
  }

  boom() {
    this.burst(0.22, 0.22, 400);
    this.blip(90, 0.28, 0.16, "sine");
  }

  spark() {
    this.burst(0.06, 0.08, 2400);
    this.blip(1480, 0.05, 0.06, "square");
  }

  pickup() {
    this.blip(620, 0.07, 0.09, "sine");
    this.blip(880, 0.09, 0.1, "triangle");
    this.blip(1240, 0.12, 0.08, "sine");
  }

  hurt() {
    this.blip(220, 0.14, 0.12, "sawtooth");
    this.burst(0.1, 0.1, 700);
  }

  crash() {
    this.burst(0.45, 0.28, 300);
    this.sweep(180, 40, 0.5, 0.18);
  }

  startEngine() {
    if (!this.ctx || !this.sfx || this.engine) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 68;
    g.gain.value = 0.035;
    osc.connect(g);
    g.connect(this.sfx);
    osc.start();
    this.engine = osc;
    this.engineGain = g;
  }

  stopEngine() {
    try {
      this.engine?.stop();
    } catch {
      /* already stopped */
    }
    this.engine?.disconnect();
    this.engineGain?.disconnect();
    this.engine = null;
    this.engineGain = null;
  }

  private blip(
    freq: number,
    dur: number,
    gain: number,
    type: OscillatorType,
  ) {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * (1 + (Math.random() * 2 - 1) * 0.06);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private sweep(from: number, to: number, dur: number, gain: number) {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private burst(dur: number, gain: number, filterHz: number) {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = filterHz;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private makeNoise(ctx: AudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const audio = new GameAudio();
