import { useState, useMemo, useEffect, useRef } from "react";
import { useVideos, Video } from "../contexts/video-context";
import { useToast } from "../contexts/toast-context";
import { useLanguage } from "../contexts/language-context";
import { VideoForm } from "./video-form";
import VideoPlayerModal from "./VideoPlayerModal";
import {
  Search,
  SearchX,
  Plus,
  Pencil,
  Trash2,
  Hash,
  X,
  Check,
  Play,
  Pin,
  ShieldCheck,
  FileText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableVideoItem({
  id,
  children,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative ${!disabled ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {children}
    </div>
  );
}

function VideoNote({
  url,
  videos,
  updateNote,
  editable,
  language,
  fullWidth = false,
}: {
  url: string;
  videos: any[];
  updateNote: (idOrUrl: string, note: string) => void;
  editable: boolean;
  language: "es" | "en";
  fullWidth?: boolean;
}) {
  const [isManualExpanded, setIsManualExpanded] = useState(false);
  const [isXl, setIsXl] = useState(typeof window !== "undefined" ? window.innerWidth >= 1280 : true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => setIsXl(window.innerWidth >= 1280);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const videoInLibrary = (videos || []).find((v) => {
    if (!v || !v.url) return false;
    const vId = extractYoutubeId(v.url);
    const uId = extractYoutubeId(url);
    return (vId && uId && vId === uId) || v.url === url;
  });

  const note = videoInLibrary?.note || "";

  // Helper inside component to match context helper
  function extractYoutubeId(u: string): string | null {
    if (!u) return null;
    try {
      const uObj = new URL(u.startsWith("http") ? u : "https://" + u);
      if (
        uObj.hostname.includes("youtube.com") ||
        uObj.hostname.includes("youtu.be")
      ) {
        return uObj.searchParams.get("v") || uObj.pathname.split("/").pop() || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  const handleExpand = () => {
    if (!editable) return;
    setIsManualExpanded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsManualExpanded(false);
    }, 3000);
  };

  const shouldBeExpanded = editable && (note.length > 0 || isManualExpanded || !isXl);

  if (editable) {
    if (!shouldBeExpanded) {
      return (
        <button
          onClick={handleExpand}
          className="w-12 h-12 bg-white rounded-xl border-2 border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-[#6866D6] hover:border-[#6866D6]/30 hover:shadow-md transition-all group shrink-0 cursor-pointer pointer-events-auto"
          title={language === "es" ? "Escribir nota" : "Write note"}
        >
          <div className="flex items-center gap-0.5 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4 opacity-70" />
            <Pencil className="w-4 h-4" />
          </div>
        </button>
      );
    }

    return (
      <div className={`${fullWidth ? "w-full h-56" : "w-full xl:w-44 2xl:w-56 h-48 xl:h-64 2xl:h-80"} bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4 flex flex-col gap-2 overflow-hidden animate-in fade-in zoom-in ${fullWidth ? "slide-in-from-bottom-4" : "slide-in-from-right-4"} duration-300`}>
        <h4 className="font-bold text-gray-700 text-[11px] uppercase tracking-wider flex items-center justify-between gap-1.5 opacity-60">
          <div className="flex items-center gap-1.5">
            <Pencil className="w-3 h-3" />
            {language === "es" ? "Nota Editable" : "Editable Note"}
          </div>
          {note.length === 0 && (
             <div className="w-1.5 h-1.5 rounded-full bg-[#6866D6] animate-pulse" />
          )}
        </h4>
        <textarea
          autoFocus
          value={note}
          onChange={(e) => {
            updateNote(url, e.target.value);
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onBlur={() => {
             if (note.length === 0) setIsManualExpanded(false);
          }}
          placeholder={
            language === "es" ? "Escribe aquí..." : "Write here..."
          }
          className="flex-1 w-full bg-gray-50/30 rounded-xl p-3 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#6866D6] border border-gray-100 transition-all placeholder:text-neutral-400"
        />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 overflow-y-auto scrollbar-hide min-h-[5rem] group-hover:border-[#6866D6]/30 transition-colors">
      <h4 className="font-bold text-neutral-400 text-[8px] uppercase tracking-widest mb-1.5 line-clamp-1 opacity-50">
        {language === "es" ? "Vista de la Nota" : "Note View"}
      </h4>
      <p className="text-[10px] text-gray-500 leading-relaxed break-words line-clamp-4">
        {note}
      </p>
    </div>
  );
}

export function PlaylistBrowser() {
  const {
    videos,
    addVideo,
    updateVideo,
    deleteVideo,
    reorderVideos,
    updateNote,
  } = useVideos();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(
    undefined,
  );
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [confirmReplaceModal, setConfirmReplaceModal] = useState<{
    isOpen: boolean;
    videoId: string;
    pinPosition: number;
    pinUrl: string;
  } | null>(null);
  // Doble confirmación: 0 = nada, 1 = primer check, 2 = segundo check
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    step: 1 | 2 | 3;
  } | null>(null);
  const confirmDeleteTimeout = useRef<NodeJS.Timeout | null>(null);
  // Triple confirmación para eliminar video fijado
  const [confirmRemovePinned, setConfirmRemovePinned] = useState<
    1 | 2 | 3 | null
  >(null);
  const confirmRemovePinnedTimeout = useRef<NodeJS.Timeout | null>(null);
  const [hiddenTags, setHiddenTags] = useState<string[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState(
    "https://youtube.com/playlist?list=PL-0_mv1k_D3IR4LDICAe3TZH4xqCX9xsr",
  );
  const [isMobile, setIsMobile] = useState(false);
  const [pinUrl, setPinUrl] = useState("");

  const [pinnedVideos, setPinnedVideos] = useState<
    ({ url: string; name: string } | null)[]
  >([null, null, null, null]);
  const [pinPosition, setPinPosition] = useState(1); // 1-4
  const [isPinReset, setIsPinReset] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [pinnedHydrated, setPinnedHydrated] = useState(false);
  const pinUrlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setPinnedHydrated(false);

    const saved = localStorage.getItem(`config-pinned-videos_playlist`);
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normaliza y filtra duplicados por ID manteniendo posiciones
          const seen = new Set();
          const arr = [null, null, null, null];
          
          parsed.slice(0, 4).forEach((v: any, i: number) => {
            if (v && v.url) {
              const normalizedUrl = normalizeYoutubeUrl(v.url);
              const id = extractYoutubeId(normalizedUrl);
              if (id && !seen.has(id)) {
                seen.add(id);
                arr[i] = { ...v, url: normalizedUrl };
              }
            }
          });
          setPinnedVideos(arr);
        } else {
          setPinnedVideos([null, null, null, null]);
        }
      } catch {
        setPinnedVideos([null, null, null, null]);
      }
    } else {
      setPinnedVideos([null, null, null, null]);
    }
    setPinnedHydrated(true);
  }, []);

  useEffect(() => {
    if (!pinnedHydrated) return;
    localStorage.setItem(
      `config-pinned-videos_playlist`,
      JSON.stringify(pinnedVideos),
    );
  }, [pinnedVideos, pinnedHydrated]);

  useEffect(() => {
    if (!pinnedHydrated) return;
    localStorage.setItem(
      `config-pinned-focus-index_playlist`,
      String(focusIndex),
    );

  }, [focusIndex, pinnedHydrated]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load hidden tags and playlist URL scoped by interface mode
  useEffect(() => {
    const savedTags = localStorage.getItem(`config-hidden-tags_playlist`);
    const savedUrl = localStorage.getItem(`config-playlist-url_playlist`);

    if (savedTags) {
      try {
        setHiddenTags(JSON.parse(savedTags));
      } catch (e) {
        setHiddenTags([]);
      }
    } else {
      setHiddenTags([]);
    }

    if (savedUrl) {
      setPlaylistUrl(savedUrl);
    } else {
      setPlaylistUrl(
        "https://youtube.com/playlist?list=PL-0_mv1k_D3IR4LDICAe3TZH4xqCX9xsr",
      );
    }
  }, []);

  // Filter tags to exclude hidden ones
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    videos.filter(Boolean).forEach((video) => {
      if (!video || !Array.isArray(video.tags)) return;
      video.tags.forEach((tag) => {
        if (!hiddenTags.includes(tag)) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags).sort();
  }, [videos, hiddenTags]);

  // Filter videos based on search, active tag, and hidden tags
  const filteredVideos = useMemo(() => {
    const validVideos = videos.filter(Boolean);
    // First filter by hidden tags (hide song if all its tags are hidden? or if it matches a hidden tag?)
    // User said "ocultar tags y sus canciones".
    // Let's hide video if it has tags AND none of them are visible.
    const visibleVideos = validVideos.filter((video) => {
      if (!video || !Array.isArray(video.tags)) return false;
      if (video.tags.length === 0) return true; // No tags = visible
      return video.tags.some((tag) => !hiddenTags.includes(tag));
    });

    if (activeTag) {
      return visibleVideos.filter((video) => video.tags.includes(activeTag));
    }

    if (!search.trim()) return visibleVideos;

    const lowerSearch = search.toLowerCase();
    return visibleVideos.filter(
      (video) =>
        video.name.toLowerCase().includes(lowerSearch) ||
        video.tags.some((tag) => tag.toLowerCase().includes(lowerSearch)),
    );
  }, [videos, search, activeTag, hiddenTags]);

  // Reset active tag if it becomes hidden
  useEffect(() => {
    if (activeTag && hiddenTags.includes(activeTag)) {
      setActiveTag(null);
    }
  }, [hiddenTags, activeTag]);

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  // Elimina el video también de los pinnedVideos y localStorage
  const handleDelete = (id: string) => {
    if (!confirmDelete || confirmDelete.id !== id) {
      setConfirmDelete({ id, step: 1 });
      if (confirmDeleteTimeout.current)
        clearTimeout(confirmDeleteTimeout.current);
      confirmDeleteTimeout.current = setTimeout(
        () => setConfirmDelete(null),
        1500,
      );
    } else if (confirmDelete.step === 1) {
      setConfirmDelete({ id, step: 2 });
      if (confirmDeleteTimeout.current)
        clearTimeout(confirmDeleteTimeout.current);
      confirmDeleteTimeout.current = setTimeout(
        () => setConfirmDelete(null),
        1500,
      );
    } else if (confirmDelete.step === 2) {
      setConfirmDelete({ id, step: 3 });
      if (confirmDeleteTimeout.current)
        clearTimeout(confirmDeleteTimeout.current);
      confirmDeleteTimeout.current = setTimeout(
        () => setConfirmDelete(null),
        1500,
      );
    } else if (confirmDelete.step === 3) {
      deleteVideo(id);
      setPinnedVideos((prev) => {
        const updated = prev.map((v) =>
          v && v.url && videos.find((vid) => vid.id === id && vid.url === v.url)
            ? null
            : v,
        );
        return updated;
      });
      setConfirmDelete(null);
      if (confirmDeleteTimeout.current)
        clearTimeout(confirmDeleteTimeout.current);
    }
  };

  const handleFormSubmit = (videoData: Omit<Video, "id" | "embedUrl">) => {
    if (editingVideo) {
      updateVideo(editingVideo.id, videoData);
      toast(t("toastSongUpdated"), "success");
    } else {
      addVideo(videoData);
      toast(t("toastSongAdded"), "success");
    }
  };

  const handleUnpinTag = () => setActiveTag(null);

  const getTagName = (tag: string) => {
    const key = "tag_" + tag;
    const translation = t(key);
    return translation === key ? tag : translation;
  };

  const extractYoutubeId = (url: string): string | null => {
    try {
      if (!url) return null;
      const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        return (
          urlObj.searchParams.get("v") ||
          urlObj.pathname.split("/").pop() ||
          null
        );
      }
    } catch {
      return null;
    }
    return null;
  };

  const normalizeYoutubeUrl = (url: string): string => {
    const id = extractYoutubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : url;
  };

  const executeReplacePin = (videoId: string, position: number) => {
    setConfirmReplaceModal(null);
    const idx = position - 1;
    const newVideo = {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      name: `Video ${position}`,
    };
    setPinnedVideos((prev) => {
      const arr = [...prev];
      arr[idx] = newVideo;
      return arr;
    });
    // Solo agregar a la lista principal si es el slot 1
    if (
      position === 1 &&
      !videos.some((v) => v && v.url && extractYoutubeId(v.url) === videoId)
    ) {
      addVideo({
        name: `Video ${position}`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        tags: [],
      });
    }

    setPinUrl("");
    setPinPosition(1);
    setIsPinReset(true);
    setTimeout(() => setIsPinReset(false), 800);
  };

  const handlePinUrlSubmit = () => {
    if (pinUrl.trim() === "") {
      setPinUrl("");
      return;
    }
    const videoId = extractYoutubeId(pinUrl);
    if (!videoId) {
      toast(
        language === "es"
          ? "❌ Link de YouTube inválido"
          : "❌ Invalid YouTube link",
        "error",
      );
      setPinUrl("");
      return;
    }

    // Check if video is already pinned ANYWHERE
    const existingIdx = pinnedVideos.findIndex(
      (v) => v && extractYoutubeId(v.url) === videoId
    );
    const slotEmojis = ["1⃣", "2⃣", "3⃣", "4⃣"];
    if (existingIdx !== -1) {
      toast(
        language === "es"
          ? `⚠️ El video ya está fijado en el slot ${slotEmojis[existingIdx]}`
          : `⚠️ Video is already pinned in slot ${slotEmojis[existingIdx]}`,
        "error"
      );
      setPinUrl("");
      return;
    }

    const idx = pinPosition - 1;
    if (pinnedVideos[idx]) {
      setConfirmReplaceModal({
        isOpen: true,
        videoId,
        pinPosition,
        pinUrl
      });
      return;
    }

    executeReplacePin(videoId, pinPosition);
  };



  const handleClickPinned = (index: number) => {
    if (index === 0) return;
    setPinnedVideos((prev) => {
      const next = [...prev];
      const temp = next[0];
      next[0] = next[index];
      next[index] = temp;
      return next;
    });
    setFocusIndex(0);
    toast(t("toastVideoSwapped"), "success", { className: "left-1/2 md:left-[54.5%]" });
  };

  const handleClickPlaceholder = (slotIndex: number = 0) => {
    setPinPosition(slotIndex + 1);
    // Only focus the input, do not change the main focus
    setTimeout(() => {
      pinUrlInputRef.current?.focus();
    }, 0);
  };

  const focusedVideo = pinnedVideos[focusIndex];
  // ...eliminado: variable no usada
  // ...eliminado: variables no usadas
  // Los vacíos siempre arriba, los ocupados debajo, sin reordenar los ocupados
  // ...eliminado: variable no usada
  // const isPinningDisabled = false; // Siempre se puede fijar

  const isReorderingAllowed =
    !search.trim() && !activeTag && hiddenTags.length === 0 && !isMobile;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderVideos(arrayMove(videos, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <>
        <div className="flex flex-col md:flex-row items-center justify-center pt-0 pb-0 md:pt-0 md:pb-0 gap-0 md:gap-1 max-w-4xl mx-auto">
          <img
            src={`${import.meta.env.BASE_URL}dj.png`}
            alt={"DJ"}
            onClick={() =>
              window.open("https://youtu.be/dQw4w9WgXcQ", "_blank")
            }
            className={`cursor-pointer h-60 md:h-72 w-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-2xl -mt-6 -mb-4 md:mt-0 md:mb-0 md:-mr-4 ${language === "en" ? "md:ml-0" : "md:ml-16"}`}
          />
          <div className="flex flex-col items-center md:items-start md:gap-0">
            <h1 className="mx-auto md:mx-0 md:max-w-xl text-3xl md:text-5xl font-extrabold text-center md:text-left text-neutral-900 leading-tight tracking-tight">
              <>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 inline">
                  {language === "en" ? (
                    <>
                      Your perfect <br className="md:hidden" /> soundtrack
                    </>
                  ) : (
                    t("headline_part1")
                  )}
                </span>
                <span
                  className={`text-[#6866D6] block ${language === "es" ? "md:inline" : ""}`}
                >
                  {language === "es" && " "}
                  {t("headline_part2")}
                </span>
              </>
            </h1>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            <input
              ref={pinUrlInputRef}
              type="text"
              placeholder={t("quickTestPlaceholder")}
              value={pinUrl}
              onChange={(e) => setPinUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePinUrlSubmit();
                }
              }}
              className="order-1 md:order-2 flex-1 px-4 py-2.5 rounded-lg border-2 transition-all text-neutral-900 placeholder-neutral-500 font-medium bg-[#6866D6]/5 border-[#6866D6] focus:outline-none focus:ring-2 focus:ring-[#6866D6]/50 focus:border-[#6866D6]"
            />
            <div className="order-2 md:order-1 flex gap-2">
              <select
                value={pinPosition}
                onChange={(e) => setPinPosition(Number(e.target.value))}
                className={`h-12 w-14 text-xl text-right font-bold rounded-lg border-2 border-[#6866D6] text-[#6866D6] focus:outline-none focus:ring-2 focus:ring-[#6866D6]/50 shadow-sm transition-all duration-300 cursor-pointer hover:bg-[#f3f0ff] hover:border-[#5856b3] appearance-none pl-7 pr-3 relative ${isPinReset ? 'animate-pulse ring-4 ring-[#6866D6]/50 bg-[#f3f0ff] scale-[1.15]' : 'bg-white'}`}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%236866D6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left 0.4rem center",
                  backgroundSize: "1.25rem 1.25rem",
                }}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                onClick={handlePinUrlSubmit}
                className="xl:hidden flex-1 px-6 py-3 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all bg-[#6866D6] hover:bg-[#5856b3] hover:shadow-lg cursor-pointer"
              >
                <Pin className="w-5 h-5" />
                {language === "es" ? "Fijar" : "Pin"}
              </button>
            </div>
            <button
              onClick={handlePinUrlSubmit}
              className="hidden xl:flex order-3 px-6 py-3 text-white rounded-lg font-bold items-center justify-center gap-2 shadow-md transition-all bg-[#6866D6] hover:bg-[#5856b3] hover:shadow-lg cursor-pointer xl:w-auto"
            >
              <Pin className="w-5 h-5" />
              {language === "es" ? "Fijar" : "Pin"}
            </button>
          </div>
          {/* Ejemplos de links para testear */}
          <div className="flex flex-wrap gap-2 mt-2 items-center justify-center xl:justify-start bg-neutral-50/80 rounded px-2 py-1 border border-neutral-100">
            <span className="text-xs text-neutral-500 font-normal mr-2">
              {language === "es" ? (
                <>
                  <span className="xl:hidden">Link</span>
                  <span className="hidden xl:inline">Links</span> para testeo rápido:
                </>
              ) : (
                <>
                  Quick test <span className="xl:hidden">link</span>
                  <span className="hidden xl:inline">links</span>:
                </>
              )}
            </span>
            <input
              type="text"
              value="https://youtu.be/QtKGMfeyPUE"
              readOnly
              className="px-1.5 py-0.5 border border-neutral-200 rounded text-xs bg-neutral-100 text-neutral-600 focus:bg-white transition-colors w-48"
              style={{ fontSize: 12 }}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <input
              type="text"
              value="https://youtu.be/hbPoX4vjB5o"
              readOnly
              className="px-1.5 py-0.5 border border-neutral-200 rounded text-xs bg-neutral-100 text-neutral-600 focus:bg-white transition-colors hidden md:inline-block w-48"
              style={{ fontSize: 12 }}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
        </div>
      </>

      <div className="mb-6">
        {/* Desktop: main slot + 3 stacked secondary slots */}
        <div className="hidden xl:flex items-stretch gap-6 relative">
          {/* Slot 1 Area */}
          <div className="flex-1 relative">
            {focusedVideo ? (
              <div className="bg-white border-2 border-gray-200 overflow-hidden rounded-2xl shadow-lg">
                <div className="h-96 bg-gray-100 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(focusedVideo.url)}?modestbranding=1`}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-5 flex items-center justify-between bg-white gap-3">
                  {/* Botón de eliminar */}
                  <button
                    onClick={() => {
                        // doble confirmación visual
                        if (!confirmRemovePinned) {
                          setConfirmRemovePinned(1);
                          if (confirmRemovePinnedTimeout.current)
                            clearTimeout(confirmRemovePinnedTimeout.current);
                          confirmRemovePinnedTimeout.current = setTimeout(
                            () => setConfirmRemovePinned(null),
                            1500,
                          );
                        } else if (confirmRemovePinned === 1) {
                          // Eliminar
                          const next = [...pinnedVideos];
                          next[focusIndex] = null;
                          setPinnedVideos(next);

                          setConfirmRemovePinned(null);
                          if (confirmRemovePinnedTimeout.current)
                            clearTimeout(confirmRemovePinnedTimeout.current);
                        }
                    }}
                    className={`p-2 rounded-full transition-all cursor-pointer flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700`}
                  >
                    {confirmRemovePinned === 1 ? (
                      <Check size={18} style={{ opacity: 0.7 }} />
                    ) : (
                      <X size={18} />
                    )}
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={focusedVideo.url}
                    className="text-gray-500 text-sm flex-1 bg-gray-50 px-3 py-2 rounded border border-gray-200 cursor-default select-all"
                  />
                  {/* Selector para mover/intercambiar el video principal */}
                  <select
                    className="ml-2 pl-1.5 pr-6 py-1.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6866D6] transition-all appearance-none relative cursor-pointer min-w-[72px] xl:min-w-[105px] max-w-[88px] xl:max-w-[125px]"
                    style={{
                      backgroundImage:
                        "url('data:image/svg+xml;utf8,<svg fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'></path></svg>')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.4rem center",
                      backgroundSize: "0.8rem 0.8rem",
                    }}
                    title="Mover o intercambiar video principal"
                    value=""
                    onChange={(e) => {
                      const slot = Number(e.target.value);
                      if (![1, 2, 3].includes(slot)) return;
                      setPinnedVideos((prev) => {
                        const next = [...prev];
                        if (!next[0]) return prev; // No hay video principal
                        if (!next[slot]) {
                          // Mover principal a slot vacío
                          next[slot] = next[0];
                          next[0] = null;
                        } else {
                          // Intercambiar
                          const temp = next[0];
                          next[0] = next[slot];
                          next[slot] = temp;
                        }
                        return next;
                      });
                      setFocusIndex(0); // Mantener foco en principal
                      e.target.value = ""; // Resetear selector
                    }}
                  >
                    <option value="" disabled style={{ fontWeight: "bold" }}>
                      {t("move").toUpperCase()} ➡
                    </option>
                    {[1, 2, 3].map((i) => {
                      const label = `${t("slot").charAt(0).toUpperCase() + t("slot").slice(1)} ${i + 1} ${pinnedVideos[i] ? `(${t("swap").charAt(0).toUpperCase() + t("swap").slice(1)})` : `(${t("empty").charAt(0).toUpperCase() + t("empty").slice(1)})`}`;
                      return (
                        <option key={i} value={i}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleClickPlaceholder(0)}
                className="bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300 h-[29rem] flex items-center justify-center cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 text-neutral-400">
                    1️⃣{" "}
                    <span role="img" aria-label="cd">
                      💿
                    </span>
                  </div>
                  <span className="block text-base text-neutral-500 font-medium">
                    {language === "es"
                      ? "Cuando fijes un nuevo video"
                      : "When you pin a new video"}
                  </span>
                  <span className="block text-base text-neutral-500 font-medium mt-1">
                    {language === "es"
                      ? "aparecerá aquí"
                      : "it will appear here"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="w-fit min-w-[16rem] shrink-0">
            <div className="flex flex-col gap-3 justify-end h-full">
              {[1, 2, 3].map((slotIndex) => {
                const slotVideo = pinnedVideos[slotIndex];

                if (slotVideo) {
                  return (
                    <div
                      key={slotIndex}
                      onClick={() => handleClickPinned(slotIndex)}
                      className="flex items-center gap-3 w-full group relative"
                    >
                      <div className="w-48 lg:w-56 xl:w-64 shrink-0 cursor-pointer transition-opacity opacity-60 group-hover:opacity-100">
                        <div className="bg-white border border-gray-200 overflow-hidden rounded-lg shadow-sm">
                          <div className="aspect-video bg-gray-100 relative">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${extractYoutubeId(slotVideo.url)}?modestbranding=1`}
                              frameBorder="0"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Move controls (hover) - OUTSIDE grid */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex flex-col items-stretch gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (slotIndex > 1) {
                              setPinnedVideos((prev) => {
                                const next = [...prev];
                                const temp = next[slotIndex];
                                next[slotIndex] = next[slotIndex - 1];
                                next[slotIndex - 1] = temp;
                                return next;
                              });
                              toast(t("toastVideoMoved"), "success");
                            }
                          }}
                          disabled={slotIndex === 1}
                          className={`p-2 rounded-xl bg-white shadow-md hover:shadow-lg text-[#6866D6] hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center ${slotIndex === 1 ? "opacity-20 cursor-not-allowed" : "hover:scale-105"}`}
                          title={language === "es" ? "Subir" : "Move Up"}
                        >
                          <ChevronUp size={24} />
                        </button>

                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap transform hover:scale-105 transition-transform cursor-pointer group/btn flex items-center justify-center"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleClickPinned(slotIndex);
                             }}>
                           <span className="text-xl font-black text-[#6866D6] flex items-center gap-2">
                             1️⃣ <span className="text-sm opacity-60">🔄</span> {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}
                           </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (slotIndex < 3) {
                              setPinnedVideos((prev) => {
                                const next = [...prev];
                                const temp = next[slotIndex];
                                next[slotIndex] = next[slotIndex + 1];
                                next[slotIndex + 1] = temp;
                                return next;
                              });
                              toast(t("toastVideoMoved"), "success");
                            }
                          }}
                          disabled={slotIndex === 3}
                          className={`p-2 rounded-xl bg-white shadow-md hover:shadow-lg text-[#6866D6] hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center ${slotIndex === 3 ? "opacity-20 cursor-not-allowed" : "hover:scale-105"}`}
                          title={language === "es" ? "Bajar" : "Move Down"}
                        >
                          <ChevronDown size={24} />
                        </button>
                      </div>

                      {/* [DESKTOP] Preview note - Mutually exclusive with hover controls */}
                      <div className="hidden xl:block absolute left-full ml-3 top-0 bottom-0 w-48 2xl:w-64 py-0.5 z-20 transition-opacity group-hover:opacity-0 group-hover:pointer-events-none">
                        <VideoNote
                          url={slotVideo.url}
                          videos={videos}
                          updateNote={updateNote}
                          editable={false}
                          language={language}
                        />
                      </div>
                    </div>
                  );
                }

                // Placeholder con emoji de número y CD
                return (
                  <div key={slotIndex} className="w-[16rem]">
                    <div
                      onClick={() => handleClickPlaceholder(slotIndex)}
                      className="bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 aspect-video flex items-center justify-center cursor-pointer"
                    >
                      <div className="text-center px-2">
                        <div className="text-xl mb-1 text-neutral-400">
                          {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}{" "}
                          <span role="img" aria-label="cd">
                            💿
                          </span>
                        </div>
                        <span className="block text-[10px] text-neutral-500 font-medium">
                          {language === "es"
                            ? "Cuando fijes un nuevo video"
                            : "When you pin a new video"}
                        </span>
                        <span className="block text-[10px] text-neutral-500 font-medium mt-0.5">
                          {language === "es"
                            ? "aparecerá aquí"
                            : "it will appear here"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* [DESKTOP] Slot 1 Note - Positioned BOTTOM (Full width spanning across the entire grid) */}
        {focusedVideo && (
          <div className="hidden xl:block mt-6">
            <VideoNote
              url={focusedVideo.url}
              videos={videos}
              updateNote={updateNote}
              editable={true}
              language={language}
              fullWidth={true}
            />
          </div>
        )}

        {/* Mobile & Tablet & Small Desktop: Pinned Videos Layout */}
        <div className="xl:hidden space-y-4">
          {focusedVideo ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ring-1 ring-black/5">
              <div className="aspect-video bg-gray-100 relative">
                <span className="absolute top-3 left-3 text-xl select-none z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm font-bold text-[#6866D6]">
                  1️⃣{" "}
                  <span role="img" aria-label="cd">
                    💿
                  </span>
                </span>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(focusedVideo.url)}?modestbranding=1`}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Mobile Note - Slot 1: Full width and taller */}
              <div className="p-3 bg-gray-50/50 border-b border-gray-100 h-56">
                <VideoNote
                  url={focusedVideo.url}
                  videos={videos}
                  updateNote={updateNote}
                  editable={true}
                  language={language}
                />
              </div>

              <div className="p-4 bg-white border-t border-gray-50">
                <div className="flex items-center justify-between gap-3">
                  {/* Delete button with double-check logic */}
                  <button
                    onClick={() => {
                        // doble confirmación visual
                        if (!confirmRemovePinned) {
                          setConfirmRemovePinned(1);
                          if (confirmRemovePinnedTimeout.current)
                            clearTimeout(confirmRemovePinnedTimeout.current);
                          confirmRemovePinnedTimeout.current = setTimeout(
                            () => setConfirmRemovePinned(null),
                            1500,
                          );
                        } else if (confirmRemovePinned === 1) {
                          // Eliminar
                          const next = [...pinnedVideos];
                          next[focusIndex] = null;
                          setPinnedVideos(next);

                          setConfirmRemovePinned(null);
                          if (confirmRemovePinnedTimeout.current)
                            clearTimeout(confirmRemovePinnedTimeout.current);
                        }
                    }}
                    className={`p-2 rounded-full transition-all cursor-pointer flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700`}
                  >
                    {confirmRemovePinned === 1 ? (
                      <Check size={18} style={{ opacity: 0.7 }} />
                    ) : (
                      <X size={18} />
                    )}
                  </button>

                  <input
                    type="text"
                    readOnly
                    value={focusedVideo.url}
                    className="text-gray-400 text-[10px] sm:text-xs flex-1 bg-gray-50 px-2 py-2 rounded border border-gray-100 cursor-default truncate select-all"
                  />

                  {/* Move/Swap selector */}
                  <select
                    className="ml-2 pl-1.5 pr-6 py-1.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6866D6] transition-all appearance-none relative cursor-pointer min-w-[72px] xl:min-w-[105px] max-w-[88px] xl:max-w-[125px]"
                    style={{
                      backgroundImage:
                        "url('data:image/svg+xml;utf8,<svg fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'></path></svg>')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.4rem center",
                      backgroundSize: "0.8rem 0.8rem",
                    }}
                    title="Mover o intercambiar video principal"
                    value=""
                    onChange={(e) => {
                      const slot = Number(e.target.value);
                      if (![1, 2, 3].includes(slot)) return;
                      setPinnedVideos((prev) => {
                        const next = [...prev];
                        if (!next[0]) return prev;
                        if (!next[slot]) {
                          next[slot] = next[0];
                          next[0] = null;
                        } else {
                          const temp = next[0];
                          next[0] = next[slot];
                          next[slot] = temp;
                        }
                        return next;
                      });
                      setFocusIndex(0);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      {t("move").charAt(0).toUpperCase() + t("move").slice(1)} ➡
                    </option>
                    {[1, 2, 3].map((i) => {
                      const label = `${t("slot").charAt(0).toUpperCase() + t("slot").slice(1)} ${i + 1} ${pinnedVideos[i] ? `(${t("swap").charAt(0).toUpperCase() + t("swap").slice(1)})` : `(${t("empty").charAt(0).toUpperCase() + t("empty").slice(1)})`}`;
                      return (
                        <option key={i} value={i}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleClickPlaceholder(0)}
              className="bg-neutral-50/50 rounded-2xl border-2 border-dashed border-neutral-300 aspect-video flex items-center justify-center cursor-pointer hover:bg-neutral-100/50 transition-colors group"
            >
              <div className="text-center">
                <div className="text-neutral-400 text-4xl mb-1 group-hover:scale-110 transition-transform">
                  1️⃣{" "}
                  <span role="img" aria-label="cd">
                    💿
                  </span>
                </div>
                <span className="block text-neutral-500 text-base font-bold">
                  {language === "es"
                    ? "Toca aquí para fijar un video"
                    : "Tap here to pin a video"}
                </span>
              </div>
            </div>
          )}

          {/* Secondary slots in a row */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((slotIndex) => {
              const slotVideo = pinnedVideos[slotIndex];
              const videoId = slotVideo ? extractYoutubeId(slotVideo.url) : null;

              return (
                <div
                  key={slotIndex}
                  onClick={
                    slotVideo
                      ? () => handleClickPinned(slotIndex)
                      : () => handleClickPlaceholder(slotIndex)
                  }
                  className={`relative aspect-[4/3] flex flex-col items-center justify-center rounded-xl border-2 overflow-hidden transition-all ${
                    slotVideo 
                      ? "border-white shadow-md cursor-pointer active:scale-95 ring-1 ring-black/5" 
                      : "border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:bg-neutral-100"
                  }`}
                >
                  {slotVideo && videoId ? (
                    <>
                      <img 
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={slotVideo.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-sm text-sm font-bold text-[#6866D6]">
                        {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}
                      </div>
                    </>
                  ) : (
                    <div className="text-center px-1">
                      <span className="text-2xl select-none block mb-0.5">
                        {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-bold block">
                        {language === "es" ? "Slot Vacío" : "Empty Slot"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hidden: song browser section */}
      <div className="hidden">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (activeTag) {
                  handleUnpinTag();
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#6866D6] transition-all text-neutral-900"
            />
          </div>
        </div>

        {activeTag && (
          <div
            className="flex items-center justify-center md:justify-start cursor-pointer pb-2"
            onClick={() => setActiveTag(null)}
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6866D6]/10 text-[#6866D6] rounded-full text-xs font-medium hover:bg-[#6866D6]/20 transition-colors">
              <Hash className="w-3 h-3.5" />
              {getTagName(activeTag)}
              <button className="p-0 rounded-full transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        {/* Tag Cloud */}
        {allTags.length > 0 && !activeTag && (
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pb-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-xs transition-colors cursor-pointer"
              >
                <Hash className="w-3 h-3" />
                {getTagName(tag)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hidden: song grid section */}
      <div className="hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredVideos.map((v) => v.id)}
            strategy={rectSortingStrategy}
            disabled={!isReorderingAllowed}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-20">
              {/* Add Video Button - Always First */}
              <button
                onClick={() => {
                  setEditingVideo(undefined);
                  setIsFormOpen(true);
                }}
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-[#6866D6] hover:bg-[#6866D6]/10 transition-all group cursor-pointer ${
                  filteredVideos.length === 0
                    ? "md:col-start-2 min-h-[240px]"
                    : "min-h-[220px]"
                }`}
              >
                <div className="h-12 w-12 bg-[#6866D6]/20 text-[#6866D6] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-600 group-hover:text-[#6866D6] text-sm">
                  {t("addSong")}
                </span>
              </button>

              {filteredVideos.length === 0 && !isFormOpen && (
                <div className="col-span-full flex flex-col items-center justify-center py-6 text-neutral-500 space-y-2">
                  <div className="bg-neutral-100 p-3 rounded-full mb-2">
                    <SearchX className="w-6 h-6 text-neutral-400" />
                  </div>
                  {search.trim() ? (
                    <>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">
                        {t("noResultsFor")}
                      </p>
                      <p className="text-lg">"{search}"</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-neutral-900">
                        {t("noSongsFound")}
                      </p>
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <span className="text-sm text-neutral-700 mb-1">
                          Links para testear:
                        </span>
                        <input
                          type="text"
                          value="https://youtu.be/QtKGMfeyPUE"
                          readOnly
                          className="w-full max-w-xs px-2 py-1 border rounded text-xs bg-neutral-50 cursor-pointer mb-1"
                          onFocus={(e) => e.target.select()}
                          onClick={(e) =>
                            (e.target as HTMLInputElement).select()
                          }
                        />
                        <input
                          type="text"
                          value="https://youtu.be/hbPoX4vjB5o"
                          readOnly
                          className="w-full max-w-xs px-2 py-1 border rounded text-xs bg-neutral-50 cursor-pointer"
                          onFocus={(e) => e.target.select()}
                          onClick={(e) =>
                            (e.target as HTMLInputElement).select()
                          }
                        />
                      </div>
                    </>
                  )}
                  <a
                    href={playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-12 mb-0 text-center mx-auto max-w-lg !text-[#6866D6] hover:!text-[#5856b3] transition-colors group cursor-pointer"
                  >
                    <p className="text-base group-hover:underline dark:text-white">
                      {t("moreSongsIn")}{" "}
                      <span className="break-all">{playlistUrl}</span>
                    </p>
                  </a>
                </div>
              )}

              {filteredVideos.map((video) => (
                <SortableVideoItem
                  key={video.id}
                  id={video.id}
                  disabled={!isReorderingAllowed}
                >
                  <div className="aspect-video bg-gray-100 relative group-hover:scale-105 transition-transform duration-300">
                    {video.url ? (
                      <div
                        onClick={() => setPlayingVideo(video)}
                        className="block w-full h-full relative cursor-pointer"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.url.split("v=")[1]?.split("&")[0] || video.url.split("youtu.be/")[1]?.split("?")[0]}/hqdefault.jpg`}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                            <Play className="w-7 h-7 text-white fill-current ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {t("previewNotAvailable")}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 truncate text-sm leading-tight group-hover:text-[#6866D6] transition-colors cursor-pointer"
                      title={video.name}
                      onClick={() => setPlayingVideo(video)}
                    >
                      {video.name}
                    </h3>
                    <div className="flex justify-between items-end mt-2 gap-2">
                      <div className="flex flex-wrap gap-1">
                        {video.tags
                          .filter((t) => !hiddenTags.includes(t))
                          .map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setActiveTag(tag)}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer transition-colors relative z-20"
                            >
                              #{getTagName(tag)}
                            </span>
                          ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 relative z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(video);
                          }}
                          className="p-1.5 bg-gray-100 hover:bg-[#6866D6]/10 text-neutral-600 hover:text-[#6866D6] rounded-full transition-all cursor-pointer"
                          title={t("edit")}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(video.id);
                          }}
                          className={`p-1.5 bg-gray-100 rounded-full transition-all cursor-pointer ${
                            confirmDelete && confirmDelete.id === video.id
                              ? "text-red-600 bg-red-50 hover:bg-red-100 animate-pulse"
                              : "text-neutral-600 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            confirmDelete && confirmDelete.id === video.id
                              ? confirmDelete.step === 3
                                ? t("confirmDelete") + " (final)"
                                : t("confirmDelete")
                              : t("delete")
                          }
                        >
                          {confirmDelete && confirmDelete.id === video.id ? (
                            confirmDelete.step === 1 ? (
                              <Check size={12} style={{ opacity: 0.7 }} />
                            ) : confirmDelete.step === 2 ? (
                              <ShieldCheck size={12} style={{ opacity: 1 }} />
                            ) : (
                              <Check size={12} style={{ opacity: 1 }} />
                            )
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </SortableVideoItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Video Form Modal */}
      <VideoForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVideo(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingVideo}
        initialName={search}
      />

      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Confirm Replace Modal */}
      {confirmReplaceModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === "es" ? "Reemplazar video" : "Replace video"}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "es" 
                  ? `¿Estás seguro que deseas reemplazar el video en la posición ${["1️⃣", "2️⃣", "3️⃣", "4️⃣"][confirmReplaceModal.pinPosition - 1]}?`
                  : `Are you sure you want to replace the video in slot ${["1️⃣", "2️⃣", "3️⃣", "4️⃣"][confirmReplaceModal.pinPosition - 1]}?`}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmReplaceModal(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    executeReplacePin(confirmReplaceModal.videoId, confirmReplaceModal.pinPosition);
                  }}
                  className="px-4 py-2 text-white bg-[#6866D6] hover:bg-[#5856b3] rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {language === "es" ? "Reemplazar" : "Replace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
