"use client";

import { ArrowLeft } from "lucide-react";
import { useTabletRouter } from "../tablet/TabletContext";
import MarsMap2D from "../mars-2d";

export default function MarsMapScreen() {
  const { goTo } = useTabletRouter();

  return (
    <div className="w-full h-full flex flex-col bg-black rounded-2xl overflow-hidden relative">
      {/* Header flutuante */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 p-4 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
        <button
          onClick={() => goTo("apps")}
          className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors backdrop-blur-sm"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <h2 className="text-xl font-semibold text-white">Mars Surface Map</h2>
      </div>

      {/* Conteúdo em tela cheia */}
      <div className="flex-1 w-full h-full">
        <MarsMap2D />
      </div>
    </div>
  );
}
