# TrendLens Chrome Extension

AI-powered chart analysis extension that provides instant insights on graphs and charts found on any webpage.

## Features

- 🎯 **Interactive Chart Selection**: Drag to select any chart area on webpages
- 🤖 **AI-Powered Analysis**: Advanced pattern recognition and insights
- 📊 **Visual Annotations**: Results displayed directly on charts
- 🔐 **Secure API Key Management**: Local storage with encryption
- ⚡ **Real-time Processing**: Fast analysis with loading indicators
- 🎨 **Modern UI**: Clean, responsive design with smooth animations

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (for testing)
- Google Gemini API key (optional for AI features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd trendlens-extension
   npm install
   cd backend && npm install && cd ..
   ```

2. **Build the extension:**
   ```bash
   npm run build:extension
   ```

3. **Start the backend service:**
   ```bash
   cd backend
   npm start
   ```

4. **Load extension in Chrome:**
   - Open Chrome Extensions page (`chrome://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. **Configure API Key:**
   - Click the TrendLens extension icon
   - Enter your Google Gemini API key
   - Click "Save API Key"

2. **Analyze Charts:**
   - Navigate to any webpage with charts
   - Click "Start Chart Analysis"
   - Drag to select the chart area
   - View AI-generated insights and annotations

## Development

### Frontend Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build React app
npm run type-check   # TypeScript type checking
```

### Backend Development
```bash
cd backend
npm run dev          # Start backend with auto-reload
```

### Extension Development
```bash
npm run build:extension  # Build complete extension package
```

## Project Structure

```
trendlens-extension/
├── src/
│   ├── popup/           # React popup UI
│   ├── content/         # Content scripts
│   └── styles/          # Global styles
├── backend/
│   ├── services/        # AI analysis services
│   └── server.js        # Express server
├── lib/                 # External libraries
├── scripts/             # Build scripts
└── dist/                # Built extension (generated)
```

## API Integration

The extension supports multiple AI services:

- **Google Gemini Pro Vision** (recommended)
- **OpenAI GPT-4 Vision** (alternative)
- **HuggingFace Models** (free tier option)

Configure your preferred service in `backend/.env`:

```env
PORT=3001
GOOGLE_API_KEY=your_api_key_here
```

## Architecture

### Frontend (Chrome Extension)
- **React + TypeScript** for popup UI
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Chrome Extensions API** for browser integration

### Backend (Node.js)
- **Express.js** server with CORS support
- **Multer** for image upload handling
- **AI service integration** for chart analysis
- **Stateless design** for scalability

### Security Features
- Local API key storage using `chrome.storage.local`
- Input validation and sanitization
- File type and size restrictions
- CORS configuration for extension origins

## Browser Compatibility

- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+ (Chromium-based)
- ⏳ Firefox (Manifest V3 support planned)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting guide
- Review the API documentation

---

Built with ❤️ for traders, analysts, and data enthusiasts.