# Security Guidelines for ArbDetector

## ⚠️ Critical: Never Commit Secrets

This project handles sensitive API keys, secrets, and tokens. Follow these guidelines strictly:

### 1. **Environment Variables**
- **NEVER** commit `.env` files to Git
- Use `.env.example` as a template (it's safe to commit)
- Copy `.env.example` → `.env` and fill with real values locally
- Each developer should have their own `.env` file

### 2. **Sensitive Credentials**
Keep these ONLY in `.env`, NEVER in code:
- `KALSHI_ORDER_API_KEY` & `KALSHI_ORDER_API_SECRET`
- `POLYMARKET_ORDER_API_KEY` & `POLYMARKET_ORDER_API_SECRET`
- `TELEGRAM_BOT_TOKEN`
- Any database passwords or connection strings

### 3. **Git Protection**
The `.gitignore` file protects you from accidental commits:
```
.env                    # Local environment variables
.env.*.local            # Environment-specific files
node_modules/           # Dependencies
```

### 4. **If You Accidentally Committed Secrets**

If you ever commit real secrets to GitHub (even to a private repo), immediately:

1. **Stop using that token/key** - Revoke it on the platform
2. **Clean Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push --force --all
   ```
3. **Generate new API keys** from Kalshi, Polymarket, and Telegram

### 5. **Deployment Best Practices**

- **Vercel/Heroku**: Use platform's "Config Vars" or "Secrets" feature instead of `.env` files
- **GitHub Actions**: Use GitHub Secrets for CI/CD workflows
- **Docker**: Pass secrets via environment variables, NOT in Dockerfile
- **Production**: Use platform-specific secret management (AWS Secrets Manager, etc.)

### 6. **Code Review Checklist**

Before committing:
- [ ] No API keys in `.js` files
- [ ] No tokens hardcoded in strings
- [ ] All secrets use `process.env.*`
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has only dummy values

### 7. **API Security**

Your backend (`/opportunities` endpoint):
- ✅ Validates all order payloads
- ⚠️ Consider adding rate limiting to prevent abuse
- ⚠️ Add CORS headers for Vercel deployment
- ⚠️ Log sensitive data securely (never log API keys)

### 8. **Frontend Security**

Your dashboard exposes:
- Market data (public, safe)
- API endpoint URL (consider using relative paths)
- Real-time scan results (safe)

**No secrets in frontend code** ✅

## Questions?

If you're unsure about security practices, always ask before deploying.
