// Archivo eliminado. Componente ya no es necesario.
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  className?: string;
  onClose: () => void;
}

export function Toast({ message, type, className, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const isSuccess = type === "success";

  const icon =
    isSuccess ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );

  return (
    <div
      onClick={onClose}
      className={`fixed top-60 md:top-[14.5rem] ${className ? className : "left-1/2 md:left-[52%]"} -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 
        ${isSuccess 
          ? "bg-green-100/95 border-green-300/50 shadow-green-900/10" 
          : "bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800"
        } 
        backdrop-blur-md border shadow-2xl rounded-2xl transition-all duration-500 transform cursor-pointer 
        ${isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"}`}
    >
      {icon}
      <span className={`text-sm font-bold truncate max-w-[200px] sm:max-w-none ${isSuccess ? "text-green-800" : "text-zinc-800 dark:text-zinc-200"}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className={`ml-2 p-0.5 rounded-full transition-colors ${isSuccess ? "hover:bg-green-100 text-green-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
