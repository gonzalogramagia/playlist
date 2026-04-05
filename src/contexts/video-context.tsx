import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

export interface Video {
  id: string;
  name: string;
  url: string;
  tags: string[];
  embedUrl?: string;
  note?: string;
}

const STORAGE_KEY = "pinned-videos-v2";

type VideoContextType = {
  videos: Video[];
  addVideo: (videoData: Omit<Video, "id" | "embedUrl">) => void;
  updateVideo: (id: string, videoData: Omit<Video, "id" | "embedUrl">) => void;
  deleteVideo: (id: string) => void;
  reorderVideos: (newOrder: Video[]) => void;
  getEmbedUrl: (url: string) => string | undefined;
  updateNote: (idOrUrl: string, note: string) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const extractYoutubeId = (url: string): string | undefined => {
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        videoId = parts[1].split("?")[0];
      }
    }
    if (!videoId && url.includes("v=")) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v") || "";
      } catch (e) {}
    }
    return videoId || undefined;
  } catch (e) {
    return undefined;
  }
};

const getEmbedUrl = (url: string): string | undefined => {
  const videoId = extractYoutubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
};

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Video[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setVideos(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse videos from local storage", e);
      }
    }
    setVideos([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }, []);

  const saveVideos = (newVideos: Video[] | ((prev: Video[]) => Video[])) => {
    if (typeof newVideos === "function") {
      setVideos((prev) => {
        const next = newVideos(prev);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setVideos(newVideos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVideos));
    }
  };

  const addVideo = (videoData: Omit<Video, "id" | "embedUrl">) => {
    const newVideo: Video = {
      ...videoData,
      id: uuidv4(),
      embedUrl: getEmbedUrl(videoData.url),
    };
    saveVideos([...videos, newVideo]);
  };

  const updateVideo = (
    id: string,
    videoData: Omit<Video, "id" | "embedUrl">,
  ) => {
    const updatedVideos = (videos || []).map((video) => {
      if (!video) return video;
      return video.id === id
        ? { ...video, ...videoData, embedUrl: getEmbedUrl(videoData.url) }
        : video;
    });
    saveVideos(updatedVideos);
  };

  const deleteVideo = (id: string) => {
    const filteredVideos = videos.filter((video) => video.id !== id);
    saveVideos(filteredVideos);
  };

  const reorderVideos = (newOrder: Video[]) => {
    saveVideos(newOrder);
  };

  const updateNote = (idOrUrl: string, note: string) => {
    const inputId = extractYoutubeId(idOrUrl);
    saveVideos((prev) => {
      let found = false;
      const updated = (prev || []).map((video) => {
        if (!video) return video;
        const videoId = extractYoutubeId(video.url);
        const isMatch =
          video.id === idOrUrl ||
          (inputId && videoId === inputId) ||
          video.url === idOrUrl;

        if (isMatch) {
          found = true;
          return { ...video, note };
        }
        return video;
      });

      if (!found) {
        return [
          ...prev,
          {
            id: uuidv4(),
            name: "Video " + (inputId || "Note"),
            url: idOrUrl,
            tags: [],
            note: note,
            embedUrl: getEmbedUrl(idOrUrl),
          },
        ];
      }
      return updated;
    });
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        addVideo,
        updateVideo,
        deleteVideo,
        reorderVideos,
        getEmbedUrl,
        updateNote,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideos must be used within a VideoProvider");
  }
  return context;
};
