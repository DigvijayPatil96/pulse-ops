import React, { useEffect, useRef } from 'react';

export const VitalsLiveWave = ({ heartRate = 75, isAbnormal = false, height = 48 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let x = 0;
    const width = canvas.width;
    const h = canvas.height;
    const midY = h / 2;

    // ECG wave buffer
    const points = [];
    for (let i = 0; i < width; i++) {
      points.push(midY);
    }

    let phase = 0;
    const speed = Math.max(1, Math.min(3, heartRate / 45));

    const render = () => {
      // Clear canvas with subtle trail
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, h);

      // Generate ECG waveform cycle
      phase = (phase + speed) % 100;
      let y = midY;

      // P wave
      if (phase >= 15 && phase < 25) {
        y = midY - Math.sin(((phase - 15) / 10) * Math.PI) * 4;
      }
      // Q dip
      else if (phase >= 32 && phase < 35) {
        y = midY + 4;
      }
      // R spike
      else if (phase >= 35 && phase < 40) {
        y = midY - (h * 0.42);
      }
      // S dip
      else if (phase >= 40 && phase < 44) {
        y = midY + (h * 0.25);
      }
      // T wave
      else if (phase >= 55 && phase < 70) {
        y = midY - Math.sin(((phase - 55) / 15) * Math.PI) * 7;
      }

      points[x] = y;

      // Draw the wave
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isAbnormal ? '#EF4444' : (heartRate > 100 ? '#F59E0B' : '#06B6D4');
      ctx.shadowColor = isAbnormal ? '#EF4444' : '#06B6D4';
      ctx.shadowBlur = 4;

      for (let i = 0; i < width; i++) {
        const ptX = i;
        const ptY = points[i];
        if (i === 0) ctx.moveTo(ptX, ptY);
        else ctx.lineTo(ptX, ptY);
      }
      ctx.stroke();

      // Leading scan cursor
      ctx.beginPath();
      ctx.arc(x, points[x], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFFFFF';
      ctx.fill();

      x = (x + 1) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, isAbnormal]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-slate-950/80 border border-slate-800/80 p-1">
      <canvas
        ref={canvasRef}
        width={240}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
