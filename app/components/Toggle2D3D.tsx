"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import MarsMap2D from "./mars-2d/MarsMap2D";

interface Toggle2D3DProps {
  onToggle: (mode: "2D" | "3D") => void;
  defaultMode?: "2D" | "3D";
  className?: string;
}

interface MarsStory {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  coordinates?: string;
  discovery?: string;
  facts?: Record<string, string>;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    details?: string;
  }>;
  scientific_significance?: string;
  exploration_missions?: string[];
}

export default function Toggle2D3D({
  onToggle,
  defaultMode = "3D",
  className,
}: Toggle2D3DProps) {
  const [activeMode, setActiveMode] = useState<"2D" | "3D">(defaultMode);
  const [marsStories, setMarsStories] = useState<MarsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Check if there's a 'story' query parameter in the URL
  const hasStoryParam = searchParams.get("story") !== null;
  const storyId = searchParams.get("story");

  // Load mars stories
  useEffect(() => {
    const fetchMarsStories = async () => {
      try {
        const response = await fetch("/mars-story.json");
        const data = await response.json();
        setMarsStories(data);
      } catch (error) {
        console.error("Error loading mars stories:", error);
        setMarsStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarsStories();
  }, []);

  // Get current story and its coordinates
  const currentStory = marsStories.find((s) => s.id === storyId);
  const storyCoordinates = currentStory?.coordinates
    ? currentStory.coordinates.split(",").map(Number)
    : null;

  // Log coordinates for debugging
  useEffect(() => {
    if (storyCoordinates && storyCoordinates.length >= 2) {
      console.log("📍 MarsMap2D Coordinates:", {
        latitude: storyCoordinates[0],
        longitude: storyCoordinates[1],
        storyId: storyId,
        storyName: currentStory?.name,
        rawCoordinates: currentStory?.coordinates,
      });
    }
  }, [
    storyCoordinates,
    storyId,
    currentStory?.name,
    currentStory?.coordinates,
  ]);

  const handleToggle = (mode: "2D" | "3D") => {
    setActiveMode(mode);
    onToggle(mode);
  };

  // Don't render if there's no 'story' query parameter
  if (!hasStoryParam) {
    return null;
  }

  return (
    <>
      {/* Toggle Controls */}
      <div
        className={cn(
          "fixed top-6 left-1/2 transform -translate-x-1/2 z-[60]",
          "backdrop-blur-md bg-white/10 border border-white/20",
          "rounded-full p-1 shadow-lg",
          "transition-all duration-300 ease-in-out",
          "hover:bg-white/15 hover:border-white/30",
          className
        )}
      >
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleToggle("2D")}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-white/30",
              activeMode === "2D"
                ? "text-white bg-white/20 shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="relative z-10">2D</span>
            {activeMode === "2D" && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 to-orange-500/30 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleToggle("3D")}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-white/30",
              activeMode === "3D"
                ? "text-white bg-white/20 shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="relative z-10">3D</span>
            {activeMode === "3D" && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 to-orange-500/30 animate-pulse" />
            )}
          </button>
        </div>

        {/* Glassmorphism effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 via-transparent to-orange-500/10 blur-sm pointer-events-none" />
      </div>

      {/* MarsMap2D - Render when in 2D mode and story is active */}
      {activeMode === "2D" && hasStoryParam && !loading && storyCoordinates && (
        <div className="fixed inset-0 z-30" style={{ marginRight: "448px" }}>
          <MarsMap2D
            latitude={storyCoordinates[0]}
            longitude={storyCoordinates[1]}
          />
        </div>
      )}
    </>
  );
}
