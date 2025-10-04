"use client";

import { useState, useEffect, useRef } from "react";

// Custom CSS for 3D planet effects
const planetStyles = `
  @keyframes planetRotate {
    0% { transform: rotateY(0deg) rotateX(15deg) rotateZ(0deg); }
    25% { transform: rotateY(90deg) rotateX(15deg) rotateZ(5deg); }
    50% { transform: rotateY(180deg) rotateX(15deg) rotateZ(0deg); }
    75% { transform: rotateY(270deg) rotateX(15deg) rotateZ(-5deg); }
    100% { transform: rotateY(360deg) rotateX(15deg) rotateZ(0deg); }
  }
  
  @keyframes moonOrbit {
    0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
  }
  
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes atmosphericGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  @keyframes planetPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  /* Page Load Animations */
  @keyframes planetArrival {
    0% { 
      transform: translateY(100px) scale(0.3) rotateY(180deg);
      opacity: 0;
    }
    30% { 
      transform: translateY(20px) scale(0.8) rotateY(90deg);
      opacity: 0.7;
    }
    60% { 
      transform: translateY(-10px) scale(1.1) rotateY(0deg);
      opacity: 0.9;
    }
    80% { 
      transform: translateY(5px) scale(0.95) rotateY(0deg);
      opacity: 1;
    }
    100% { 
      transform: translateY(0) scale(1) rotateY(0deg);
      opacity: 1;
    }
  }
  
  @keyframes moonArrival {
    0% { 
      transform: translateX(-50px) translateY(-50px) scale(0);
      opacity: 0;
    }
    50% { 
      transform: translateX(-30px) translateY(-30px) scale(0.5);
      opacity: 0.5;
    }
    100% { 
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes starsAppear {
    0% { 
      opacity: 0; 
      transform: scale(0) rotate(180deg);
    }
    50% { 
      opacity: 0.5; 
      transform: scale(0.5) rotate(90deg);
    }
    100% { 
      opacity: 1; 
      transform: scale(1) rotate(0deg);
    }
  }
  
  @keyframes ringsAppear {
    0% { 
      opacity: 0; 
      transform: scale(0.5) rotate(180deg);
    }
    30% { 
      opacity: 0.3; 
      transform: scale(0.8) rotate(90deg);
    }
    60% { 
      opacity: 0.6; 
      transform: scale(1.1) rotate(45deg);
    }
    100% { 
      opacity: 1; 
      transform: scale(1) rotate(0deg);
    }
  }
  
  @keyframes atmosphericEntry {
    0% { 
      opacity: 0; 
      transform: scale(0.3);
      filter: blur(20px);
    }
    50% { 
      opacity: 0.5; 
      transform: scale(0.8);
      filter: blur(10px);
    }
    100% { 
      opacity: 1; 
      transform: scale(1);
      filter: blur(0px);
    }
  }
  
  @keyframes containerEntrance {
    0% { 
      opacity: 0; 
      transform: translateX(100px) scale(0.8);
    }
    50% { 
      opacity: 0.7; 
      transform: translateX(20px) scale(0.9);
    }
    100% { 
      opacity: 1; 
      transform: translateX(0) scale(1);
    }
  }
  
  @keyframes warpSpeed {
    0% { 
      opacity: 0; 
      transform: scale(0.1) rotate(0deg);
      filter: blur(50px) brightness(2);
    }
    20% { 
      opacity: 0.3; 
      transform: scale(0.3) rotate(72deg);
      filter: blur(30px) brightness(1.5);
    }
    40% { 
      opacity: 0.6; 
      transform: scale(0.6) rotate(144deg);
      filter: blur(20px) brightness(1.2);
    }
    60% { 
      opacity: 0.8; 
      transform: scale(0.8) rotate(216deg);
      filter: blur(10px) brightness(1.1);
    }
    80% { 
      opacity: 0.9; 
      transform: scale(0.95) rotate(288deg);
      filter: blur(5px) brightness(1.05);
    }
    100% { 
      opacity: 1; 
      transform: scale(1) rotate(360deg);
      filter: blur(0px) brightness(1);
    }
  }
  
  .planet-3d {
    animation: planetRotate 25s linear infinite, planetArrival 2.5s ease-out;
    transform-style: preserve-3d;
  }
  
  .moon-orbit {
    animation: moonArrival 3s ease-out 0.5s both, moonOrbit 8s linear infinite 3.5s;
  }
  
  .star-twinkle {
    animation: starTwinkle 3s ease-in-out infinite, starsAppear 2s ease-out;
  }
  
  .atmospheric-glow {
    animation: atmosphericGlow 4s ease-in-out infinite, atmosphericEntry 2s ease-out 1s both;
  }
  
  .planet-pulse {
    animation: planetPulse 6s ease-in-out infinite;
  }
  
  .orbital-rings {
    animation: ringsAppear 2.5s ease-out 1.5s both;
  }
  
  .container-entrance {
    animation: containerEntrance 1.5s ease-out;
  }
  
  .warp-speed {
    animation: warpSpeed 3s ease-out;
  }
  
  @keyframes particleTrail {
    0% { 
      opacity: 0; 
      transform: translateX(-100px) scale(0);
    }
    20% { 
      opacity: 1; 
      transform: translateX(-50px) scale(0.5);
    }
    80% { 
      opacity: 0.8; 
      transform: translateX(50px) scale(1);
    }
    100% { 
      opacity: 0; 
      transform: translateX(100px) scale(0);
    }
  }
  
  .particle-trail {
    animation: particleTrail 2s ease-out infinite;
  }
  
  .planet-surface {
    background: 
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(0,0,0,0.4) 0%, transparent 40%),
      radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 0%, transparent 30%),
      linear-gradient(135deg, #dc2626 0%, #ea580c 20%, #b91c1c 40%, #991b1b 60%, #7c2d12 80%, #92400e 100%);
  }
  
  .planet-shadow {
    box-shadow: 
      inset -15px -15px 30px rgba(0,0,0,0.5),
      inset 15px 15px 30px rgba(255,255,255,0.1),
      0 0 40px rgba(220, 38, 38, 0.4),
      0 10px 20px rgba(0,0,0,0.4);
  }
  
  /* Staggered star animations */
  .star-1 { animation-delay: 0.2s; }
  .star-2 { animation-delay: 0.4s; }
  .star-3 { animation-delay: 0.6s; }
  .star-4 { animation-delay: 0.8s; }
  .star-5 { animation-delay: 1.0s; }
  .star-6 { animation-delay: 1.2s; }
  .star-7 { animation-delay: 1.4s; }
  .star-8 { animation-delay: 1.6s; }
`;

