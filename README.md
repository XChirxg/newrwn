# newrwn — Interactive Study Playground 🚀

**newrwn** is a premium, serverless static web application designed to turn dry notes, outlines, and educational materials into interactive visual study decks. Powered by client-side Large Language Models (LLMs), it generates and structures customized study sessions dynamically.

Whether you want to test your memory with an MCQ Quiz, visual slides, or spaced repetition flashcards, **newrwn** transforms raw text into a vibrant, glassmorphic visual learning workspace.

---

## 🌟 Core Study Modules

### 📊 1. Presentation Slides Visualizer
A distraction-free, borderless slideshow engine built to structure concepts beautifully.
* **Diverse Layouts**: Dynamically renders bullet lists, vertical timelines, CSS bar charts, side-by-side pros/cons comparison tables, giant metrics, flow-process diagrams, and blockquotes.
* **Auto-Hide Interface**: Control panel elements fade out after 5 seconds of inactivity for a clean, immersive full-screen experience.
* **Freehand Canvas Overlay**: Sketch directly on slides using an interactive drawing pen tool.
* **Adaptive Theme Engine**: Supports slide-specific background gradients, font coloring, and glowing accent themes.

### 📝 2. MCQ Quiz Engine
A powerful test preparation interface styled cleanly without restrictive container borders.
* **10+ Pre-test Settings**: Toggle practice mode explanations, negative marking (-0.25 points per wrong answer), question timers, skip allowances, score trackers, and question/option shuffling.
* **Dynamic Review**: A comprehensive final scorecard containing score accuracy charts, question-by-question breakdown, and text explanations.

### 🎴 3. Flashcards Deck
An active recall study card system leveraging spaced-repetition metrics.
* **Open 3D Cards**: Clean, floating 3D text cards that flip along the Y-axis.
* **Auto-Mode**: Configurable auto-flip and auto-advance timers to cycle cards hands-free.
* **Rating System**: Traditional Anki rating buttons (Again, Hard, Good, Easy) tracking and updating card priority.

---

## 🛠️ Global Shared Utilities

* **Unified Settings Synchronization**: Click the Settings gear modal in the top nav bar of any tool to change configurations mid-session on the fly.
* **Verbal TTS Speakers**: Built-in speech synthesis (with speed control) to speak concepts, slide outlines, or quiz questions verbally.
* **Warm Study Filter**: Blue light eye-care filter overlay for night sessions.
* **Zen Focus Ambient Sound**: Binaural focus background noise to enhance concentration.
* **Peer-to-Peer Remote Controlling**: Built-in PeerJS integration allowing you to turn your mobile device into a physical slideshow remote by scanning a QR code.

---

## 🚀 Getting Started

**newrwn** is built using modern vanilla HTML, CSS, and Javascript. It runs entirely in the browser with no server installation required.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/XChirxg/newrwn.git
   ```
2. Open `index.html` in your browser.
3. Paste a topic, select your study tool, and begin learning!

---

## 📂 Project Structure

```
├── index.html          # Main landing dashboard & LLM generator config
├── shared.js           # Shared core script (PeerJS remote, Text-to-Speech, settings modal)
├── style.css           # Premium dark theme responsive styling
├── tools.html          # Quick homepage redirector
└── tools/
    ├── ppt.html        # Slides Visualizer
    ├── quiz.html       # MCQ Quiz Engine
    └── flashcards.html # Flashcards Deck
```

---

## 🎨 Design Philosophy
* **Rich Glassmorphism**: Tailored glowing gradients, blur backdrops, and vibrant accent hues.
* **Dynamic Feedback**: Hover animations, scale states, and seamless loading indicators.
* **Eye-Care Comfort**: Built-in warm study filters and zen audio.
