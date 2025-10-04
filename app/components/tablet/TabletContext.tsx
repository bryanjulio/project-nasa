"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TabletScreen = "apps" | "chat" | "settings";

interface TabletContextType {
  currentScreen: TabletScreen;
  isExpanded: boolean;
  goTo: (screen: TabletScreen) => void;
  toggleExpanded: () => void;
  expand: () => void;
  minimize: () => void;
}

const TabletContext = createContext<TabletContextType | undefined>(undefined);

export function TabletProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<TabletScreen>("apps");
  const [isExpanded, setIsExpanded] = useState(false);

  const goTo = (screen: TabletScreen) => {
    setCurrentScreen(screen);
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const expand = () => {
    setIsExpanded(true);
  };

  const minimize = () => {
    setIsExpanded(false);
  };

  return (
    <TabletContext.Provider
      value={{
        currentScreen,
        isExpanded,
        goTo,
        toggleExpanded,
        expand,
        minimize,
      }}
    >
      {children}
    </TabletContext.Provider>
  );
}

export function useTabletRouter() {
  const context = useContext(TabletContext);
  if (!context) {
    throw new Error("useTabletRouter must be used within TabletProvider");
  }
  return context;
}
