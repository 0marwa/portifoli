'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface RepelZone {
  x: number;
  y: number;
  r: number;
  force: number;
}

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
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
      let particlesDimmed = false;

      function refreshRepelZones() {
        repelZones = [];
        document.querySelectorAll('[data-repel]').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2;
          const cy   = rect.top  + rect.height / 2;
          const r    = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2 + DOM_RADIUS;
          repelZones.push({ x: cx, y: cy, r, force: DOM_FORCE });
        });
        particlesDimmed = document.documentElement.dataset.dimParticles === '1';
      }

      // ── Particle class ─────────────────────────────────────────────
      class Particle {
        loc: p5.Vector;
        dir: p5.Vector;
        speed: number;

        constructor(_loc: p5.Vector, _dir: p5.Vector, _speed: number) {
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

          // ── DOM element attraction (only when dimmed) ──────────────────
          if (particlesDimmed) {
            for (const zone of repelZones) {
              const ATTRACT_RADIUS = zone.r * 3.5;
              const adx = zone.x - this.loc.x;
              const ady = zone.y - this.loc.y;
              const ad  = Math.sqrt(adx * adx + ady * ady);
              if (ad < ATTRACT_RADIUS && ad > zone.r) {
                const strength = (1 - ad / ATTRACT_RADIUS) * 0.8;
                this.loc.x += (adx / ad) * strength * this.speed;
                this.loc.y += (ady / ad) * strength * this.speed;
              }
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
          if (particlesDimmed) {
            p.fill(210, 210, 230, 55);
          } else {
            p.fill(240, 240, 255);
          }
          p.ellipse(this.loc.x, this.loc.y, (this.loc as p5.Vector & { z: number }).z);
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
        // Refresh repel zones on timer
        zoneTimer++;
        if (zoneTimer >= 30) {
          refreshRepelZones();
          zoneTimer = 0;
        }

        // Background fade — slower when dimmed so trails linger longer
        if (particlesDimmed) {
          p.fill(0, 8);
        } else {
          p.fill(0, 10);
        }
        p.rect(0, 0, p.width, p.height);

        for (let i = 0; i < particles.length; i++) {
          particles[i].run();
        }
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, zIndex: -2 }}
    />
  );
}
