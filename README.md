# Arcade Room — Interactive Gaming Platform

A full-stack single-page application where registered users play a collection of mini-games, track their performance, and chat in real time. Built with Angular and Firebase, featuring authentication, real-time data storage, protected routes, and per-player statistics.

**🔗 Live demo:** https://sala-de-juegos-2025.web.app/

<!-- OPTIONAL: a hero screenshot of the home screen looks great here. Drop it in assets/ and uncomment the line below -->
<!-- ![Home screen](assets/home.png) -->

---

## Features

- **Authentication** — user registration and login validated against Firebase, with automatic session handling. Login and register buttons are hidden once the user is authenticated.
- **Access logging** — every successful login is recorded in Firebase (user + timestamp).
- **Real-time chat** — logged-in users can join a shared chat room; each message is tagged with the sender and the time it was sent.
- **Protected routes** — admin-only sections guarded with Angular `CanActivate` guards.
- **Per-player statistics** — every game result (user, date, score) is stored, and results are listed in a dedicated section.
- **User survey** — a reactive form with validation (age 18–99, phone number format, multiple control types) whose answers are saved to Firebase.
- **Modular architecture** — feature modules loaded on demand via lazy loading (`loadChildren`) to keep initial load times low.

## Games

| Game | Description |
|------|-------------|
| **Hangman** | Classic word-guessing game. Letters are entered through on-screen buttons (no keyboard input). |
| **Higher or Lower** | The player predicts whether the next card from the deck is higher or lower, scoring a point for each correct guess. |
| **Trivia (Preguntados)** | Image-based trivia. Images are fetched from an external API through an injectable Angular service; the player answers via multiple choice. |
| **[Your custom game]** | <!-- TODO: describe your own game here — what it is and how it's played --> |

<!-- SCREENSHOTS: put one image per game in the assets/ folder and update the filenames below.
     Suggested names: hangman.png, higher-lower.png, trivia.png, custom-game.png -->

### Hangman
![Hangman](assets/assets/presentacion/hangman.png)

### Higher or Lower
![Higher or Lower](assets/higher-lower.png)

### Trivia
![Trivia](assets/trivia.png)

### FlowFree
![Flow Free](assets/flowfree.jpg)

## Tech Stack

- **Frontend:** Angular, TypeScript, RxJS
- **Backend / Database:** Firebase (Authentication + Realtime Database)
- **UI:** Angular Material / PrimeNG / Bootstrap, CSS animations
- **Hosting:** Firebase Hosting

## Architecture Highlights

- Lazy-loaded feature modules to reduce the initial bundle size.
- External REST API consumption isolated in injectable services.
- Route protection through `CanActivate` guards for role-based access (admin sections).
- Reactive forms with custom validation for the user survey.
- No native `alert()` — all user feedback is handled through in-app UI components.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/nachomonllor/sala-de-juegos-2025.git
cd sala-de-juegos-2025

# Install dependencies
npm install

# Run the development server
ng serve
```

Then open `http://localhost:4200/` in your browser.

> **Note:** This project uses Firebase. To run it with your own backend, create a Firebase project and add your configuration to the environment files (`src/environments/`).

## About

Built as a full-stack learning project to practice Angular architecture, real-time data, authentication flows, and reactive forms. Part of my developer portfolio — see more at [github.com/nachomonllor](https://github.com/nachomonllor).

