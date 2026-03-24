import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  mode: "music";
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    if (location.pathname.startsWith("/en")) {
      setLanguage("en");
    } else if (
      location.pathname === "/import" ||
      location.pathname === "/export"
    ) {
      setLanguage("en");
    } else if (
      location.pathname === "/importar" ||
      location.pathname === "/exportar"
    ) {
      setLanguage("es");
    } else {
      setLanguage("es");
    }
  }, [location]);

  const translations: Record<Language, Record<string, string>> = {
    es: {
      ariaHome: "Ir a Hoy & Today",
      ariaEmojis: "Ir a Mil Emojis",
      ariaMusic: "Ya estás acá!",
      ariaTraining: "Jugar Antipala",
      moreSongsIn: "Más canciones en",
      playlistUrlLabel: 'URL de "Más canciones en..."',
      searchPlaceholder: "Buscar canciones...",
      addSong: "Agregar Canción",
      noSongsFound: "No se encontraron canciones",
      noResultsFor: "No se encontraron resultados para",
      edit: "Editar",
      delete: "Eliminar",
      confirmDelete: "Confirmar eliminar",
      editSong: "Editar Canción",
      youtubeUrl: "URL de YouTube",
      name: "Nombre",
      namePlaceholder: "Ej: Mi Canción Favorita",
      searchInYoutube: "Buscar en YouTube",
      tagsLabel: "Tags (separados por coma)",
      tagsPlaceholder: "Rap, Electrónica, Motivación, Energía",
      saveChanges: "Guardar Cambios",
      previewNotAvailable: "Vista previa no disponible",
      toastSongAdded: "Canción agregada a la biblioteca",
      toastSongUpdated: "Canción actualizada correctamente",
      headline_part1: "¡Tu banda sonora perfecta",
      headline_part2: "al instante!",
      quickTestPlaceholder: "Pega un link de YouTube (ej: youtu.be/QtKGMfeyPUE)",
      searchSuffix: " Music",
      move: "Mover",
      slot: "Slot",
      swap: "Intercambiar",
      empty: "Vacío",
    },
    en: {
      ariaHome: "Go to Hoy & Today",
      ariaEmojis: "Go to Mil Emojis",
      ariaMusic: "You are here!",
      ariaTraining: "Play Antipala",
      moreSongsIn: "More songs on",
      playlistUrlLabel: '"More songs on..." URL',
      searchPlaceholder: "Search songs...",
      addSong: "Add Song",
      noSongsFound: "No songs found",
      noResultsFor: "No results for",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Confirm delete",
      editSong: "Edit Song",
      youtubeUrl: "YouTube URL",
      name: "Name",
      namePlaceholder: "Ex: My Favorite Song",
      searchInYoutube: "Search in YouTube",
      tagsLabel: "Tags (comma separated)",
      tagsPlaceholder: "Rap, Electronic, Motivation, Energy",
      saveChanges: "Save Changes",
      previewNotAvailable: "No preview available",
      clickButtonToAdd: "Click the button above to add one",
      toastSongAdded: "Song added to library",
      toastSongUpdated: "Song updated successfully",
      headline_part1: "Your perfect soundtrack",
      headline_part2: "in a flash!",
      quickTestPlaceholder: "Paste a YouTube link (e.g., youtu.be/QtKGMfeyPUE)",
      searchSuffix: " Music",
      move: "Move",
      slot: "Slot",
      swap: "Swap",
      empty: "Empty",
    },
  };

  const t = useCallback(
    (key: string) => {
      const base = translations[language] || {};
      return base[key] || key;
    },
    [language],
  );

  useEffect(() => {
    const title = "♪♫♪♫";
    const description = `${translations.en.headline_part1} ${translations.en.headline_part2} | Music Mode 🎵`;
    const fullImageUrl = "https://bien.estate/dj.png";

    document.title = title;

    const updateMeta = (
      selector: string,
      content: string,
      attr: string = "content",
    ) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, content);
    };

    updateMeta('meta[property="og:url"]', "https://bien.estate/en");
    updateMeta('meta[property="twitter:url"]', "https://bien.estate/en");
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:image"]', fullImageUrl);
    updateMeta('meta[property="twitter:title"]', title);
    updateMeta('meta[property="twitter:description"]', description);
    updateMeta('meta[property="twitter:image"]', fullImageUrl);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, mode: "music", t, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
