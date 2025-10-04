"use client";

import { motion } from "framer-motion";
import { useTabletRouter } from "./TabletContext";
import TabletRouter from "./TabletRouter";
import { X, Minimize2, MessageCircle } from "lucide-react";

export default function Tablet() {
  const { isExpanded, expand, minimize } = useTabletRouter();

  return (
    <>
      {/* Tablet Minimizado */}
      <motion.div
        initial={false}
        animate={
          isExpanded
            ? {
                x: "-100%",
                y: "-100%",
                opacity: 0,
                scale: 0.8,
              }
            : {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }
        }
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="fixed bottom-0 right-0 z-50 cursor-pointer group"
        onClick={expand}
        style={{ pointerEvents: isExpanded ? "none" : "auto" }}
      >
        <div className="absolute inset-0 bg-neutral-500/20 rounded-tl-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative w-52 h-24 bg-gradient-to-br from-neutral-500/30 to-neutral-600/30 rounded-tl-3xl backdrop-blur-md border-l-2 border-t-2 border-neutral-600/50 shadow-2xl group-hover:border-neutral-500/50 transition-all duration-300">
          {/* Notificação */}
          <div className="absolute top-3 left-3">
            <MessageCircle
              className="animate-pulse text-white fill-white"
              size={16}
            />
          </div>
        </div>
      </motion.div>

      {/* Tablet Expandido */}
      <motion.div
        initial={false}
        animate={
          isExpanded
            ? {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }
            : {
                x: "100%",
                y: "100%",
                opacity: 0,
                scale: 0.8,
              }
        }
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="fixed top-4 left-4 z-50"
        style={{
          width: "calc(100vw - 2rem)",
          height: "calc(100vh - 2rem)",
          maxWidth: "1400px",
          maxHeight: "900px",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 rounded-3xl backdrop-blur-xl border-2 border-neutral-600/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-neutral-800/90 to-transparent border-b border-neutral-700/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-neutral-700 rounded-full" />
              <div className="w-8 h-2 bg-neutral-700/50 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={minimize}
                className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors"
                aria-label="Minimizar"
              >
                <Minimize2 className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          </div>
          {/* Tela */}
          <div className="absolute top-12 left-0 right-0 bottom-0 p-4">
            <TabletRouter />
          </div>
        </div>
      </motion.div>
    </>
  );
}
