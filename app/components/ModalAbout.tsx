"use client";

import { useEffect } from "react";

type ModalAboutProps = {
  open: boolean;
  onClose: () => void;
  maxWidth?: string; 
  children: React.ReactNode;
};

export default function ModalAbout({
  open,
  onClose,
  maxWidth = "max-w-3xl",
  children,
}: ModalAboutProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onEsc = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sobre o Projeto"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={onEsc}
      onClick={onBackdrop}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl border border-white/10 bg-white text-black shadow-2xl
                    dark:bg-neutral-900 dark:text-white flex flex-col max-h-[90vh]`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-sm opacity-70 hover:opacity-100
                     focus:outline-none focus-visible:ring"
        >
          ✕
        </button>

        <div
          className="overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400/40 scrollbar-track-transparent
                     dark:scrollbar-thumb-gray-600/40"
        >
          {children}
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-neutral-900" />
      </div>
    </div>
  );
}
