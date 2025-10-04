"use client";

import { useTabletRouter } from "../tablet/TabletContext";
import { ArrowLeft, Bell, Globe, Moon, Wifi, Battery } from "lucide-react";

const settingsItems = [
  { id: "notifications", name: "Notifications", icon: Bell, value: "On" },
  { id: "network", name: "Network", icon: Wifi, value: "Connected" },
  { id: "language", name: "Language", icon: Globe, value: "English" },
  { id: "theme", name: "Theme", icon: Moon, value: "Dark" },
  { id: "power", name: "Power", icon: Battery, value: "85%" },
];

export default function SettingsScreen() {
  const { goTo } = useTabletRouter();

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/40 rounded-2xl">
      <div className="flex items-center gap-4 p-4 border-b border-slate-700/50">
        <button
          onClick={() => goTo("apps")}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 transition-all duration-200"
              >
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-sm text-slate-400">{item.value}</p>
                </div>
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>
        <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <h3 className="text-white font-bold mb-4">Device Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Model</span>
              <span className="text-white">NASA Tablet Pro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-white">Mars OS 2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mission</span>
              <span className="text-white">Mars Exploration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
