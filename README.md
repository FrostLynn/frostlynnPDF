# FrostlynnPDF ❄️

> **Neo-Brutalist PDF Tools. 100% Client-Side. No BS.**

FrostlynnPDF is a modern, privacy-focused PDF manipulation tool suite built with a bold Neo-Brutalist aesthetic. Designed as a secure, client-side alternative to **iLovePDF** and **Smallpdf**, all processing happens directly in your browser—your files never leave your device.


## 🛠️ Tech Stack

Built with cutting-edge web technologies:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Neo-Brutalist Theme)
- **PDF Core**: [PDF-Lib](https://pdf-lib.js.org/) (Generation/Modification)
- **Rendering**: [React-PDF](https://github.com/wojtekmaj/react-pdf) (Previews)
- **Interactivity**: 
  - `react-draggable` (Positioning)
  - `@dnd-kit` (Reordering)
  - `react-dropzone` (File Uploads)
  - `react-signature-canvas` (Drawing)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher.
- **Package Manager**: npm, yarn, pnpm, or bun.

### Installation

1. Clone or download the repository.
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🐳 Docker Deployment

You can containerize and run FrostlynnPDF using Docker.

### Using Docker Compose (Recommended)

Build and start the container with a single command:

```bash
docker compose up -d --build
```

The application will be running at [http://localhost:3001](http://localhost:3001).

### Manual Build

1. **Build the image:**

   ```bash
   docker build -t frostlynn-pdf .
   ```

2. **Run the container:**

   ```bash
   # Map host port 3001 to container port 3000
   docker run -d -p 3001:3000 frostlynn-pdf
   ```

## 🎨 Design Philosophy

**Neo-Brutalism**: High contrast, bold borders, hard shadows, and vibrant accent colors (Purple, Pink, Green). The UI is designed to be tactile and fun, moving away from the sterile "SaaS" look.

## 🔒 Privacy

**Zero Server Processing.**
This tool uses WebAssembly and JavaScript libraries to process PDF binaries strictly on the client side. We do not store, upload, or analyze your documents.

## 📝 License

MIT. Hack away.
