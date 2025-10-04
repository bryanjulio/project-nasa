"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  prevX?: number;
  prevY?: number;
  driftX: number;
  driftY: number;
}

interface StarfieldAnimationProps {
  duration?: number; // Duration in seconds, undefined = infinite
}

export default function StarfieldAnimation({
  duration,
}: StarfieldAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startTime = Date.now();
    let shouldStop = false;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star field configuration
    const numStars = 400;
    const stars: Star[] = [];
    const speed = 0.05;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const fadeDuration = 2; // seconds for fade out effect

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width,
        driftX: (Math.random() - 0.5) * 2,
        driftY: (Math.random() - 0.5) * 2,
      });
    }

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      let fadeOpacity = 1;
      if (duration !== undefined) {
        const elapsed = (Date.now() - startTime) / 1000;

        // Start fading out in the last fadeDuration seconds
        if (elapsed >= duration - fadeDuration) {
          const fadeProgress =
            (elapsed - (duration - fadeDuration)) / fadeDuration;
          fadeOpacity = 1 - fadeProgress;
        }

        if (elapsed >= duration) {
          shouldStop = true;
          ctx.fillStyle = "rgba(0, 0, 0, 1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return;
        }
      }

      // Create motion blur effect with semi-transparent black
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach((star) => {
        // Store previous position for trail effect
        star.prevX = (star.x / star.z) * canvas.width + centerX;
        star.prevY = (star.y / star.z) * canvas.height + centerY;

        // Move star closer (decrease z)
        star.z -= speed * canvas.width;

        star.x += star.driftX;
        star.y += star.driftY;

        // Reset star if it goes past the camera
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.prevX = undefined;
          star.prevY = undefined;
          star.driftX = (Math.random() - 0.5) * 2;
          star.driftY = (Math.random() - 0.5) * 2;
        }

        // Calculate 2D position from 3D coordinates
        const x = (star.x / star.z) * canvas.width + centerX;
        const y = (star.y / star.z) * canvas.height + centerY;

        // Calculate star size based on distance (closer = bigger)
        const size = (1 - star.z / canvas.width) * 3;

        // Calculate brightness based on distance
        const brightness = 1 - star.z / canvas.width;

        if (star.prevX !== undefined && star.prevY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(star.prevX, star.prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${
            brightness * 0.8 * fadeOpacity
          })`;
          ctx.lineWidth = size;
          ctx.stroke();
        }
      });

      if (!shouldStop) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-label="Animação de estrelas no espaço"
    />
  );
}
