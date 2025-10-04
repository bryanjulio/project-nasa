"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTabletRouter } from "./TabletContext";
import AppsScreen from "../screens/AppsScreen";
import ChatScreen from "../screens/ChatScreen";
import SettingsScreen from "../screens/SettingsScreen";

const screens = {
  apps: AppsScreen,
  chat: ChatScreen,
  settings: SettingsScreen,
};

export default function TabletRouter() {
  const { currentScreen } = useTabletRouter();
  const CurrentScreen = screens[currentScreen];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <CurrentScreen />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
