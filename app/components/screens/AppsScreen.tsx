"use client";

import { useTabletRouter } from "../tablet/TabletContext";
import {
  MessageSquare,
  Settings,
  Globe,
  Map,
  Camera,
  FileText,
} from "lucide-react";

const apps = [
  {
    id: "chat",
    name: "Chat",
    icon: MessageSquare,
    color: "bg-blue-500/20 hover:bg-blue-500/30",
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    color: "bg-purple-500/20 hover:bg-purple-500/30",
  },
  {
    id: "mars",
    name: "Mars View",
    icon: Globe,
    color: "bg-red-500/20 hover:bg-red-500/30",
  },
  {
    id: "map",
    name: "Map",
    icon: Map,
    color: "bg-green-500/20 hover:bg-green-500/30",
  },
  {
    id: "camera",
    name: "Camera",
    icon: Camera,
    color: "bg-yellow-500/20 hover:bg-yellow-500/30",
  },
  {
    id: "docs",
    name: "Docs",
    icon: FileText,
    color: "bg-indigo-500/20 hover:bg-indigo-500/30",
  },
];

export default function AppsScreen() {
  const { goTo } = useTabletRouter();

  const handleAppClick = (appId: string) => {
    if (appId === "chat" || appId === "settings") {
      goTo(appId as "chat" | "settings");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* Grid de Apps */}
      <div className="flex flex-row gap-6 flex-1 content-start">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className={`${app.color} rounded-[35%/40%] size-16 p-6 flex flex-col items-center justify-center gap-4 border border-slate-600/30 transition-all duration-200 hover:scale-105 hover:border-slate-500/50`}
            >
              <Icon className="w-12 h-12 text-white" />
              <span className="text-white font-medium">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
