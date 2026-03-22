// Archivo eliminado. Componente ya no es necesario.

import { useLanguage } from "../contexts/language-context";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full w-fit border border-neutral-200 shadow-sm h-[38px]">
      <button
        onClick={() => setLanguage("es")}
        className={`h-full aspect-square rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
          language === "es"
            ? "bg-white shadow-sm text-[#6866D6] scale-105"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`h-full aspect-square rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
          language === "en"
            ? "bg-white shadow-sm text-[#6866D6] scale-105"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
