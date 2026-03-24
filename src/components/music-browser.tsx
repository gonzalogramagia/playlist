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

export function MusicBrowser() {
  const { videos, addVideo, updateVideo, deleteVideo, reorderVideos } =
    useVideos();
  const { toast } = useToast();
  const { t, language, mode } = useLanguage();
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
  const [focusedEditUrl, setFocusedEditUrl] = useState("");
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

    const saved = localStorage.getItem(`config-pinned-videos_${mode}`);
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normaliza y filtra duplicados por ID
          const seen = new Set();
          parsed = parsed
            .map((v: any) =>
              v && v.url ? { ...v, url: normalizeYoutubeUrl(v.url) } : null,
            )
            .filter((v: any) => {
              if (!v) return false;
              const id = extractYoutubeId(v.url);
              if (!id || seen.has(id)) return false;
              seen.add(id);
              return true;
            });
          // Asegura 4 slots
          const arr = [null, null, null, null];
          parsed.slice(0, 4).forEach((v: any, i: number) => {
            arr[i] = v;
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
  }, [mode]);

  useEffect(() => {
    if (!pinnedHydrated) return;
    localStorage.setItem(
      `config-pinned-videos_${mode}`,
      JSON.stringify(pinnedVideos),
    );
  }, [pinnedVideos, mode, pinnedHydrated]);

  useEffect(() => {
    if (!pinnedHydrated) return;
    localStorage.setItem(
      `config-pinned-focus-index_${mode}`,
      String(focusIndex),
    );
    setFocusedEditUrl("");
  }, [focusIndex, mode, pinnedHydrated]);

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
    const savedTags = localStorage.getItem(`config-hidden-tags_${mode}`);
    const savedUrl = localStorage.getItem(`config-playlist-url_${mode}`);

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
  }, [mode]);

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
      !videos.some((v) => extractYoutubeId(v.url) === videoId)
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

    const idx = pinPosition - 1;

    if (pinnedVideos[idx] && extractYoutubeId(pinnedVideos[idx]!.url) === videoId) {
      setPinUrl("");
      return;
    }

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

  const handleFocusedUrlSubmit = (slotIndex: number, currentUrl: string) => {
    // Si el campo está vacío, eliminar el video
    if (focusedEditUrl.trim() === "") {
      setPinnedVideos((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setFocusedEditUrl("");
      return;
    }
    if (focusedEditUrl === currentUrl) {
      return;
    }

    const videoId = extractYoutubeId(focusedEditUrl);
    if (!videoId) {
      toast(
        language === "es"
          ? "❌ Link de YouTube inválido"
          : "❌ Invalid YouTube link",
        "error",
      );
      return;
    }

    const alreadyPinnedInAnotherSlot = pinnedVideos.some((video, index) => {
      if (!video || index === slotIndex) return false;
      return extractYoutubeId(video.url) === videoId;
    });

    if (alreadyPinnedInAnotherSlot) {
      toast(
        language === "es"
          ? "Ese video ya está agregado"
          : "This video is already added",
        "error",
      );
      return;
    }

    setPinnedVideos((prev) => prev.filter((_, i) => i !== slotIndex));

    setFocusedEditUrl("");
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
  };

  const handleClickPlaceholder = (slotIndex: number = 0) => {
    setPinPosition(slotIndex + 1);
    // Only focus the input, do not change the main focus
    setTimeout(() => {
      pinUrlInputRef.current?.focus();
    }, 0);
  };

  const handleRemoveFocusedVideo = () => {
    const next = [...pinnedVideos];
    next[focusIndex] = null;

    setPinnedVideos(next);
    setFocusedEditUrl("");
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
            src={"/dj.png"}
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
                className="md:hidden flex-1 px-6 py-3 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all bg-[#6866D6] hover:bg-[#5856b3] hover:shadow-lg cursor-pointer"
              >
                <Pin className="w-5 h-5" />
                {language === "es" ? "Fijar" : "Pin"}
              </button>
            </div>
            <button
              onClick={handlePinUrlSubmit}
              className="hidden md:flex order-3 px-6 py-3 text-white rounded-lg font-bold items-center justify-center gap-2 shadow-md transition-all bg-[#6866D6] hover:bg-[#5856b3] hover:shadow-lg cursor-pointer md:w-auto"
            >
              <Pin className="w-5 h-5" />
              {language === "es" ? "Fijar" : "Pin"}
            </button>
          </div>
          {/* Ejemplos de links para testear */}
          <div className="flex flex-wrap gap-2 mt-2 items-center justify-center md:justify-start bg-neutral-50/80 rounded px-2 py-1 border border-neutral-100">
            <span className="text-xs text-neutral-500 font-normal mr-2">
              {language === "es"
                ? "Link para testeo rápido:"
                : "Quick test link:"}
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
        <div className="hidden md:flex items-stretch gap-6">
          <div className="flex-1">
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
                      const isEdited =
                        focusedEditUrl !== "" &&
                        focusedEditUrl !== focusedVideo.url;
                      if (isEdited) {
                        handleFocusedUrlSubmit(focusIndex, focusedVideo.url);
                      } else {
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
                          setFocusedEditUrl("");
                          setConfirmRemovePinned(null);
                          if (confirmRemovePinnedTimeout.current)
                            clearTimeout(confirmRemovePinnedTimeout.current);
                        }
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
                    value={
                      focusedEditUrl === "" ? focusedVideo.url : focusedEditUrl
                    }
                    onChange={(e) => setFocusedEditUrl(e.target.value)}
                    className="text-gray-600 text-sm flex-1 bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6866D6] transition-all"
                  />
                  {/* Selector para mover/intercambiar el video principal */}
                  <select
                    className="ml-2 pl-1 pr-1 py-2 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6866D6] transition-all appearance-none relative cursor-pointer"
                    style={{
                      backgroundImage:
                        "url('data:image/svg+xml;utf8,<svg fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'></path></svg>')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.3em center",
                      backgroundSize: "0.9em 0.9em",
                      minWidth: "48px",
                      maxWidth: "70px",
                      width: "auto",
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
                      <span style={{ fontWeight: "bold" }}>
                        {t("move").charAt(0).toUpperCase() + t("move").slice(1)}
                      </span>{" "}
                      ➡
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
                      ? "Cuando fijes un nuevo video musical"
                      : "When you pin a new music video"}
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

          <div className="relative">
            <div className="w-64 flex flex-col gap-4 justify-end">
              {[1, 2, 3].map((slotIndex) => {
                const slotVideo = pinnedVideos[slotIndex];

                if (slotVideo) {
                  return (
                    <div
                      key={slotIndex}
                      onClick={() => handleClickPinned(slotIndex)}
                      className="cursor-pointer transition-opacity opacity-60 hover:opacity-95"
                    >
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
                  );
                }

                // Placeholder con emoji de número y CD
                return (
                  <div
                    key={slotIndex}
                    onClick={() => handleClickPlaceholder(slotIndex)}
                    className="bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 aspect-video flex items-center justify-center cursor-pointer"
                  >
                    <div className="text-center px-2">
                      <div className="text-2xl mb-1 text-neutral-400">
                        {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}{" "}
                        <span role="img" aria-label="cd">
                          💿
                        </span>
                      </div>
                      <span className="block text-xs text-neutral-500 font-medium">
                        {language === "es"
                          ? "Cuando fijes un nuevo video musical"
                          : "When you pin a new music video"}
                      </span>
                      <span className="block text-xs text-neutral-500 font-medium mt-0.5">
                        {language === "es"
                          ? "aparecerá aquí"
                          : "it will appear here"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Pinned Videos Layout */}
        <div className="md:hidden space-y-4">
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
              <div className="p-4 flex items-center justify-between gap-3 bg-white">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {focusedVideo.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 truncate opacity-70">
                    {focusedVideo.url}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFocusedVideo}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                  title={language === "es" ? "Quitar" : "Remove"}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleClickPlaceholder(0)}
              className="bg-neutral-50/50 rounded-2xl border-2 border-dashed border-neutral-300 aspect-video flex items-center justify-center cursor-pointer hover:bg-neutral-100/50 transition-colors group"
            >
              <div className="text-center">
                <div className="text-neutral-400 text-3xl mb-2 group-hover:scale-110 transition-transform">
                  1️⃣{" "}
                  <span role="img" aria-label="cd">
                    💿
                  </span>
                </div>
                <span className="block text-neutral-500 text-sm font-semibold">
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
                      <span className="text-xl select-none block mb-1">
                        {["2️⃣", "3️⃣", "4️⃣"][slotIndex - 1]}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {language === "es" ? "Vacío" : "Empty"}
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
