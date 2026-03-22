import {
  Wrench,
  X,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Save,
  FileDown,
  FileUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/language-context";
import { useVideos } from "../contexts/video-context";
import { useToast } from "../contexts/toast-context";
import { LanguageSwitch } from "./language-switch";

import { normalizeUrl } from "../utils/url-utils";

// Assuming Language type is 'es' | 'en' based on context
type Language = "es" | "en";

interface ConfigModalProps {
  lang: Language;
  onClose: () => void;
  exportPath: string;
  importPath: string;
}

export default function ConfigModal({
  lang,
  onClose,
  exportPath,
  importPath,
}: ConfigModalProps) {
  const { videos } = useVideos();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [playlistUrl, setPlaylistUrl] = useState(
    "https://youtube.com/playlist?list=PL-0_mv1k_D3IR4LDICAe3TZH4xqCX9xsr",
  );
  const [hiddenTags, setHiddenTags] = useState<string[]>([]);

  // Compute all unique tags from videos
  const allTags = Array.from(new Set(videos.flatMap((v) => v.tags))).sort();

  useEffect(() => {
    // Load initial state (music only)
    const mode = "music";
    const playlistKey = `config-playlist-url_${mode}`;
    const hiddenKey = `config-hidden-tags_${mode}`;

    const savedPlaylistUrl = localStorage.getItem(playlistKey);
    const savedHiddenTags = localStorage.getItem(hiddenKey);

    if (savedPlaylistUrl) {
      setPlaylistUrl(savedPlaylistUrl);
    } else {
      setPlaylistUrl(
        "https://youtube.com/playlist?list=PL-0_mv1k_D3IR4LDICAe3TZH4xqCX9xsr",
      );
    }

    if (savedHiddenTags) {
      try {
        setHiddenTags(JSON.parse(savedHiddenTags));
      } catch (e) {
        console.error("Failed to parse hidden tags", e);
      }
    }
  }, []);

  const handleSavePlaylistUrl = () => {
    const url = normalizeUrl(playlistUrl);
    setPlaylistUrl(url);
    const mode = "music";
    localStorage.setItem(`config-playlist-url_${mode}`, url);
    window.dispatchEvent(new Event("config-update"));
    toast(
      t("saveChanges") ||
        (lang === "en" ? "Changes saved" : "Cambios guardados"),
      "success",
    );
    onClose();
  };

  const toggleTagVisibility = (tag: string) => {
    const newHiddenTags = hiddenTags.includes(tag)
      ? hiddenTags.filter((t) => t !== tag)
      : [...hiddenTags, tag];

    setHiddenTags(newHiddenTags);
    const mode = "music";
    localStorage.setItem(
      `config-hidden-tags_${mode}`,
      JSON.stringify(newHiddenTags),
    );
    window.dispatchEvent(new Event("config-update"));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 z-10 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 scale-x-[-1]" />
            {lang === "en" ? "Configuration" : "Configuración"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Language Switch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-700">
                  {lang === "en"
                    ? "Interface Language"
                    : "Idioma de la interfaz"}
                </span>
                <span className="text-xs text-zinc-500">
                  {lang === "en"
                    ? "Select your preferred language"
                    : "Selecciona tu idioma preferido"}
                </span>
              </div>
              <LanguageSwitch />
            </div>
          </div>

          {/* Tag Visibility */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-700">
              {lang === "en" ? "Visible Tags" : "Tags Visibles"}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {allTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100 cursor-pointer"
                  onClick={() => toggleTagVisibility(tag)}
                >
                  <span className="text-xs font-medium text-zinc-600 truncate max-w-[80%]">
                    {(() => {
                      const key = "tag_" + tag;
                      const translation = t(key);
                      return translation === key ? tag : translation;
                    })()}
                  </span>
                  {hiddenTags.includes(tag) ? (
                    <EyeOff size={14} className="text-zinc-400" />
                  ) : (
                    <Eye size={14} className="text-[#6866D6]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Playlist URL Config */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <LinkIcon size={16} />
              {t("playlistUrlLabel")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                onBlur={() => setPlaylistUrl(normalizeUrl(playlistUrl))}
                className="flex-1 p-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#6866D6]"
                placeholder="https://youtube.com/playlist..."
              />
              <button
                onClick={handleSavePlaylistUrl}
                className="px-4 py-2 bg-[#6866D6] text-white rounded-lg hover:bg-[#5856c6] transition-colors cursor-pointer"
              >
                <Save size={18} />
              </button>
            </div>
          </div>

          {/* Export / Import Buttons */}
          <div className="hidden md:grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
            <Link
              to={importPath}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100 transition-all group cursor-pointer"
            >
              <FileDown
                size={24}
                className="text-zinc-500 group-hover:text-[#6866D6] transition-colors"
              />
              <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900">
                {lang === "en" ? "Import Backup" : "Importar Backup"}
              </span>
            </Link>
            <Link
              to={exportPath}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100 transition-all group cursor-pointer"
            >
              <FileUp
                size={24}
                className="text-zinc-500 group-hover:text-[#6866D6] transition-colors"
              />
              <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900">
                {lang === "en" ? "Export Backup" : "Exportar Backup"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
