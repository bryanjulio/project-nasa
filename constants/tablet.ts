export const TABLET_CONFIG = {
  dimensions: {
    maxWidth: "1400px",
    maxHeight: "900px",
    padding: "2rem",
  },
  minimized: {
    width: "96px",
    height: "96px",
  },
  animations: {
    expandDuration: 0.5,
    screenTransitionDuration: 0.3,
    easing: [0.43, 0.13, 0.23, 0.96],
  },
  visual: {
    backgroundOpacity: 0.8,
    backdropBlur: "xl",
  },
  colors: {
    primary: "slate",
    accent: "blue",
    notification: "red",
  },
  defaultScreen: "apps" as const,
};

export const APP_COLORS = {
  chat: "bg-blue-500/20 hover:bg-blue-500/30",
  settings: "bg-purple-500/20 hover:bg-purple-500/30",
  mars: "bg-red-500/20 hover:bg-red-500/30",
  map: "bg-green-500/20 hover:bg-green-500/30",
  camera: "bg-yellow-500/20 hover:bg-yellow-500/30",
  docs: "bg-indigo-500/20 hover:bg-indigo-500/30",
} as const;

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    sender: "Mission Control",
    text: "Welcome to Mars Base Alpha",
    time: "10:30",
  },
  {
    id: 2,
    sender: "You",
    text: "Status report?",
    time: "10:31",
  },
  {
    id: 3,
    sender: "Mission Control",
    text: "All systems nominal. Rover operational.",
    time: "10:32",
  },
];

export const DEVICE_INFO = {
  model: "NASA Tablet Pro",
  version: "Mars OS 2.0",
  mission: "Mars Exploration",
};
