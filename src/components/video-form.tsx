
import React, { useState, useEffect } from "react";
import { Video } from "../contexts/video-context";
import { useLanguage } from "../contexts/language-context";
import { X, Search } from "lucide-react";
import { normalizeUrl } from "../utils/url-utils";

interface VideoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (video: Omit<Video, "id" | "embedUrl">) => void;
  initialData?: Video;
  initialName?: string;
}

export function VideoForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialName = "",
}: VideoFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [tags, setTags] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);

      setTags(initialData.tags.join(", "));
    } else {
      setName(initialName);
      setUrl("");

      setTags("");
    }
  }, [initialData, isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      url: normalizeUrl(url),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  const handleUrlBlur = async () => {
    const formattedUrl = normalizeUrl(url);
    setUrl(formattedUrl);

    if (!formattedUrl || name) return;

    try {
      const response = await fetch(
        `https://noembed.com/embed?url=${formattedUrl}`,
      );
      const data = await response.json();
      if (data.title) {
        setName(data.title);
      }
    } catch (error) {
      console.error("Error fetching video title:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? t("editSong") : t("addSong")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6866D6] focus:border-[#6866D6] outline-none transition-all"
                placeholder={t("namePlaceholder")}
              />
              <button
                type="button"
                onClick={() => {
                  if (name) {
                    window.open(
                      `https://www.youtube.com/results?search_query=${encodeURIComponent(name + t("searchSuffix"))}`,
                      "_blank",
                    );
                  }
                }}
                disabled={!name}
                className="px-3 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={t("searchInYoutube")}
              >
                <Search className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("youtubeUrl")}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6866D6] focus:border-[#6866D6] outline-none transition-all"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("tagsLabel")}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6866D6] focus:border-[#6866D6] outline-none transition-all"
              placeholder={t("tagsPlaceholder")}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#6866D6] hover:bg-[#5856c6] text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              {t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
