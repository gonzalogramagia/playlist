# 🎵 Music

**A personal pinned video player for your favorite YouTube music & content.**

"Music" lets you quickly pin and manage your most-played videos with an intuitive 4-slot player (1 main + 3 secondary). Built for instant access to your favorite content. Empty slots show a 💿 (CD) icon.

---

## ✨ Key Features

- **📍 Pinned Video Player**:
  - 1 main video slot (full display)
  - 3 secondary stack (quick access, bottom-anchored)
  - Empty slots show a 💿 (CD) icon
- **🔗 Quick Add**: Paste YouTube URLs to instantly pin videos to available slots. Invalid links show a clear ❌ error notification.
- **🌍 Internationalization**: Fully localized interface with English (EN) and Spanish (ES) support.
- **▶️ Embedded Playback**: Watch videos directly in the app with YouTube embeds.
- **💾 Persistent Storage**: Your pinned videos are automatically saved and restored.
- **🎨 Clean UI**: Minimal, distraction-free design focused on video playback.
- **🎯 Dual Modes**: Music and Study modes with separate pinned video collections.

---

## 🛠️ Technology Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Browser localStorage (no backend required)

This section is for reference — you don't need to be a developer to use the app.

---

## 🕹 Usage

### 🌐 Switching language

- The app auto-detects your language, or you can switch between English (EN) and Spanish (ES) in your browser settings.

### 📍 Pinning Videos

- Click the input field and paste a YouTube URL.
- The app validates the link and adds the video to the lowest available secondary slot (main slot is fixed).
- If all slots are full, you'll be notified.
- If the link is invalid, a red ❌ notification appears at the top.

### 🎬 Managing Your Player

- **Main Video**: The main slot is always fixed. Secondary slots cannot be promoted.
- **Remove Video**: Click the "Remove" button (×) on any video to delete it from the player.
- **View Full Details**: Hover over videos to see title and video ID.

### ⚙️ Import/Export

- Import and export your pinned video collections as JSON from the browser console or by manipulating localStorage.

### 🧭 Navigation

Quick links at the bottom left take you to:

- **Home** (clock icon) → hoy.today
- **Emojis** (smile icon) → milemojis.com
- **Music** (CD icon) → You are here!
- **Training** (joystick icon) → antipala.pro
- **Moovimiento** (zap icon) → moovimiento.com

All changes are stored in your browser — no account or login required.

---

## 🎯 Dual Modes: Music & Study

Switch between two completely separate environments, each with its own pinned videos:

- **Music Mode**: Your personal music library with curated default videos (Diplo as main and Zero Distractions as secondary by default).
- **Study Mode**: A focused environment with study-oriented content and a study-themed interface.

Use the mode toggle in the header (🎵 for Music, 📚 for Study) to switch instantly. Settings and pinned videos are kept separate per mode. Exported backups include the active mode in the filename (`music-...` or `study-...`).

Enjoy switching between vibes — music when you want to relax, study when you want to focus.

---

## 📄 License

This project is created for personal use and is shared as-is. Feel free to explore and modify it!

---

Made with 💛 by [Gonza](https://github.com/gonzalogramagia)
