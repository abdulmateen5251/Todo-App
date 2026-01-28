# Google Gemini API Integration Guide

## ✅ Setup Complete!

Backend ab **Google Gemini API** use kar raha hai OpenAI ki jagah.

---

## 🔑 Get Free Gemini API Key

### Step 1: Google AI Studio Visit Karein
```
https://aistudio.google.com/app/apikey
```

### Step 2: API Key Generate Karein
1. Google account se sign in karein
2. "Create API Key" button par click karein
3. API key copy karein (example: `AIzaSyXXXXXXXXXXXXXXXXX`)

**Important:** Gemini API **FREE** hai limited usage ke liye!

---

## 🚀 Configuration

### Option 1: Docker Compose (Recommended)

**Create `.env` file in project root:**
```bash
cd /home/abdul-matten/Desktop/Todo_App/Todo-App
nano .env
```

**Add this:**
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
```

**Restart containers:**
```bash
docker compose down
docker compose up -d
```

### Option 2: Direct Environment Variable
```bash
export GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
docker compose up -d
```

---

## 📝 Changes Made

### 1. **backend/src/agent.py**
```python
# OLD (OpenAI)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
DEFAULT_MODEL = "gpt-4"

# NEW (Gemini)
openai_client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
DEFAULT_MODEL = "gemini-2.0-flash-exp"
```

### 2. **docker-compose.yml**
```yaml
environment:
  GEMINI_API_KEY: ${GEMINI_API_KEY:-}  # Changed from OPENAI_API_KEY
```

---

## 🎯 Available Gemini Models

### Fast & Free (Recommended for Todo App):
- `gemini-2.0-flash-exp` - Latest, fastest (default)
- `gemini-1.5-flash` - Stable, fast

### Advanced (More capable):
- `gemini-1.5-pro` - Better reasoning
- `gemini-2.0-pro-exp` - Most advanced

**To change model:** Edit `DEFAULT_MODEL` in `backend/src/agent.py`

---

## ✅ Test Karne Ka Tarika

### 1. Check API Key Set Hai Ya Nahi
```bash
docker exec todo-backend printenv | grep GEMINI
```

**Expected output:**
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
```

### 2. Backend Logs Check Karein
```bash
docker logs todo-backend --tail 50
```

### 3. Chat Test Karein

**From Dashboard:**
1. Sign in to http://localhost:3000/dashboard
2. Click "AI Assistant" in sidebar
3. Type: "Show me all my tasks"
4. Agar API key sahi hai, response milega

**From Terminal:**
```bash
# First login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.access_token')

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a task to test Gemini integration"}'
```

---

## 🆚 OpenAI vs Gemini Comparison

| Feature | OpenAI GPT-4 | Google Gemini |
|---------|--------------|---------------|
| **Cost** | Paid ($) | **FREE** (with limits) |
| **Speed** | Medium | **Fast** |
| **Quality** | Excellent | Very Good |
| **Rate Limits** | Low (paid tier) | **60 requests/min free** |
| **Best For** | Production apps | **Development & Testing** |

---

## 🔧 Troubleshooting

### Error: "Could not validate credentials"
- Check if GEMINI_API_KEY is set: `docker exec todo-backend printenv | grep GEMINI`
- Restart backend: `docker restart todo-backend`

### Error: "Invalid API key"
- Verify key is correct from https://aistudio.google.com/app/apikey
- Make sure no extra spaces in .env file

### Error: "Rate limit exceeded"
- Free tier: 60 requests/minute
- Wait 1 minute and try again
- Or upgrade to paid tier

### Chat Response Slow
- Try `gemini-2.0-flash-exp` (fastest model)
- Check internet connection
- Gemini servers may be busy

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 60 requests per minute
   - 1500 requests per day
   - Perfect for development!

2. **Best Model for Todo App:**
   - Use `gemini-2.0-flash-exp` for speed
   - Use `gemini-1.5-pro` if you need better reasoning

3. **Production:**
   - Consider upgrading to paid tier for higher limits
   - Or use multiple API keys with rotation

4. **Security:**
   - Never commit API key to git
   - Use environment variables only
   - Rotate keys periodically

---

## 📚 Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Get Free API Key:** https://aistudio.google.com/app/apikey
- **Pricing:** https://ai.google.dev/pricing
- **Rate Limits:** https://ai.google.dev/gemini-api/docs/quota

---

## ✅ Quick Start (TL;DR)

```bash
# 1. Get API key from https://aistudio.google.com/app/apikey

# 2. Create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env

# 3. Restart
docker compose down && docker compose up -d

# 4. Test
# Open http://localhost:3000/dashboard → AI Assistant
```

**Status: ✅ Ready to use Gemini API (FREE)!**
