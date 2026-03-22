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
}

const STORAGE_KEY = "pinned-videos-v2";

type VideoContextType = {
  videos: Video[];
  addVideo: (videoData: Omit<Video, "id" | "embedUrl">) => void;
  updateVideo: (id: string, videoData: Omit<Video, "id" | "embedUrl">) => void;
  deleteVideo: (id: string) => void;
  reorderVideos: (newOrder: Video[]) => void;
  getEmbedUrl: (url: string) => string | undefined;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const getEmbedUrl = (url: string): string | undefined => {
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      // Handle https://youtu.be/ID?t=123
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        videoId = parts[1].split("?")[0];
      }
    }

    // Final sanity check for weird inputs like https://youtu.be/watch?v=ID which shouldn't happen but user had it
    if (!videoId && url.includes("v=")) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v") || "";
      } catch (e) {}
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    console.error("Error parsing YouTube URL", e);
  }
  return undefined;
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

  const saveVideos = (newVideos: Video[]) => {
    setVideos(newVideos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVideos));
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
    const updatedVideos = videos.map((video) =>
      video.id === id
        ? { ...video, ...videoData, embedUrl: getEmbedUrl(videoData.url) }
        : video,
    );
    saveVideos(updatedVideos);
  };

  const deleteVideo = (id: string) => {
    const filteredVideos = videos.filter((video) => video.id !== id);
    saveVideos(filteredVideos);
  };

  const reorderVideos = (newOrder: Video[]) => {
    saveVideos(newOrder);
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
