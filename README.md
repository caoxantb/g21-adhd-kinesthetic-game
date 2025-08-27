# HOPAHOP - Therapeutic Gaming for ADHD

## 📖 Project Overview

HOPAHOP is a web-based therapeutic game designed for children with ADHD,
combining physical activity with cognitive challenges to enhance focus,
self-regulation, and motor coordination.

## ✨ Features

- **Gestural Interaction**: Uses a Kinect device for real-time motion tracking.
- **Structured Gameplay**: Alternates between active jumping phases and
  stillness-holding challenges.
- **Therapeutic Benefits**: Encourages focus, motor skill development, and
  self-regulation.

## 🛠️ Technical Environment

- **Web-based Interface**: Accessible via standard browsers.
- **Motion Tracking**: Kinect device captures movements.
- **Real-time Processing**: Kinectron server transmits movement data.
- **Backend System**: Manages game logic and player data.

## Usage

- Start the game and follow on-screen instructions.
- Engage in movement and stillness challenges.
- Track progress and improve focus through interactive gameplay.

## License

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/)
- Ensure a Kinect device is connected to your system.
- Set up the Kinectron server to process motion data.

In the case that you don't have a Kinect device, please view this slides and
document to understand how it works:

- https://tinyurl.com/g21-adhd-game-slides
- https://tinyurl.com/g21-adhd-game-report

### Installation

1. Browse the backend directory, install dependencies and start the development
   server:

   ```bash
   cd server
   npm install
   npm run dev
   ```

2. Browse the frontend directory, install dependencies and start the localhost:

   ```bash
   cd app
   npm install
   npm run dev
   ```

3. Open your browser and navigate to:

   ```bash
   http://localhost:5173/
   ```
