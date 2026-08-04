"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SoundKind = "tick" | "toggle-on" | "toggle-off";

interface SoundContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  play: (kind: SoundKind) => void;
}

const STORAGE_KEY = "portfolio-sound-enabled";

const SoundContext = createContext<SoundContextValue | null>(null);

const TONES: Record<SoundKind, { frequency: number; duration: number; gain: number }> = {
  tick: { frequency: 660, duration: 0.03, gain: 0.05 },
  "toggle-on": { frequency: 520, duration: 0.09, gain: 0.06 },
  "toggle-off": { frequency: 340, duration: 0.09, gain: 0.06 },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Sound defaults to off for both server and client render; this only
    // restores a previously saved opt-in after mount.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(stored === "true");
    } catch {
      // localStorage unavailable — sound stays off, which is the safe default
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore persistence failure, preference still applies for this session
      }
      return next;
    });
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled) return;
      if (typeof window === "undefined") return;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      if (!contextRef.current) {
        contextRef.current = new AudioContextClass();
      }
      const ctx = contextRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      const { frequency, duration, gain } = TONES[kind];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration + 0.02);
    },
    [enabled],
  );

  return (
    <SoundContext.Provider value={{ enabled, toggleEnabled, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within a SoundProvider");
  return ctx;
}
