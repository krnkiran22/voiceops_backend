# 🎙️ VoiceOps Unified Server (API + Bot)

This repository contains both the **VoiceOps REST API** and the **Telegram Bot**. 
They run together in a single Node.js process to save resources and simplify deployment.

## 🚀 Setup & Deployment

### 1. Environment Variables
You need to set these in Render (or your `.env` file):

```env
# Server Config
PORT=4000
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
BOT_API_KEY=any_shared_key
CORS_ORIGIN=*

# Bot Config
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_groq_or_openai_key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=your_frontend_url
TEMP_DIR=/tmp
```

### 2. How to Run
```bash
npm install
npm run build
npm run start
```

### 3. Deploy to Render
- **Service Type**: Web Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Region**: Choose one close to you.
