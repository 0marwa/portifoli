'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: any;

    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      const sketch = (p: any) => {
        const NUM = 260;
        const NOISE_SCALE = 400;
        let particles: any[] = [];
        let noiseZ = 0;

        let glitching = false;
        let glitchTimer = 0;
        const GLITCH_DUR = 45;

        let regenning = false;
        let regenTimer = 0;
        const REGEN_DUR = 35;

        let starOpacity = 1;

        function draw4Star(outer: number, inner: number, jitter: number) {
          p.beginShape();
          for (let i = 0; i < 8; i++) {
            const a = (i * p.TWO_PI) / 8;
            const r = i % 2 === 0 ? outer : inner;
            const j = jitter ? p.random(-jitter, jitter) : 0;
            p.vertex(p.cos(a) * (r + j), p.sin(a) * (r + j));
          }
          p.endShape(p.CLOSE);
        }

        function insideStar4(lx: number, ly: number, outer: number, inner: number) {
          const verts = [];
          for (let i = 0; i < 8; i++) {
            const a = (i * p.TWO_PI) / 8;
            const r = i % 2 === 0 ? outer : inner;
            verts.push({ x: p.cos(a) * r, y: p.sin(a) * r });
          }
          let inside = false;
          const n = verts.length;
          for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = verts[i].x, yi = verts[i].y;
            const xj = verts[j].x, yj = verts[j].y;
            if (yi > ly !== yj > ly && lx < ((xj - xi) * (ly - yi)) / (yj - yi) + xi)
              inside = !inside;
          }
          return inside;
        }

        class Particle {
          loc: any; nOff: any; vel: any;
          sz: number; speed: number; rot: number; rotSpeed: number;
          alpha: number; chaos: number;
          dots: { x: number; y: number; d: number; ds: number }[];

          constructor() {
            this.loc  = p.createVector(p.random(p.width), p.random(p.height));
            this.nOff = p.createVector(p.random(10000), p.random(10000));
            this.vel  = p5.Vector.random2D();

            const r = p.random();
            this.sz =
              r < 0.50 ? p.random(4,  14) :
              r < 0.78 ? p.random(15, 36) :
              r < 0.93 ? p.random(37, 68) :
                         p.random(70, 120);

            this.speed    = p.random(0.05, 0.35);
            this.rot      = p.random(p.TWO_PI);
            this.rotSpeed = p.random(-0.001, 0.001);
            this.alpha    = p.random(70, 150);
            this.chaos    = p.random(0.01, 0.06);
            this.dots     = [];
            this.buildStipple();
          }

          buildStipple() {
            const outer = this.sz, inner = outer * 0.26;
            let dotCount = Math.min(Math.max(Math.floor(outer * outer * 0.5), 8), 400);
            for (let i = 0; i < dotCount * 12 && this.dots.length < dotCount; i++) {
              const px = p.random(-outer, outer);
              const py = p.random(-outer, outer);
              if (insideStar4(px, py, outer, inner)) {
                const d = p.dist(0, 0, px, py) / outer;
                this.dots.push({ x: px, y: py, d, ds: p.random(0.3, 2.0) });
              }
            }
          }

          run(aScale: number) {
            // move
            const nx    = (this.loc.x + this.nOff.x) / NOISE_SCALE;
            const ny    = (this.loc.y + this.nOff.y) / NOISE_SCALE;
            const angle = p.noise(nx, ny, noiseZ) * p.TWO_PI * 2;
            const target = p5.Vector.fromAngle(angle);
            this.vel.lerp(target, this.chaos);
            this.vel.setMag(this.speed);
            this.loc.add(this.vel);
            this.rot += this.rotSpeed;

            // wrap
            const m = this.sz + 20;
            if (this.loc.x < -m)             this.loc.x = p.width  + m;
            else if (this.loc.x > p.width+m)  this.loc.x = -m;
            if (this.loc.y < -m)             this.loc.y = p.height + m;
            else if (this.loc.y > p.height+m) this.loc.y = -m;

            // draw
            const outer = this.sz, inner = outer * 0.26;
            const a = this.alpha * aScale;
            p.push();
            p.translate(this.loc.x, this.loc.y);
            p.rotate(this.rot);

            p.noStroke();
            p.fill(5, 5, 5, a * 0.5);
            draw4Star(outer, inner, outer * 0.03);

            for (const dot of this.dots) {
              const dotA = a * (0.9 - dot.d * 0.82);
              if (dotA > 2) { p.fill(205, 200, 190, dotA); p.ellipse(dot.x, dot.y, dot.ds, dot.ds); }
            }

            p.stroke(160, 155, 148, a * 0.12);
            p.strokeWeight(0.4);
            p.noFill();
            draw4Star(outer, inner, outer * 0.04);
            p.noStroke();
            p.pop();
          }
        }

        function spawnAll() {
          particles = [];
          for (let i = 0; i < NUM; i++) particles.push(new Particle());
        }

        function runGlitch() {
          const t = glitchTimer / GLITCH_DUR;
          p.noStroke();

          const tears = Math.floor(p.random(3, 10));
          for (let i = 0; i < tears; i++) {
            const sy  = p.random(p.height);
            const sh  = p.random(1, 28);
            const off = p.random(-80, 80) * t;
            p.fill(255, 255, 255, p.random(15, 55) * t);
            p.rect(off, sy, p.width, sh);
            p.fill(0, 0, 0, p.random(40, 100) * t);
            p.rect(-off * 0.4, sy, p.width, sh * 0.5);
          }

          const bursts = Math.floor(p.random(40, 140) * t);
          for (let i = 0; i < bursts; i++) {
            const v = p.random(140, 255);
            p.fill(v, v, v, p.random(40, 130));
            p.ellipse(p.random(p.width), p.random(p.height), p.random(1, 3.5));
          }

          const blocks = Math.floor(p.random(2, 6));
          for (let i = 0; i < blocks; i++) {
            const v = p.random() < 0.5 ? 255 : 0;
            p.fill(v, v, v, p.random(30, 90) * t);
            p.rect(p.random(p.width), p.random(p.height), p.random(10, 140), p.random(3, 22));
          }
        }

        // scroll listener — stored so we can clean it up
        let scrollHandler: () => void;

        p.setup = () => {
          const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
          cnv.style('position', 'fixed');
          cnv.style('top', '0');
          cnv.style('left', '0');
          cnv.style('z-index', '-1');
          cnv.style('pointer-events', 'none');
          p.noStroke();
          spawnAll();

          scrollHandler = () => {
            if (!glitching) {
              glitching   = true;
              glitchTimer = GLITCH_DUR;
              starOpacity = 1;
            }
          };
          window.addEventListener('scroll', scrollHandler, { passive: true });
        };

        p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

        p.draw = () => {
          p.background(0);
          noiseZ += 0.0008;

          if (glitching) {
            glitchTimer--;
            starOpacity = Math.max(0, starOpacity - 0.15);
            runGlitch();
            if (glitchTimer <= 0) {
              glitching   = false;
              regenning   = true;
              regenTimer  = REGEN_DUR;
              starOpacity = 0;
              spawnAll();
            }
          }

          if (regenning) {
            regenTimer--;
            starOpacity = 1 - regenTimer / REGEN_DUR;
            if (regenTimer <= 0) { regenning = false; starOpacity = 1; }
          }

          if (starOpacity > 0)
            for (const particle of particles) particle.run(starOpacity);
        };

        // expose cleanup hook on the sketch so remove() tears down the listener
        (p as any)._scrollHandler = () => scrollHandler;
      };

      if (containerRef.current) {
        p5Instance = new p5(sketch, containerRef.current);
      }
    });

    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, zIndex: -1 }}
    />
  );
}