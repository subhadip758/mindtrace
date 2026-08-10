import React, { useEffect, useRef } from 'react';

export const ThreeBrainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 3D Brain Particle Nodes in two hemispheres
    const numParticles = 140;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      ox: number;
      oy: number;
      oz: number;
      hemisphere: number;
      color: string;
      size: number;
    }> = [];

    const colors = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#f472b6'];

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 110 + Math.random() * 30;

      const hemi = i % 2 === 0 ? 1 : -1; // Left or Right hemisphere offset
      const ox = radius * Math.sin(phi) * Math.cos(theta) + hemi * 15;
      const oy = radius * Math.sin(phi) * Math.sin(theta) * 0.7; // Slightly flattened oval brain shape
      const oz = radius * Math.cos(phi);

      particles.push({
        x: ox,
        y: oy,
        z: oz,
        ox,
        oy,
        oz,
        hemisphere: hemi,
        color: colors[i % colors.length],
        size: Math.random() * 2.5 + 1.5
      });
    }

    let angleY = 0;
    let angleX = 0.2;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.0005;
      mouseY = (e.clientY - rect.top - height / 2) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleY += 0.008 + mouseX;
      angleX += mouseY * 0.1;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected: Array<{ x: number; y: number; z: number; size: number; color: string }> = [];

      // Rotate and project 3D points to 2D canvas space
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Y Rotation
        let x1 = p.ox * cosY - p.oz * sinY;
        let z1 = p.ox * sinY + p.oz * cosY;

        // 3D X Rotation
        let y1 = p.oy * cosX - z1 * sinX;
        let z2 = p.oy * sinX + z1 * cosX;

        // Perspective Projection
        const fov = 350;
        const scale = fov / (fov + z2);
        const projX = x1 * scale + width / 2;
        const projY = y1 * scale + height / 2;

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          size: p.size * scale,
          color: p.color
        });
      }

      // Draw Synaptic Neural Connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            const alpha = (1 - dist / 55) * 0.35;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw 3D Neural Nodes with Radial Glow
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] relative flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
