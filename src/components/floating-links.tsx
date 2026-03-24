// Archivo eliminado. Componente ya no es necesario.
import { ClipboardClock, Smile, Disc3, Joystick, Zap } from "lucide-react";
import { useLanguage } from "../contexts/language-context";
export function FloatingLinks() {
  const { language, t } = useLanguage();
  const isEnglish = language === "en";

  // Logic for URLs
  const getUrl = (baseUrl: string) => (isEnglish ? `${baseUrl}/en` : baseUrl);

  const homeUrl = getUrl("https://hoy.today");
  const emojisUrl = getUrl("https://milemojis.com");
  // const musicUrl = getUrl("https://bien.estate") // You are here!
  const playUrl = getUrl("https://antipala.pro");
  const moovimientoUrl = getUrl("https://moovimiento.com");

  return (
    <>
      {/* Right Side Button: Moovimiento only */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2 md:gap-3 z-[110]">
        <a
          href={moovimientoUrl}
          className="p-2.5 md:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
          aria-label="Moovimiento"
          title="Moovimiento"
          target="_blank"
          rel="noreferrer"
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
        </a>
      </div>

      {/* Left Side Buttons */}
      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 flex gap-2 md:gap-3 z-30 transition-opacity duration-300">
        {/* Home Button */}
        <a
          href={homeUrl}
          className="p-2.5 md:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
          aria-label={t("ariaHome")}
          title={t("ariaHome")}
        >
          <ClipboardClock className="w-5 h-5 md:w-6 md:h-6 text-zinc-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
        </a>

        {/* Emojis Button */}
        <a
          href={emojisUrl}
          className="p-2.5 md:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
          aria-label={t("ariaEmojis")}
          title={t("ariaEmojis")}
        >
          <Smile className="w-5 h-5 md:w-6 md:h-6 text-zinc-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
        </a>

        {/* Music Button (Disabled) */}
        <button
          disabled
          className="p-2.5 md:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg transition-all opacity-50 cursor-not-allowed group"
          aria-label={t("ariaMusic")}
          title={t("ariaMusic")}
        >
          <Disc3 className="w-5 h-5 md:w-6 md:h-6 text-zinc-900 dark:text-white transition-colors" />
        </button>

        {/* Play Button */}
        <a
          href={playUrl}
          className="p-2.5 md:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
          aria-label={t("ariaTraining")}
          title={t("ariaTraining")}
        >
          <Joystick className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
        </a>
      </div>
    </>
  );
}
