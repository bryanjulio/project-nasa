// Exemplo de como implementar notificações no futuro by: gepeto

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Mission Update",
      message: "Rover has reached new location",
      type: "info",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "2",
      title: "System Alert",
      message: "Temperature sensors nominal",
      type: "success",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "3",
      title: "New Message",
      message: "Message from Mission Control",
      type: "info",
      timestamp: new Date(),
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}

// COMO USAR:
//
// 1. Envolver app com NotificationProvider (em page.tsx):
//    <NotificationProvider>
//      <TabletProvider>
//        ...
//      </TabletProvider>
//    </NotificationProvider>
//
// 2. No Tablet.tsx, substituir o badge fixo "3" por:
//    const { unreadCount } = useNotifications();
//    {unreadCount > 0 && (
//      <div className="...">
//        {unreadCount}
//      </div>
//    )}
//
// 3. Criar NotificationsScreen.tsx para exibir lista de notificações
//
// 4. Adicionar ao TabletRouter:
//    const screens = {
//      apps: AppsScreen,
//      notifications: NotificationsScreen, // ← Nova tela
//      ...
//    };
