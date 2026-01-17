# Hugging Face Space Logs Access Guide

## 🔑 Step 1: Get Your HF Token

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name: `todo-app-logs`
4. Select "Read" access
5. Copy the token

## 📦 Step 2: Set Up Environment Variable

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export HF_TOKEN='your_token_here'

# Verify it works
echo $HF_TOKEN
```

Or set temporarily for one session:
```bash
export HF_TOKEN='your_token_here'
```

## 🚀 Step 3: Use the Log Viewers

### Option A: Shell Script (Easiest)

```bash
# View all logs
./hf_logs.sh

# View container logs only
./hf_logs.sh container

# View build logs only
./hf_logs.sh build

# View status only
./hf_logs.sh status
```

### Option B: Python Script (More Features)

```bash
# View all logs
python3 check_hf_logs.py

# Container logs
python3 check_hf_logs.py --container

# Build logs
python3 check_hf_logs.py --build

# Space status
python3 check_hf_logs.py --status

# Custom space
python3 check_hf_logs.py --space username/space-name
```

### Option C: Direct CURL Commands

```bash
# Container logs (live stream)
curl -N \
     -H "Authorization: Bearer $HF_TOKEN" \
     "https://huggingface.co/api/spaces/AbdulMateen5251/hacton/logs/run"

# Build logs (live stream)
curl -N \
     -H "Authorization: Bearer $HF_TOKEN" \
     "https://huggingface.co/api/spaces/AbdulMateen5251/hacton/logs/build"

# Space status
curl -s \
     -H "Authorization: Bearer $HF_TOKEN" \
     "https://huggingface.co/api/spaces/AbdulMateen5251/hacton" | jq
```

## 📋 Log Types Explained

| Log Type | Purpose | When to Use |
|----------|---------|-----------|
| **Container Logs** | Runtime output | Debugging API errors, checking if backend is running |
| **Build Logs** | Deployment process | Check deployment issues, build failures |
| **Status** | Space info | Check runtime hardware, deployment status |

## 🔍 What to Look For

### ✅ Healthy Logs
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:7860
```

### ❌ Error Logs
```
ERROR: Failed to connect to database
ERROR: Port already in use
ERROR: Module not found
```

## 🐛 Troubleshooting

**Problem**: `401 Unauthorized`
```
Solution: Check your HF_TOKEN is correct
export HF_TOKEN='correct_token'
```

**Problem**: `No container logs available`
```
Solution: Space might not be running, check status first
python3 check_hf_logs.py --status
```

**Problem**: `Connection timeout`
```
Solution: Try with specific log type
./hf_logs.sh container  # instead of --all
```

## 🔗 Useful Links

- HF Spaces API Docs: https://huggingface.co/docs/hub/spaces-config-reference
- Your Space: https://huggingface.co/spaces/AbdulMateen5251/hacton
- Tokens: https://huggingface.co/settings/tokens

## ✨ Tips

1. **Stream logs to file for later review:**
   ```bash
   ./hf_logs.sh > hf_logs_$(date +%Y%m%d_%H%M%S).txt
   ```

2. **Watch logs in real-time:**
   ```bash
   watch -n 2 './hf_logs.sh container'
   ```

3. **Get last 10 lines only:**
   ```bash
   python3 check_hf_logs.py --container 2>&1 | tail -10
   ```

4. **Filter for errors:**
   ```bash
   ./hf_logs.sh | grep -i error
   ```
