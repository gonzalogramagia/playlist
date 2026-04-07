# 🎵 Playlist

**A personal pinned video player for your favorite YouTube music & content.**

"Playlist" lets you quickly pin and manage your most-played videos with an intuitive 4-slot player (1 main + 3 secondary). Each slot is clearly numbered (1️⃣, 2️⃣, 3️⃣, 4️⃣) for instant access. Empty slots show a number emoji and a 💿 (CD) icon.

---

## ✨ Key Features

- **💾 Persistent Storage**: Everything (videos and notes) is automatically saved in `localStorage`.
- **🔄 Move, Swap & Clean**:
  - Instantly move a video to an empty slot or swap positions with another video.
  - Safety first: Double-check confirmation for video removal.
- **📝 Persistent Video Notes**:
  - Add editable notes to any pinned video.
  - Notes are linked to the specific video, so they persist if you move it between slots.
  - Automatically synced to your local Library for long-term storage.
- **📱 Responsive & Interactive**:
  - **Desktop (XL+)**: Notes reveal with an elegant hover/click animation in a dedicated sidebar.
  - **Mobile/Tablet**: Notes stay expanded for quick access and better readability.
- **🌍 Internationalization**: Fully localized interface with English (EN) and Spanish (ES) support.

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

- Switch between English (EN) and Spanish (ES) by adding or removing `/en` at the end of the URL.

### 📍 Pinning & Managing Videos

- Paste a YouTube URL and select a slot (1️⃣, 2️⃣, 3️⃣, 4️⃣) to pin or replace a video in that position.
- The app validates the link and updates the chosen slot.
- You can always overwrite any slot—there's no limit to how many times you can change your pinned videos.

### 🎬 Managing Your Player

- **Slot Numbers**: Each slot is clearly labeled with a number emoji (1️⃣, 2️⃣, 3️⃣, 4️⃣) for easy identification.
- **Overwrite Any Slot**: Select any slot to replace its video instantly.
- **Remove Video**: Click the "Remove" button (×) on any video to delete it from the player.
- **View Full Details**: Hover over videos to see title and video ID.

### ⚙️ Import/Export

- Import and export your pinned video collections as JSON from the browser console or by manipulating localStorage.

### 🔗 Quick Links
Floating buttons for essential services:
  - **[Home](https://home.hoy.today)**: Productivity dashboard for daily tasks and quick notes.
  - **[Emojis](https://emojis.hoy.today)**: Fast access to emoji library.
  - **Playlist**: You are here!
  - **[Minigame](https://minigame.hoy.today)**: Take a break and play Antipala Pro.
  - **[Moovimiento](https://moovimiento.com/en)**: Energize with Moovimiento.

All changes are stored in your browser — no account or login required.



## 📄 License

This project is created for personal use and is shared as-is. Feel free to explore and modify it!

---

Made with 💛 by [Gonza](https://github.com/gonzalogramagia)
