/**
 * useSoundEngine – Web Audio API sound effects for Cinema Huduga.
 * All sounds are synthesized (no external files needed).
 * Volume is kept low and subtle throughout.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type SoundName = "click" | "correct" | "wrong" | "levelComplete" | "gameOver";

function getCtx(): AudioContext | null {
  try {
    return new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  } catch {
    return null;
  }
}

// ── Sound synthesizer helpers ──────────────────────────────────────────────

function playClick(ctx: AudioContext): void {
  // Soft, short tick – like a keyboard key
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.07);
}

function playCorrect(ctx: AudioContext): void {
  // Two-note ascending chime – positive, not loud
  const notes = [523.25, 783.99]; // C5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.03);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + i * 0.12 + 0.3,
    );

    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.35);
  });
}

function playWrong(ctx: AudioContext): void {
  // Soft descending buzz – not harsh
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

function playLevelComplete(ctx: AudioContext): void {
  // Short celebratory arpeggio – C major triad going up then top note held
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const durations = [0.1, 0.1, 0.1, 0.35];

  notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);

    const peak = i === notes.length - 1 ? 0.18 : 0.13;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durations[i]);

    osc.start(start);
    osc.stop(start + durations[i] + 0.05);
  });
}

function playGameOver(ctx: AudioContext): void {
  // Descending sad tone – subtle, not dramatic
  const notes = [392, 349.23, 311.13, 261.63]; // G4 F4 Eb4 C4
  notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.1, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

    osc.start(start);
    osc.stop(start + 0.25);
  });
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSoundEngine() {
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("soundOn") !== "false";
    } catch {
      return true;
    }
  });

  const ctxRef = useRef<AudioContext | null>(null);

  // Lazily create AudioContext on first user interaction (browser policy)
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = getCtx();
    }
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("soundOn", String(next));
      } catch {}
      return next;
    });
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!soundOn) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      try {
        switch (name) {
          case "click":
            playClick(ctx);
            break;
          case "correct":
            playCorrect(ctx);
            break;
          case "wrong":
            playWrong(ctx);
            break;
          case "levelComplete":
            playLevelComplete(ctx);
            break;
          case "gameOver":
            playGameOver(ctx);
            break;
        }
      } catch {
        // Silently ignore any audio errors
      }
    },
    [soundOn, ensureCtx],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return { soundOn, toggleSound, play };
}
