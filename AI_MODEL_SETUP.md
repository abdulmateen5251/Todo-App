# AI Model Configuration Guide

The application now supports **two AI providers** for the chat/MCP functionality:

## 🤖 Available Options

### 1. **OpenAI (gpt-4o-mini)** - Paid but powerful
- Model: `gpt-4o-mini`
- Fast, efficient, and cost-effective
- Requires OpenAI API key
- Better function calling reliability

### 2. **Google Gemini (gemini-2.0-flash-exp)** - FREE
- Model: `gemini-2.0-flash-exp`
- Completely free tier available
- Requires Google AI Studio API key
- Excellent performance

---

## ⚙️ Configuration

Edit your `.env` file:

```env
# Set to 'true' for OpenAI, 'false' for Gemini
OPENAI_GEMINI_MODE=true

# OpenAI API Key (only needed if OPENAI_GEMINI_MODE=true)
OPENAI_API_KEY=sk-proj-xxx...

# Gemini API Key (only needed if OPENAI_GEMINI_MODE=false)
GEMINI_API_KEY=AIzaSyC_xxx...
```

---

## 🔑 Getting API Keys

### OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. Add to `.env`: `OPENAI_API_KEY=sk-proj-xxx...`

### Gemini API Key (FREE):
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API key"
4. Copy the key (starts with `AIza`)
5. Add to `.env`: `GEMINI_API_KEY=AIza...`

---

## 🚀 Usage Examples

### Use OpenAI (Recommended for Production)

```env
OPENAI_GEMINI_MODE=true
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
```

**Restart backend:**
```bash
cd backend
python src/main.py
```

You should see:
```
🤖 AI Mode: OpenAI (Model: gpt-4o-mini)
```

### Use Gemini (FREE - Great for Development)

```env
OPENAI_GEMINI_MODE=false
GEMINI_API_KEY=AIzaSyC_YOUR-ACTUAL-KEY-HERE
```

**Restart backend:**
```bash
cd backend
python src/main.py
```

You should see:
```
🤖 AI Mode: Gemini (Model: gemini-2.0-flash-exp)
```

---

## 💰 Cost Comparison

### OpenAI (gpt-4o-mini)
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens
- ~1000 chat messages = $0.10 - $0.50
- **Best for**: Production, reliability

### Google Gemini (Free Tier)
- **15 requests per minute** (FREE)
- **1 million tokens per day** (FREE)
- **1500 requests per day** (FREE)
- **Best for**: Development, testing, personal use

---

## 🧪 Testing

After changing the mode, test the chat:

1. Start backend: `cd backend && python src/main.py`
2. Open frontend: http://localhost:3000/dashboard
3. Click "AI Assistant"
4. Send: "Create a task called 'test' with high priority"
5. Check backend logs for model confirmation

---

## 🐛 Troubleshooting

### Error: "Invalid OPENAI_API_KEY"
- Make sure you set a real OpenAI key (starts with `sk-`)
- Don't use the Gemini key in OPENAI_API_KEY field

### Error: "GEMINI_API_KEY not found"
- Set OPENAI_GEMINI_MODE=false to use Gemini
- Make sure GEMINI_API_KEY is set in .env

### Which mode am I using?
Check backend startup logs:
```
🤖 AI Mode: OpenAI (Model: gpt-4o-mini)
```
or
```
🤖 AI Mode: Gemini (Model: gemini-2.0-flash-exp)
```

---

## 📊 Model Comparison

| Feature | OpenAI (gpt-4o-mini) | Gemini (flash-exp) |
|---------|---------------------|-------------------|
| Cost | Paid (~$0.001/chat) | **FREE** |
| Speed | ⚡ Very Fast | ⚡ Very Fast |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Function Calling | Excellent | Very Good |
| Rate Limit | High | 15/min (free) |
| **Recommended For** | Production | Development |

---

## 🔄 Switching Models

You can switch anytime without code changes:

1. Edit `.env` → Change `OPENAI_GEMINI_MODE`
2. Add the required API key
3. Restart backend
4. Done! ✅

---

**Current Setup:**
- File: `/backend/src/agent.py`
- Environment: `/.env`
- Both models use the same MCP tools and system prompt
