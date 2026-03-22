# 🎵 Music

**A personal pinned video player for your favorite YouTube music & content.**

"Music" lets you quickly pin and manage your most-played videos with an intuitive 4-slot player (1 main + 3 secondary). Each slot is clearly numbered (1️⃣, 2️⃣, 3️⃣, 4️⃣) for instant access. Empty slots show a number emoji and a 💿 (CD) icon.

---

## 🆕 What's New

- **Slot numbers:** All 4 pinned slots now display a number emoji (1️⃣, 2️⃣, 3️⃣, 4️⃣) for clarity, both when empty and filled.
- **Flexible pinning:** You can always add a new video to any slot, even if full—just pick the slot number and it will be replaced.
- **Improved selector:** The slot selector is more visible and user-friendly.
- **UI/UX polish:** Placeholders, modals, and controls have been visually improved for a cleaner experience.

---

## ✨ Key Features

- **📍 Pinned Video Player**:
  - 1 main video slot (full display, slot 1️⃣)
  - 3 secondary slots (slots 2️⃣, 3️⃣, 4️⃣)
  - All slots show a number emoji and 💿 (CD) icon when empty
- **🔗 Quick Add & Overwrite**: Paste a YouTube URL, select a slot (1-4), and instantly pin or replace a video. Invalid links show a clear ❌ error notification.
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

### 📍 Pinning & Managing Videos

- Paste a YouTube URL and select a slot (1️⃣, 2️⃣, 3️⃣, 4️⃣) to pin or replace a video in that position.
- The app validates the link and updates the chosen slot. If the link is invalid, a red ❌ notification appears at the top.
- You can always overwrite any slot—there's no limit to how many times you can change your pinned videos.

### 🎬 Managing Your Player

- **Slot Numbers**: Each slot is clearly labeled with a number emoji (1️⃣, 2️⃣, 3️⃣, 4️⃣) for easy identification.
- **Overwrite Any Slot**: Select any slot to replace its video instantly.
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
