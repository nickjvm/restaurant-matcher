import NotificationComponent from "@/components/Notification";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuid } from "uuid";

export type Notification = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
  duration?: number; // ms
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = uuid();
    setNotifications((prev) => [...prev, { ...notification, id }]);
    if (notification.duration) {
      setTimeout(() => removeNotification(id), notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationComponent {...notification} key={notification.id} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
