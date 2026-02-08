# 🚀 Vercel Deployment - Quick Guide

## आपका Todo App Vercel पर deploy करने के लिए तैयार है!

### 📝 Quick Steps:

1. **Setup Script चलाएं:**
   ```bash
   ./vercel-deploy.sh
   ```

2. **GitHub पर code push करें:**
   ```bash
   git push origin main
   ```

3. **Database Setup (Free - Neon):**
   - https://neon.tech पर जाएं
   - GitHub से sign up करें
   - Project बनाएं: `todo-app-db`
   - Connection string copy करें

4. **Backend Deploy करें:**
   - https://vercel.com/new पर जाएं
   - GitHub repo import करें
   - Project Name: `todo-app-api`
   - Root Directory: `backend`
   - Environment variables add करें

5. **Frontend Deploy करें:**
   - Same repo को फिर से import करें
   - Project Name: `todo-app-frontend`
   - Root Directory: `frontend`
   - Environment variables add करें

### 🔑 Environment Variables:

#### Backend:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
OPENAI_GEMINI_MODE=false
GEMINI_API_KEY=your_key
CORS_ORIGINS=https://todo-app-frontend.vercel.app
```

#### Frontend:
```
NEXT_PUBLIC_API_URL=https://todo-app-api.vercel.app
NEXTAUTH_URL=https://todo-app-frontend.vercel.app
NEXTAUTH_SECRET=generated_secret
BETTER_AUTH_URL=https://todo-app-frontend.vercel.app
BETTER_AUTH_SECRET=generated_secret
```

### 🛠️ Generate Secrets:
```bash
openssl rand -base64 32
```

---

## ✅ Checklist:
- [ ] Script run की गई
- [ ] Code GitHub पर push हुआ
- [ ] Database create किया
- [ ] Backend deploy हुआ
- [ ] Frontend deploy हुआ
- [ ] CORS update किया
- [ ] App test किया

**Done! 🎉 आपका Todo App live है!**