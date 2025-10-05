"use client";

import React, { useRef } from "react";

type Links = { github?: string; linkedin?: string; site?: string };

type Props = {
  name: string;
  role: string;
  avatarUrl: string;
  links?: Links;
  className?: string;
  maxTiltDeg?: number;
};

export default function SimpleProfileCard({
  name,
  role,
  avatarUrl,
  links,
  className = "",
  maxTiltDeg = 10,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const target = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });

  function animate() {
    const el = wrapperRef.current;
    if (!el) return;

    // aplica com uma leve inércia
    const s = el.style;
    s.setProperty("--rx", `${target.current.rx.toFixed(2)}deg`);
    s.setProperty("--ry", `${target.current.ry.toFixed(2)}deg`);
    s.setProperty("--tx", `${target.current.tx.toFixed(2)}px`);
    s.setProperty("--ty", `${target.current.ty.toFixed(2)}px`);

    rafRef.current = requestAnimationFrame(animate);
  }

  function onMove(e: React.MouseEvent) {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;  // 0..1

    const ry = (px - 0.5) * (maxTiltDeg * 2); // rotateY
    const rx = -(py - 0.5) * (maxTiltDeg * 2); // rotateX

    // deslocamento suave do conteúdo (parallax)
    const tx = (px - 0.5) * 8;
    const ty = (py - 0.5) * 8;

    target.current = { rx, ry, tx, ty };
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(animate);
  }

  function onLeave() {
    target.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
    // uma última animação para voltar ao zero
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(animate);
    // cancela o loop no próximo frame
    setTimeout(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, 120);
  }

  return (
    <div
      ref={wrapperRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative select-none [perspective:800px] ${className}`}
      style={
        {
          // defaults das CSS vars
          ["--rx" as any]: "0deg",
          ["--ry" as any]: "0deg",
          ["--tx" as any]: "0px",
          ["--ty" as any]: "0px",
        } as React.CSSProperties
      }
    >
      <div
        className={`
          relative grid aspect-[0.72] max-h-[540px] w-full place-items-center overflow-hidden
          rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-800
          shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-transform duration-200
          will-change-transform
          dark:from-neutral-900 dark:to-neutral-800
        `}
        style={{
          transform:
            "translateZ(0) rotateX(var(--rx)) rotateY(var(--ry))",
          transformStyle: "preserve-3d",
        }}
      >
        {/* plano “interno” para profundidade sutil */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            transform: "translateZ(30px)",
          }}
        />

        {/* Conteúdo */}
        <div
          className="relative z-10 flex h-full w-full flex-col items-center justify-start p-5"
          style={{
            transform: "translate3d(var(--tx), var(--ty), 40px)",
          }}
        >
          {/* Avatar grande */}
          <div className="relative mt-6 h-40 w-40 overflow-hidden rounded-full border border-white/10 shadow">
            {/* imagem */}
            <img
              src={avatarUrl}
              alt={`${name} avatar`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          {/* Nome / cargo */}
          <div className="mt-5 text-center">
            <h3 className="text-2xl font-semibold text-white">{name}</h3>
            <p className="mt-1 text-sm text-white/70">{role}</p>
          </div>

          {/* Links */}
          {(links?.github || links?.linkedin || links?.site) && (
            <div className="mt-5 flex items-center gap-3">
              {links?.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:border-white/30 hover:bg-white/5"
                >
                  GitHub
                </a>
              )}
              {links?.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:border-white/30 hover:bg-white/5"
                >
                  LinkedIn
                </a>
              )}
              {links?.site && (
                <a
                  href={links.site}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:border-white/30 hover:bg-white/5"
                >
                  Site
                </a>
              )}
            </div>
          )}
        </div>

        {/* barra de info inferior (igual ao original em espírito, sem neon) */}
        <div
          className="pointer-events-auto absolute inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10">
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-medium text-white/90">@{name.replace(/\s+/g, "").toLowerCase()}</div>
              <div className="text-[12px] text-white/60">{role}</div>
            </div>
          </div>
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/5"
            >
              Contato
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
