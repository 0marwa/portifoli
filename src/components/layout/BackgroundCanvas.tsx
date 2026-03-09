'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window { p5: any; }
}

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: any;
    let cancelled = false;

    function init() {
      if (cancelled) return;

      if (!window.p5) {
        setTimeout(init, 50);
        return;
      }

      const p5 = window.p5;

      const sketch = (p: any) => {
        // ── original OG variables ──────────────────────────────────────
        let num = 2222;
        let noiseScale = 100, noiseStrength = 1;
        let particles: any[] = new Array(num);

        // ── original OG Particle class ─────────────────────────────────
        class Particle {
          loc: any; dir: any; speed: number;

          constructor(_loc: any, _dir: any, _speed: number) {
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
            let angle = p.noise(
              this.loc.x / noiseScale,
              this.loc.y / noiseScale,
              p.frameCount / noiseScale
            ) * p.TWO_PI * noiseStrength;

            this.dir.x = p.sin(angle);
            this.dir.y = p.tan(angle);

            let vel = this.dir.copy();
            let d = 22;
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

        // ── original OG setup ──────────────────────────────────────────
        p.setup = () => {
          const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
          cnv.style('position', 'fixed');
          cnv.style('top', '0');
          cnv.style('left', '0');
          cnv.style('z-index', '-2');
          cnv.style('pointer-events', 'none');
          p.noStroke();

          for (let i = 0; i < num; i++) {
            let loc   = p.createVector(p.random(p.width * 1.2), p.random(p.height), 2);
            let angle = 0;
            let dir   = p.createVector(p.cos(angle), p.sin(angle));
            let speed = p.random(5, p.map(p.mouseX, 0, p.width, 5, 20));
            particles[i] = new Particle(loc, dir, speed);
          }
        };

        // ── original OG windowResized ──────────────────────────────────
        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        // ── original OG draw ───────────────────────────────────────────
        p.draw = () => {
          p.fill(0, 10);
          p.rect(0, 0, p.width, p.height);
          for (let i = 0; i < particles.length; i++) {
            particles[i].run();
          }
        };
      };

      if (containerRef.current) {
        p5Instance = new p5(sketch, containerRef.current);
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