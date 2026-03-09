'use client';

import { useEffect, useRef } from 'react';

// ─── Minimal type stubs for the dynamically-loaded p5 global ──────────────────
// p5 is loaded at runtime via a <script> tag; we don't install @types/p5,
// so we declare only the subset the sketch actually uses.

interface P5Vector {
  x: number;
  y: number;
  z: number;
  copy(): P5Vector;
  mult(scalar: number): void;
  add(v: P5Vector): void;
} 

interface P5Canvas {
  style(prop: string, value: string): void;
}

interface P5 {
  // canvas lifecycle
  setup: () => void;
  draw: () => void;
  windowResized: () => void;

  // dimensions
  width: number;
  height: number;
  windowWidth: number;
  windowHeight: number;
  mouseX: number;
  frameCount: number;

  // constants
  TWO_PI: number;

  // drawing commands
  createCanvas(w: number, h: number): P5Canvas;
  resizeCanvas(w: number, h: number): void;
  noStroke(): void;
  fill(v1: number, v2?: number, v3?: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  ellipse(x: number, y: number, d: number): void;

  // math / noise
  noise(x: number, y: number, z: number): number;
  sin(angle: number): number;
  cos(angle: number): number;
  tan(angle: number): number;
  random(min: number, max?: number): number;
  map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;

  // vector factory
  createVector(x: number, y: number, z?: number): P5Vector;
}

interface P5Constructor {
  new (sketch: (p: P5) => void, container: HTMLElement): { remove(): void };
}

declare global {
  interface Window { p5: P5Constructor; }
}

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: { remove(): void } | undefined;
    let cancelled = false;

    function init() {
      if (cancelled) return;

      if (!window.p5) {
        setTimeout(init, 50);
        return;
      }

      const P5 = window.p5;

      const sketch = (p: P5) => {
        // ── variables ──────────────────────────────────────────────────
        const num = 2222;
        const noiseScale = 100;
        const noiseStrength = 1;
        const particles: Particle[] = new Array(num);

        // ── Particle class ─────────────────────────────────────────────
        class Particle {
          loc: P5Vector;
          dir: P5Vector;
          speed: number;

          constructor(_loc: P5Vector, _dir: P5Vector, _speed: number) {
            this.loc   = _loc;
            this.dir   = _dir;
            this.speed = _speed;
          }

          run() {
            this.move();
            this.checkEdges();
            this.update();
          }

          move() {
            const angle = p.noise(
              this.loc.x / noiseScale,
              this.loc.y / noiseScale,
              p.frameCount / noiseScale,
            ) * p.TWO_PI * noiseStrength;

            this.dir.x = p.sin(angle);
            this.dir.y = p.tan(angle);

            const vel = this.dir.copy();
            const d = 22;
            vel.mult(this.speed * d);
            this.loc.add(vel);
          }

          checkEdges() {
            if (
              this.loc.x < 0 || this.loc.x > p.width ||
              this.loc.y < 0 || this.loc.y > p.height
            ) {
              this.loc.x = p.random(p.width * 10);
              this.loc.y = p.random(p.height);
            }
          }

          update() {
            p.fill(255, 200, 255);
            p.ellipse(this.loc.x, this.loc.y, this.loc.z);
          }
        }

        // ── setup ──────────────────────────────────────────────────────
        p.setup = () => {
          const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
          cnv.style('position', 'fixed');
          cnv.style('top', '0');
          cnv.style('left', '0');
          cnv.style('z-index', '-2');
          cnv.style('pointer-events', 'none');
          p.noStroke();

          for (let i = 0; i < num; i++) {
            const loc   = p.createVector(p.random(p.width * 1.2), p.random(p.height), 2);
            const angle = 0;
            const dir   = p.createVector(p.cos(angle), p.sin(angle));
            const speed = p.random(5, p.map(p.mouseX, 0, p.width, 5, 20));
            particles[i] = new Particle(loc, dir, speed);
          }
        };

        // ── windowResized ──────────────────────────────────────────────
        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        // ── draw ───────────────────────────────────────────────────────
        p.draw = () => {
          p.fill(0, 10);
          p.rect(0, 0, p.width, p.height);
          for (let i = 0; i < particles.length; i++) {
            particles[i].run();
          }
        };
      };

      if (containerRef.current) {
        p5Instance = new P5(sketch, containerRef.current);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (p5Instance) p5Instance.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, zIndex: -2 }}
    />
  );
}
