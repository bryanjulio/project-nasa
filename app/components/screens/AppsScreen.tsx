"use client";

import { useTabletRouter } from "../tablet/TabletContext";
import { MessageSquare, Settings, Globe } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface App {
  id: "chat" | "settings" | "marsmap";
  name: string;
  icon: LucideIcon;
  color: string;
}

const apps: App[] = [
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
    id: "marsmap",
    name: "Mars View",
    icon: Globe,
    color: "bg-red-500/20 hover:bg-red-500/30",
  },
];

export default function AppsScreen() {
  const { goTo } = useTabletRouter();

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex flex-row gap-6 flex-1 content-start">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => goTo(app.id)}
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
