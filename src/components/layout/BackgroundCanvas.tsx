'use client';

import { useEffect, useRef } from 'react';

// ─── Minimal type stubs for the dynamically-loaded p5 global ──────────────────
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
  setup: () => void;
  draw: () => void;
  windowResized: () => void;

  width: number;
  height: number;
  windowWidth: number;
  windowHeight: number;
  mouseX: number;
  mouseY: number;
  frameCount: number;

  TWO_PI: number;

  createCanvas(w: number, h: number): P5Canvas;
  resizeCanvas(w: number, h: number): void;
  noStroke(): void;
  fill(v1: number, v2?: number, v3?: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  ellipse(x: number, y: number, d: number): void;

  noise(x: number, y: number, z: number): number;
  sin(angle: number): number;
  cos(angle: number): number;
  tan(angle: number): number;
  random(min: number, max?: number): number;
  map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;

  createVector(x: number, y: number, z?: number): P5Vector;
}

interface P5Constructor {
  new (sketch: (p: P5) => void, container: HTMLElement): { remove(): void };
}

interface RepelZone {
  x: number;
  y: number;
  r: number;
  force: number;
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
        const num           = 900; // nb of particles
        const noiseScale    = 100;
        const noiseStrength = 1;
        const particles: Particle[] = new Array(num);

        // ── repulsion config ───────────────────────────────────────────
        const MOUSE_RADIUS = 120;   // px — repulsion radius around cursor
        const MOUSE_FORCE  = 6;     // push strength for mouse
        const DOM_RADIUS   = 80;    // extra padding beyond element bounds
        const DOM_FORCE    = 4;     // push strength for DOM elements

        let repelZones: RepelZone[] = [];
        let zoneTimer = 0;

        function refreshRepelZones() {
          repelZones = [];
          document.querySelectorAll('[data-repel]').forEach((el) => {
            const rect = el.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const r    = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2 + DOM_RADIUS;
            repelZones.push({ x: cx, y: cy, r, force: DOM_FORCE });
          });
        }

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
            // original OG noise flow — unchanged
            const angle = p.noise(
              this.loc.x / noiseScale,
              this.loc.y / noiseScale,
              p.frameCount / noiseScale,
            ) * p.TWO_PI * noiseStrength;

            this.dir.x = p.sin(angle);
            this.dir.y = p.tan(angle);

            const vel = this.dir.copy();
            vel.mult(this.speed * 22);
            this.loc.add(vel);

            // ── mouse repulsion ────────────────────────────────────────
            const mdx = this.loc.x - p.mouseX;
            const mdy = this.loc.y - p.mouseY;
            const md  = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < MOUSE_RADIUS && md > 0) {
              const strength = (1 - md / MOUSE_RADIUS) * MOUSE_FORCE;
              this.loc.x += (mdx / md) * strength * this.speed * 2;
              this.loc.y += (mdy / md) * strength * this.speed * 2;
            }

            // ── DOM element repulsion ──────────────────────────────────
            for (const zone of repelZones) {
              const zdx = this.loc.x - zone.x;
              const zdy = this.loc.y - zone.y;
              const zd  = Math.sqrt(zdx * zdx + zdy * zdy);
              if (zd < zone.r && zd > 0) {
                const strength = (1 - zd / zone.r) * zone.force;
                this.loc.x += (zdx / zd) * strength * this.speed * 2;
                this.loc.y += (zdy / zd) * strength * this.speed * 2;
              }
            }
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

          refreshRepelZones();
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          refreshRepelZones();
        };

        p.draw = () => {
          p.fill(0, 10);
          p.rect(0, 0, p.width, p.height);

          zoneTimer++;
          if (zoneTimer >= 30) {
            refreshRepelZones();
            zoneTimer = 0;
          }

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