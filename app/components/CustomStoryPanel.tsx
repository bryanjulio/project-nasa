"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Thermometer,
  Mountain,
  X,
} from "lucide-react";
import { useMarsCoordinates } from "../hooks/useMarsCoordinates";

interface Step {
  step: number;
  title: string;
  description: string;
  details?: string;
}

interface MarsStory {
  id: string;
  name: string;
  type: "volcano" | "canyon" | "ice_cap" | "biosignature" | "planet";
  description?: string;
  location?: string;
  coordinates?: string;
  discovery?: string;
  facts?: Record<string, string>;
  steps: Step[];
  scientific_significance?: string;
  exploration_missions?: string[];
}

const useMarsStories = () => {
  const [marsStories, setMarsStories] = useState<MarsStory[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { marsStories, loading };
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "volcano":
      return <Mountain className="w-5 h-5 text-red-400" />;
    case "canyon":
      return <MapPin className="w-5 h-5 text-orange-400" />;
    case "ice_cap":
      return <Thermometer className="w-5 h-5 text-blue-400" />;
    case "biosignature":
      return <MapPin className="w-5 h-5 text-green-400" />;
    case "planet":
      return <MapPin className="w-5 h-5 text-purple-400" />;
    default:
      return <MapPin className="w-5 h-5 text-gray-400" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "volcano":
      return "from-red-500/20 to-red-600/20 border-red-400/30";
    case "canyon":
      return "from-orange-500/20 to-orange-600/20 border-orange-400/30";
    case "ice_cap":
      return "from-blue-500/20 to-blue-600/20 border-blue-400/30";
    case "biosignature":
      return "from-green-500/20 to-green-600/20 border-green-400/30";
    case "planet":
      return "from-purple-500/20 to-purple-600/20 border-purple-400/30";
    default:
      return "from-gray-500/20 to-gray-600/20 border-gray-400/30";
  }
};

function CustomStoryPanelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { marsStories, loading } = useMarsStories();
  const { setCoordinate } = useMarsCoordinates();

  const storyId = searchParams.get("story");
  const stepParam = searchParams.get("step");
  const coordinateParam = searchParams.get("coordinate");

  const story = marsStories.find((s) => s.id === storyId);
  const isOpen = Boolean(storyId);

  useEffect(() => {
    if (stepParam) {
      const stepNumber = parseInt(stepParam);
      if (stepNumber >= 1 && stepNumber <= (story?.steps.length || 1)) {
        setCurrentStep(stepNumber);
      }
    } else {
      setCurrentStep(1);
    }
  }, [stepParam, story?.steps.length]);

  // Processar coordenadas da query string
  useEffect(() => {
    if (coordinateParam && story) {
      try {
        const coords = coordinateParam.split(",").map(Number);
        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const coordinate = {
            lat: coords[0],
            lon: coords[1],
            zoom: coords[2] || 1000000,
          };
          setCoordinate(coordinate);
        }
      } catch (error) {
        console.error("Error parsing coordinate parameter:", error);
      }
    } else if (story && story.coordinates) {
      try {
        const coords = story.coordinates.split(",").map(Number);
        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const coordinate = {
            lat: coords[0],
            lon: coords[1],
            zoom: 1000000,
          };
          setCoordinate(coordinate);
        }
      } catch (error) {
        console.error("Error parsing story coordinates:", error);
      }
    }
  }, [coordinateParam, story, setCoordinate]);

  const handleStepChange = (newStep: number) => {
    if (newStep < 1 || newStep > (story?.steps.length || 1)) return;

    setCurrentStep(newStep);

    const params = new URLSearchParams(searchParams);
    params.set("step", newStep.toString());
    router.replace(`?${params.toString()}`);
  };

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("story");
    params.delete("step");
    router.replace(`?${params.toString()}`);
  };

  if (!story) return null;

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md z-50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-l border-red-300/20 shadow-2xl shadow-red-500/10">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-red-200 via-orange-200 to-red-400 bg-clip-text text-transparent">
              Loading Mars Stories...
            </h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = story.steps.find((s) => s.step === currentStep);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md z-50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-l border-red-300/20 shadow-2xl shadow-red-500/10">
      {/* Glow externo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-400/20 blur-sm pointer-events-none" />

      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Botão de fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-lg p-2 opacity-70 transition-all hover:opacity-100 hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:ring-offset-2 focus:ring-offset-transparent z-10"
        >
          <X className="text-slate-200 hover:text-white size-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {getTypeIcon(story.type)}
            <h2 className="text-lg font-bold bg-gradient-to-r from-red-200 via-orange-200 to-red-400 bg-clip-text text-transparent">
              {story.name}
            </h2>
          </div>
          <p className="text-slate-300/90 text-sm">
            {story.description || "Mission progress and exploration steps"}
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Story Type Badge */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(
              story.type
            )} border`}
          >
            <span className="text-sm font-medium capitalize text-white">
              {story.type.replace("_", " ")}
            </span>
          </div>

          {/* Location and Discovery Info */}
          {(story.location || story.discovery) && (
            <div className="space-y-2">
              {story.location && (
                <div className="text-sm">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white ml-2">{story.location}</span>
                </div>
              )}
              {story.discovery && (
                <div className="text-sm">
                  <span className="text-slate-400">Discovered:</span>
                  <span className="text-white ml-2">{story.discovery}</span>
                </div>
              )}
            </div>
          )}

          {/* Key Facts */}
          {story.facts && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Key Facts</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(story.facts)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">
                        {key.replace("_", " ")}:
                      </span>
                      <span className="text-white text-right">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Current Step */}
          {currentStepData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Step {currentStepData.step}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepChange(currentStep - 1)}
                    disabled={currentStep === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepChange(currentStep + 1)}
                    disabled={currentStep === story.steps.length}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                <h4 className="font-semibold text-white mb-2">
                  {currentStepData.title}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {currentStepData.description}
                </p>
                {currentStepData.details && (
                  <div className="mt-3 pt-3 border-t border-slate-600/30">
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {currentStepData.details}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">
              Mission Progress
            </h4>
            <div className="space-y-2">
              {story.steps.map((step) => (
                <div
                  key={step.step}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    step.step === currentStep
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30"
                      : "bg-slate-700/30 hover:bg-slate-700/50"
                  }`}
                  onClick={() => handleStepChange(step.step)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.step <= currentStep
                        ? "bg-red-500 text-white"
                        : "bg-slate-600 text-slate-400"
                    }`}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        step.step === currentStep
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Significance */}
          {story.scientific_significance && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">
                Scientific Significance
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {story.scientific_significance}
              </p>
            </div>
          )}

          {/* Exploration Missions */}
          {story.exploration_missions &&
            story.exploration_missions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">
                  Exploration Missions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {story.exploration_missions
                    .slice(0, 4)
                    .map((mission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30"
                      >
                        {mission}
                      </span>
                    ))}
                  {story.exploration_missions.length > 4 && (
                    <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md border border-slate-600/30">
                      +{story.exploration_missions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function CustomStoryPanel() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md z-50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-l border-red-300/20 shadow-2xl shadow-red-500/10">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold bg-gradient-to-r from-red-200 via-orange-200 to-red-400 bg-clip-text text-transparent">
                Loading Mars Stories...
              </h2>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
            </div>
          </div>
        </div>
      }
    >
      <CustomStoryPanelContent />
    </Suspense>
  );
}
