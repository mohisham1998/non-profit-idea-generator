# AI Provider Configuration Guide

This application supports multiple AI providers. You only need **ONE** of these options to get started.

## 🎯 Recommended Options

### Option 1: OpenAI (Recommended) ⭐

**Best for:** Production use, highest quality results

**Cost:** Pay-as-you-go, ~$0.10 per 1000 requests
- GPT-4: $0.03/1K input tokens, $0.06/1K output tokens
- GPT-3.5-Turbo: $0.0005/1K input tokens, $0.0015/1K output tokens

**Setup:**

1. **Create an OpenAI account:**
   - Go to: https://platform.openai.com/signup
   
2. **Add credits to your account:**
   - Go to: https://platform.openai.com/account/billing
   - Add at least $5 to start

3. **Get your API key:**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

4. **Add to `.env`:**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

---

### Option 2: OpenRouter 🌐

**Best for:** Access to multiple AI models, cost flexibility

**Cost:** Varies by model ($0.06 - $20 per 1M tokens)
- Free tier available with limited usage
- Access to GPT-4, Claude, Gemini, and more

**Setup:**

1. **Create an account:**
   - Go to: https://openrouter.ai/
   - Sign up with Google/GitHub

2. **Get free credits (optional):**
   - New accounts get $1 free credit
   - Or add credits: https://openrouter.ai/credits

3. **Get your API key:**
   - Go to: https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-or-...`)

4. **Add to `.env`:**
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   ```

**Available Models:**
- `openai/gpt-4` - Best quality
- `anthropic/claude-3.5-sonnet` - Great for analysis
- `google/gemini-pro` - Fast and cost-effective
- `meta-llama/llama-3.1-70b` - Open source, good balance

---

### Option 3: Local AI (Free but requires setup) 💻

**Best for:** Development, no API costs, complete privacy

**Requirements:** Powerful computer (16GB+ RAM recommended)

**Options:**

#### A. Ollama (Easiest)

1. **Install Ollama:**
   - Download from: https://ollama.com/download
   - Windows/Mac/Linux supported

2. **Download a model:**
   ```bash
   ollama pull llama3.1:8b
   # Or for better quality (requires more RAM):
   ollama pull llama3.1:70b
   ```

3. **Start Ollama server:**
   ```bash
   ollama serve
   ```

4. **Add to `.env`:**
   ```env
   CUSTOM_LLM_URL=http://localhost:11434/v1/chat/completions
   OPENAI_API_KEY=ollama  # Any value works for local
   ```

#### B. LM Studio

1. **Download LM Studio:**
   - Go to: https://lmstudio.ai/
   - Install for your OS

2. **Download a model:**
   - Open LM Studio
   - Search and download "Llama 3.1" or "Mistral"

3. **Start the server:**
   - Click "Local Server" tab
   - Click "Start Server"
   - Note the URL (usually `http://localhost:1234`)

4. **Add to `.env`:**
   ```env
   CUSTOM_LLM_URL=http://localhost:1234/v1/chat/completions
   OPENAI_API_KEY=lmstudio  # Any value works for local
   ```

---

## 🔧 Configuration Details

### Environment Variables

The application checks for API keys in this priority order:

1. `BUILT_IN_FORGE_API_KEY` - Manus Forge API (if you have it)
2. `OPENROUTER_API_KEY` - OpenRouter
3. `OPENAI_API_KEY` - OpenAI or local model
4. `CUSTOM_LLM_URL` - Custom endpoint URL

**You only need to set ONE of these!**

### Model Selection

By default, the application uses `gemini-2.5-flash`. To change the model:

**For OpenRouter:**
Edit `server/_core/llm.ts` line 308:
```typescript
model: "openai/gpt-4",  // or any model from https://openrouter.ai/models
```

**For OpenAI:**
```typescript
model: "gpt-4-turbo",  // or gpt-3.5-turbo for lower cost
```

