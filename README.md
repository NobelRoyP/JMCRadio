# JMC Radio - College Podcast Webapp

A Spotify-like radio webapp for your college where creators can upload daily podcasts and students can listen to them.

## Features

- **Student View** (`/player`): Browse and play all episodes like a music app
- **Creator Admin** (`/admin`): Upload new episodes with title, date, description
- **JSON Data Storage**: No database required - episodes stored in `data/episodes.json`
- **Audio File Upload**: Supports MP3, WAV, and other audio formats (up to 100MB)
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

### 3. Optional: Development Mode

```bash
npm run dev
```

## Project Structure

```
JMC Radio/
├── server.js              # Express backend
├── package.json
├── data/
│   └── episodes.json      # Podcast episodes (auto-created)
└── public/
    ├── index.html         # Home page
    ├── player.html        # Student listening page
    ├── admin.html         # Creator upload page
    ├── login.html         # Login page
    └── styles.css         # Stylesheet
```

## How It Works

1. **Players** visit `/player` to see all episodes in a Spotify-like grid
2. **Creators** visit `/admin` to upload new episodes
3. All episodes are stored in `data/episodes.json` with metadata
4. Audio files are saved to `public/uploads/`
5. The player uses HTML5 audio with a modal overlay