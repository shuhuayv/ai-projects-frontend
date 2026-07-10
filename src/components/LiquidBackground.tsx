import React, { useEffect, useRef } from 'react';

export interface LiquidBackgroundProps {
  /** 星点密度上限（默认 240），性能守卫。 */
  maxParticles?: number;
}

type Layer = 'far' | 'middle' | 'bright';

interface Star {
  x: number;
  y: number;
  baseR: number;
  baseAlpha: number;
  twPhase: number;
  twSpeed: number;
  driftX: number;
  driftY: number;
  wob: number;
  layer: Layer;
}

interface Meteor {
  x: number;
  y: number;
  len: number;
  speed: number;
  life: number;
  maxLife: number;
  alpha: number;
  delay: number; // 出生延迟（秒，按帧近似）
  dx: number;
  dy: number;
}

// 流星方向：左上 → 右下，约 32°。
const METEOR_ANGLE = (32 * Math.PI) / 180;
const SPAWN_CHANCE = 0.004; // 每帧生成期望 ~ 每 4s 一条
const MAX_METEORS = 3;

export function LiquidBackground({ maxParticles = 240 }: LiquidBackgroundProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let start = performance.now();
    let stars: Star[] = [];
    let meteors: Meteor[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const makeStar = (layer: Layer, w: number, h: number): Star => {
      switch (layer) {
        case 'far':
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            baseR: rand(0.5, 1.0),
            baseAlpha: rand(0.22, 0.45),
            twPhase: Math.random() * Math.PI * 2,
            twSpeed: rand(0.05, 0.15), // 极慢呼吸
            driftX: 0.03 * (0.6 + Math.random() * 0.8),
            driftY: 0.015 * (0.6 + Math.random() * 0.8),
            wob: rand(0.05, 0.15),
            layer,
          };
        case 'middle':
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            baseR: rand(1.0, 1.9),
            baseAlpha: rand(0.4, 0.72),
            twPhase: Math.random() * Math.PI * 2,
            twSpeed: rand(0.3, 0.9), // 明显闪烁
            driftX: 0.05 * (0.6 + Math.random() * 0.8),
            driftY: 0.025 * (0.6 + Math.random() * 0.8),
            wob: rand(0.1, 0.3),
            layer,
          };
        case 'bright':
        default:
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            baseR: rand(1.9, 2.8),
            baseAlpha: rand(0.72, 1.0), // 带柔和光晕
            twPhase: Math.random() * Math.PI * 2,
            twSpeed: rand(0.15, 0.5),
            driftX: 0.04 * (0.6 + Math.random() * 0.8),
            driftY: 0.02 * (0.6 + Math.random() * 0.8),
            wob: rand(0.08, 0.2),
            layer,
          };
      }
    };

    const spawnMeteor = (w: number, h: number): Meteor => {
      const dx = Math.cos(METEOR_ANGLE);
      const dy = Math.sin(METEOR_ANGLE);
      // 出生点：沿顶部或左侧边缘，偏向左上。
      const fromLeft = Math.random() < 0.5;
      const x = fromLeft ? rand(-100, 0) : rand(0, w * 0.6);
      const y = fromLeft ? rand(0, h * 0.4) : rand(-100, 0);
      return {
        x,
        y,
        len: rand(80, 180),
        speed: rand(4, 9),
        life: 0,
        maxLife: rand(70, 130),
        alpha: rand(0.5, 0.95),
        delay: rand(0, 2.5),
        dx,
        dy,
      };
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(maxParticles, Math.floor((w * h) / 9000));
      const farCount = Math.round(density * 0.62);
      const middleCount = Math.round(density * 0.3);
      const brightCount = Math.max(4, Math.min(7, Math.round(density * 0.04)));

      stars = [];
      for (let i = 0; i < farCount; i++) stars.push(makeStar('far', w, h));
      for (let i = 0; i < middleCount; i++) stars.push(makeStar('middle', w, h));
      for (let i = 0; i < brightCount; i++) stars.push(makeStar('bright', w, h));
      meteors = [];
    };

    const drawStar = (s: Star, t: number, w: number, h: number) => {
      // 漂浮 + 呼吸（不似下雪：漂移极小、方向统一缓慢）。
      s.x += s.driftX + Math.sin(t * 0.3 + s.twPhase) * s.wob;
      s.y += s.driftY + Math.cos(t * 0.25 + s.twPhase) * s.wob;
      const margin = 40;
      if (s.x < -margin) s.x = w + margin;
      if (s.x > w + margin) s.x = -margin;
      if (s.y < -margin) s.y = h + margin;
      if (s.y > h + margin) s.y = -margin;

      const alpha = s.baseAlpha * (0.62 + 0.38 * Math.sin(t * s.twSpeed + s.twPhase));
      const r = s.baseR;

      if (s.layer === 'bright') {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
        g.addColorStop(0, `rgba(244,246,255,${alpha})`);
        g.addColorStop(0.4, `rgba(200,215,255,${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(160,190,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(244,246,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawMeteors = (w: number, h: number) => {
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (m.delay > 0) {
          m.delay -= 1 / 60; // 按帧近似延迟
          continue;
        }
        m.x += m.dx * m.speed;
        m.y += m.dy * m.speed;
        m.life++;

        const tailX = m.x - m.dx * m.len;
        const tailY = m.y - m.dy * m.len;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(244,246,255,${m.alpha})`);
        grad.addColorStop(0.4, `rgba(190,215,255,${m.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(150,200,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(180,200,255,0.8)';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 头部亮点
        ctx.fillStyle = `rgba(244,246,255,${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        if (m.x > w + 120 || m.y > h + 120 || m.life > m.maxLife) {
          meteors.splice(i, 1);
        }
      }
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) drawStar(s, t, w, h);

      // 流星生成（克制：同屏 0–3 条）。
      if (meteors.length < MAX_METEORS && Math.random() < SPAWN_CHANCE) {
        meteors.push(spawnMeteor(w, h));
      }
      drawMeteors(w, h);

      raf = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const r = s.baseR;
        if (s.layer === 'bright') {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
          g.addColorStop(0, `rgba(244,246,255,${s.baseAlpha})`);
          g.addColorStop(1, 'rgba(160,190,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(244,246,255,${s.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        start = performance.now(); // 避免隐藏期间时间累积造成跳变
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    if (reduce) {
      drawStatic(); // reduced-motion：仅一帧静态星点，不画流星，不启动 rAF
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [maxParticles]);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background:
            'radial-gradient(900px 520px at 12% -8%, rgba(113,70,167,0.32), transparent 60%),' +
            'radial-gradient(1200px 760px at 52% 42%, rgba(38,62,137,0.30), transparent 66%),' +
            'radial-gradient(900px 640px at 90% 108%, rgba(179,90,155,0.20), transparent 60%),' +
            'radial-gradient(680px 480px at 78% 14%, rgba(76,123,217,0.18), transparent 55%),' +
            '#07091A',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
      />
    </>
  );
}