**For Local (Ollama/LM Studio):**
```typescript
model: "llama3.1",  // must match the model you downloaded
```

---

## 💰 Cost Comparison

| Provider | Setup Cost | Monthly Cost (est.) | Quality | Speed |
|----------|-----------|---------------------|---------|-------|
| OpenAI GPT-4 | $5 min | $10-50 | ⭐⭐⭐⭐⭐ | Fast |
| OpenAI GPT-3.5 | $5 min | $2-10 | ⭐⭐⭐⭐ | Very Fast |
| OpenRouter (GPT-4) | $0 (free tier) | $5-30 | ⭐⭐⭐⭐⭐ | Fast |
| OpenRouter (Claude) | $0 (free tier) | $10-40 | ⭐⭐⭐⭐⭐ | Fast |
| OpenRouter (Gemini) | $0 (free tier) | $1-5 | ⭐⭐⭐⭐ | Very Fast |
| Local (Ollama) | $0 | $0 | ⭐⭐⭐ | Depends on PC |
| LM Studio | $0 | $0 | ⭐⭐⭐ | Depends on PC |

*Monthly costs assume ~1000 API calls/month*

---

## 🧪 Testing Your Configuration

After setting up your API key, test it:

```bash
# Start the application
docker-compose up -d

# Check logs for errors
docker-compose logs -f app

# Look for these messages:
# ✅ "Server running on port 3000"
# ✅ No "API key not configured" errors
```

Then try generating an idea in the application.

---

## ❓ FAQ

### Which provider should I choose?

- **Want best quality?** → OpenAI GPT-4
- **Want to save money?** → OpenRouter with Gemini
- **Want it free?** → Local with Ollama
- **Need variety?** → OpenRouter (access to multiple models)

### Can I switch providers later?

Yes! Just change the API key in your `.env` file and restart:
```bash
docker-compose restart app
```

### Do I need Manus credentials?

**No!** The Manus Forge API is optional. You can use any of the alternatives above.

### What if I get "API key not configured" error?

Make sure:
1. You've set one of the API key variables in `.env`
2. The `.env` file is in the project root directory
3. You've restarted the application after editing `.env`
4. The API key is valid and has credits (for paid providers)

### Can I use multiple providers?

The application will use the first valid API key it finds. If you want to switch, comment out the others:

```env
# OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

### How do I check my usage/costs?

- **OpenAI:** https://platform.openai.com/usage
- **OpenRouter:** https://openrouter.ai/activity
- **Local:** Always free!

---

## 🔒 Security Best Practices

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use different keys for dev/production**
3. **Set up billing alerts** on OpenAI/OpenRouter
4. **Rotate keys regularly** (every 90 days)
5. **Monitor usage** to catch unexpected costs

---

## 🆘 Troubleshooting

### "Invalid API key" error

- Verify the key is correct (copy-paste again)
- Check if key has expired or been revoked
- For OpenAI: Ensure billing is set up

### "Rate limit exceeded"

- You've hit the API's rate limit
- Wait a few minutes or upgrade your plan
- For local models: Check if the server is running

### "Insufficient credits"

- Add more credits to your account
- OpenAI: https://platform.openai.com/account/billing
- OpenRouter: https://openrouter.ai/credits

### Local model is slow

- Upgrade to a smaller model (e.g., 8B instead of 70B)
- Close other applications
- Consider using a cloud API instead

### Connection refused (local)

```bash
# Make sure server is running:
# For Ollama:
ollama serve

# For LM Studio:
# Open LM Studio → Local Server → Start Server
```

---

## 📚 Additional Resources

- OpenAI Docs: https://platform.openai.com/docs
- OpenRouter Docs: https://openrouter.ai/docs
- Ollama Models: https://ollama.com/library
- LM Studio Models: https://lmstudio.ai/models

---

Need more help? Check the main [README](./README.md) or [Getting Started Guide](./GETTING-STARTED.md).
