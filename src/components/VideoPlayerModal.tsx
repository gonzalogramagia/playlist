// Archivo eliminado. Componente ya no es necesario.
import { X } from "lucide-react";
import { Video } from "../contexts/video-context";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface VideoPlayerModalProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayerModal({
  video,
  onClose,
}: VideoPlayerModalProps) {
  if (!video.embedUrl) return null;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <iframe
          src={`${video.embedUrl}?autoplay=1`}
          title={video.name}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>,
    document.body,
  );
}