interface AISearchModalProps {
  isOpen: boolean;
}

export default function AISearchModal({ isOpen }: AISearchModalProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hasWarpSpeedAnimated, setHasWarpSpeedAnimated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);

    // Remove warp speed animation after it completes (3s duration + small buffer)
    const warpSpeedTimer = setTimeout(() => {
      setHasWarpSpeedAnimated(true);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(warpSpeedTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse("");
    setError(null);

    try {
      const response = await fetch("/api/ai-detect-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get a response from the AI"
        );
      }

      const data = await response.json();
      setResponse(data.response);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResponse("");
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: planetStyles }} />
      <div
        className={`fixed bottom-6 right-6 z-50 ${
          hasAnimated ? "container-entrance" : "opacity-0"
        }`}
      >
        {!isExpanded ? (
          /* Minimized Version - 3D Planet with Orbiting Moon */
          <div className="relative">
            {/* Orbital Container */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Orbiting Mars Moon - Phobos/Deimos */}
              <div className="absolute inset-0 moon-orbit pointer-events-none">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full shadow-lg shadow-gray-400/50">
                    <div className="w-1 h-1 bg-gray-200 rounded-full absolute top-0.5 left-0.5"></div>
                    <div className="w-0.5 h-0.5 bg-gray-300 rounded-full absolute bottom-0.5 right-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Planet Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className={`relative w-16 h-16 rounded-full transition-all duration-500 hover:scale-110 group transform-gpu perspective-1000 planet-3d planet-pulse planet-surface planet-shadow ${
                  hasWarpSpeedAnimated ? "" : "warp-speed"
                }`}
                style={{ zIndex: 10 }}
              >
                {/* Planet Surface Details - Mars Features */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-red-300/40 to-orange-400/30 opacity-80 pointer-events-none"></div>

                {/* Martian Continental Features */}
                <div className="absolute top-2 left-3 w-3 h-2 bg-red-200/60 rounded-full transform rotate-12 pointer-events-none"></div>
                <div className="absolute bottom-3 right-2 w-2 h-1.5 bg-orange-200/50 rounded-full transform -rotate-12 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1 w-2 h-1 bg-amber-200/40 rounded-full transform rotate-45 pointer-events-none"></div>
                <div className="absolute top-1/3 right-1 w-1.5 h-1 bg-yellow-200/50 rounded-full transform -rotate-30 pointer-events-none"></div>
                <div className="absolute bottom-1/4 left-2 w-1.5 h-1 bg-red-300/40 rounded-full transform rotate-60 pointer-events-none"></div>

                {/* Dust Storm Bands */}
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-300/25 to-transparent rounded-full pointer-events-none"></div>
                <div className="absolute bottom-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-300/20 to-transparent rounded-full pointer-events-none"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent rounded-full pointer-events-none"></div>

                {/* Polar Ice Caps - Mars Style */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white/40 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-white/35 rounded-full pointer-events-none"></div>

                {/* Search Icon - 3D Effect */}
                <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
                  <div className="relative">
                    {/* Icon Shadow */}
                    <svg
                      className="absolute w-5 h-5 text-black/20 translate-x-0.5 translate-y-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {/* Main Icon */}
                    <svg
                      className="relative w-5 h-5 text-white/95 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Martian Atmospheric Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/25 via-orange-500/20 to-amber-600/25 rounded-full blur-sm atmospheric-glow pointer-events-none"></div>

                {/* 3D Highlights and Shadows */}
                <div className="absolute top-1 left-1 w-6 h-6 bg-white/25 rounded-full blur-sm pointer-events-none"></div>
                <div className="absolute top-2 left-2 w-3 h-3 bg-white/30 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-black/20 rounded-full blur-sm pointer-events-none"></div>

                {/* Specular Highlights */}
                <div className="absolute top-3 left-4 w-1 h-1 bg-white/60 rounded-full pointer-events-none"></div>
                <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-white/80 rounded-full pointer-events-none"></div>
              </button>

              {/* Orbital Rings - Mars Dust Rings */}
              <div
                className="absolute inset-0 border-2 border-red-400/30 rounded-full animate-spin orbital-rings pointer-events-none"
                style={{ animationDuration: "12s" }}
              ></div>
              <div
                className="absolute inset-1 border border-orange-400/25 rounded-full animate-spin orbital-rings pointer-events-none"
                style={{
                  animationDuration: "16s",
                  animationDirection: "reverse",
                }}
              ></div>
              <div
                className="absolute inset-2 border border-amber-400/15 rounded-full animate-spin orbital-rings pointer-events-none"
                style={{
                  animationDuration: "20s",
                }}
              ></div>
            </div>

            {/* Floating Stars - Mars Space Environment */}
            <div className="absolute -top-2 -left-2 w-1 h-1 bg-white rounded-full star-twinkle star-1 pointer-events-none"></div>
            <div className="absolute -top-1 -right-3 w-0.5 h-0.5 bg-red-300 rounded-full star-twinkle star-2 pointer-events-none"></div>
            <div className="absolute -bottom-2 -left-1 w-0.5 h-0.5 bg-orange-300 rounded-full star-twinkle star-3 pointer-events-none"></div>
            <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-amber-300 rounded-full star-twinkle star-4 pointer-events-none"></div>
            <div className="absolute -top-3 -right-1 w-0.5 h-0.5 bg-yellow-300 rounded-full star-twinkle star-5 pointer-events-none"></div>
            <div className="absolute -bottom-3 -right-3 w-0.5 h-0.5 bg-red-400 rounded-full star-twinkle star-6 pointer-events-none"></div>
            <div className="absolute -top-2 -right-4 w-0.5 h-0.5 bg-orange-400 rounded-full star-twinkle star-7 pointer-events-none"></div>
            <div className="absolute -bottom-4 -left-2 w-0.5 h-0.5 bg-amber-400 rounded-full star-twinkle star-8 pointer-events-none"></div>

            {/* Mars Dust Particles Trail */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-1/2 left-0 w-1 h-1 bg-red-400/60 rounded-full particle-trail"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-1/3 left-0 w-0.5 h-0.5 bg-orange-400/60 rounded-full particle-trail"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-2/3 left-0 w-0.5 h-0.5 bg-amber-400/60 rounded-full particle-trail"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/4 left-0 w-0.5 h-0.5 bg-yellow-400/60 rounded-full particle-trail"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>
          </div>
        ) : (
          /* Expanded Version - Full Modal */
          <div className="w-96 max-w-[calc(100vw-3rem)]">
            {/* Widget Container */}
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-sm" />

              {/* Compact Header */}
              <div className="relative flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-30 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      NASA AI
                    </h3>
                    <p className="text-xs text-slate-400">
                      Interstellar Search
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your cosmic query..."
                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                  >
                    {isLoading ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {query && (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors border border-slate-600/50 rounded-lg hover:bg-slate-700/30"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>

              {/* Response Area */}
              {(response || isLoading || error) && (
                <div className="px-4 pb-4">
                  <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-xl p-4 min-h-[200px] border border-slate-700/30">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-24">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="relative">
                            <svg
                              className="w-6 h-6 animate-spin text-cyan-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur animate-pulse" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Processing...</p>
                            <p className="text-xs text-slate-500">
                              Establishing connection
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          <span>MISSION: FAILED</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-slate-300 font-mono text-xs leading-relaxed">
                            {error}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span>MISSION: ACTIVE</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-slate-300 font-mono text-xs leading-relaxed">
                            {response}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-b-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>Click icon to minimize</span>
                  </div>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
                    NASA AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
