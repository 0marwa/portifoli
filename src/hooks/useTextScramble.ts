"use client";

import { useState, useEffect, useRef } from "react";

const CHARSET = "!@#$%/\\|<>?▓░▒█";

interface UseTextScrambleOptions {
  tickInterval?: number; // ms between each character lock-in (default 60)
  duration?: number;     // total desired duration in ms; overrides tickInterval if set
}

interface UseTextScrambleResult {
  displayText: string;
  isDone: boolean;
}

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

// Fisher-Yates shuffle of an array of indices
function shuffleIndices(indices: number[]): number[] {
  const arr = [...indices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useTextScramble(
  text: string,
  trigger: boolean,
  options: UseTextScrambleOptions = {}
): UseTextScrambleResult {
  const [displayText, setDisplayText] = useState(text);
  const [isDone, setIsDone] = useState(false);

  // Mutable state in refs — safe with React Compiler
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedSetRef = useRef<Set<number>>(new Set());
  const shuffleOrderRef = useRef<number[]>([]);
  const shuffleCursorRef = useRef(0);

  useEffect(() => {
    if (!trigger) {
      // Reset when trigger goes false
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lockedSetRef.current = new Set();
      shuffleOrderRef.current = [];
      shuffleCursorRef.current = 0;
      setDisplayText(text);
      setIsDone(false);
      return;
    }

    // Build shuffle order: only non-space indices
    const nonSpaceIndices: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== " ") nonSpaceIndices.push(i);
    }
    shuffleOrderRef.current = shuffleIndices(nonSpaceIndices);
    shuffleCursorRef.current = 0;
    lockedSetRef.current = new Set();

    // Derive tickInterval from duration if provided
    const tickInterval =
      options.duration !== undefined && nonSpaceIndices.length > 0
        ? Math.floor(options.duration / nonSpaceIndices.length)
        : (options.tickInterval ?? 60);

    intervalRef.current = setInterval(() => {
      const order = shuffleOrderRef.current;
      const locked = lockedSetRef.current;
      const cursor = shuffleCursorRef.current;

      // Lock in next character in shuffle order
      if (cursor < order.length) {
        locked.add(order[cursor]);
        shuffleCursorRef.current = cursor + 1;
      }

      // Build display string
      const chars: string[] = text.split("");
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") continue; // spaces never scrambled
        if (!locked.has(i)) {
          chars[i] = randomChar();
        }
      }
      setDisplayText(chars.join(""));

      // All locked → done
      if (shuffleCursorRef.current >= order.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setDisplayText(text); // ensure final state is correct
        setIsDone(true);
      }
    }, tickInterval);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, text]);

  return { displayText, isDone };
}

// ─── useScrollScramble ─────────────────────────────────────────────────────────
// Scrambles text while the page is scrolling; resolves back to correct text
// ~150ms after scrolling stops. Creates a continuous "decoding" feel.

interface UseScrollScrambleResult {
  displayText: string;
}

export function useScrollScramble(text: string): UseScrollScrambleResult {
  const [displayText, setDisplayText] = useState(text);

  // Refs for animation state — avoids stale closures
  const isScrollingRef = useRef(false);
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedSetRef = useRef<Set<number>>(new Set());
  const shuffleOrderRef = useRef<number[]>([]);
  const shuffleCursorRef = useRef(0);
  const textRef = useRef(text);

  // Keep textRef current without re-running the main effect
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    function scrambleAll() {
      const t = textRef.current;
      const chars = t.split("");
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] !== " ") chars[i] = randomChar();
      }
      setDisplayText(chars.join(""));
    }

    function startResolve() {
      // Cancel any in-progress resolve
      if (resolveIntervalRef.current !== null) {
        clearInterval(resolveIntervalRef.current);
        resolveIntervalRef.current = null;
      }

      const t = textRef.current;
      // Build shuffle order for reveal
      const nonSpaceIndices: number[] = [];
      for (let i = 0; i < t.length; i++) {
        if (t[i] !== " ") nonSpaceIndices.push(i);
      }
      shuffleOrderRef.current = shuffleIndices(nonSpaceIndices);
      shuffleCursorRef.current = 0;
      lockedSetRef.current = new Set();

      // Total resolve ~1200ms
      const tickInterval =
        nonSpaceIndices.length > 0
          ? Math.floor(1200 / nonSpaceIndices.length)
          : 60;

      resolveIntervalRef.current = setInterval(() => {
        const order = shuffleOrderRef.current;
        const locked = lockedSetRef.current;
        const cursor = shuffleCursorRef.current;

        if (cursor < order.length) {
          locked.add(order[cursor]);
          shuffleCursorRef.current = cursor + 1;
        }

        const currentText = textRef.current;
        const chars = currentText.split("");
        for (let i = 0; i < chars.length; i++) {
          if (chars[i] === " ") continue;
          if (!locked.has(i)) chars[i] = randomChar();
        }
        setDisplayText(chars.join(""));

        if (shuffleCursorRef.current >= order.length) {
          clearInterval(resolveIntervalRef.current!);
          resolveIntervalRef.current = null;
          setDisplayText(textRef.current);
        }
      }, tickInterval);
    }

    function onScroll() {
      isScrollingRef.current = true;

      // While scrolling: scramble every event
      scrambleAll();

      // Debounce: start resolve 150ms after last scroll event
      if (resolveTimerRef.current !== null) {
        clearTimeout(resolveTimerRef.current);
      }
      // Cancel any in-progress resolve animation while still scrolling
      if (resolveIntervalRef.current !== null) {
        clearInterval(resolveIntervalRef.current);
        resolveIntervalRef.current = null;
      }

      resolveTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        startResolve();
      }, 150);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (resolveTimerRef.current !== null) clearTimeout(resolveTimerRef.current);
      if (resolveIntervalRef.current !== null) clearInterval(resolveIntervalRef.current);
    };
  }, []); // run once — textRef keeps text current

  return { displayText };
}
