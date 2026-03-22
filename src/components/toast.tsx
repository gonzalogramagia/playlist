// Archivo eliminado. Componente ya no es necesario.
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss handled by context, but we handle exit animation here ideally
    // For simplicity in this step, we just render.
  }, []);

  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );

  return (
    <div
      onClick={onClose}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-full transition-all duration-300 transform cursor-pointer ${isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"}`}
    >
      {icon}
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
        {message}
      </span>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
