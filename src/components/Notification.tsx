import cn from "@/app/utils/cn";
import {
  useNotification,
  Notification,
} from "@/providers/NotificationProvider";
import { useEffect } from "react";

export default function NotificationComponent({
  id,
  message,
  type = "info",
  duration,
}: Notification) {
  const { removeNotification } = useNotification();

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      removeNotification(id);
    }, duration);

    return () => {
      clearInterval(timer);
    };
  }, [id, duration, removeNotification]);

  return (
    <div
      className={cn(
        " border  shadow p-4 py-2 rounded text-sm",
        type === "info" && "border-blue-300 bg-blue-200",
        type === "success" && "border-green-300 bg-green-100",
        type === "error" && "border-red-300 bg-red-100"
      )}
    >
      {message}
    </div>
  );
}
