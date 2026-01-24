# Security Best Practices - Todo App

## 🔒 Secret Management

### ✅ DO:
1. **Use environment variables** for all secrets
2. **Never commit** `.env`, `.env.local`, `.env.production` files
3. **Generate strong secrets**: `openssl rand -base64 32`
4. **Rotate secrets** every 90 days or after exposure
5. **Use different secrets** for dev/staging/production
6. **Enable 2FA** on all cloud services

### ❌ DON'T:
1. **Never hardcode secrets** in source code
2. **Never commit secrets** to version control
3. **Never share secrets** in documentation
4. **Never use weak secrets** like "secret123"
5. **Never reuse secrets** across services
6. **Never expose** `.env` files publicly

---

## 🛡️ Environment Variable Security

### Backend (.env)
```bash
# ✅ CORRECT - Never committed to git
# backend/.env (in .gitignore)
DATABASE_URL='postgresql://user:pass@host/db'
BETTER_AUTH_SECRET='<strong-random-secret>'
```

### Frontend (.env.local)
```bash
# ✅ CORRECT - Never committed to git
# frontend/.env.local (in .gitignore)
NEXT_PUBLIC_API_URL='https://api.example.com'
NEXTAUTH_SECRET='<strong-random-secret>'
```

### Example Files
```bash
# ✅ CORRECT - Committed with placeholders
# backend/.env.example
DATABASE_URL='postgresql://user:password@localhost:5432/dbname'
BETTER_AUTH_SECRET='your-secret-here-min-32-chars'
```

---

## 🔐 Generating Secure Secrets

### OpenSSL (Recommended)
```bash
# Generate 32-byte base64 secret
openssl rand -base64 32

# Generate hex secret
openssl rand -hex 32
```

### Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🔍 Detecting Secrets in Code

### Git Secrets (Pre-commit Hook)
```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
sudo apt install git-secrets  # Linux

# Initialize in repo
cd /path/to/repo
git secrets --install
git secrets --register-aws
git secrets --add 'BETTER_AUTH_SECRET.*=.*'
git secrets --add 'DATABASE_URL.*=.*'
```

### Gitleaks
```bash
# Install gitleaks
brew install gitleaks

# Scan repository
gitleaks detect --source . --verbose

# Scan commits
gitleaks protect --staged
```

### TruffleHog
```bash
# Install trufflehog
pip install trufflehog

# Scan repository
trufflehog filesystem /path/to/repo
```

---

## 🚨 Incident Response Plan

### If Secrets Are Exposed:

1. **Immediate (< 1 hour)**
   - [ ] Rotate the exposed secret immediately
   - [ ] Update all services using the secret
   - [ ] Revoke the old secret
   - [ ] Check for unauthorized access

2. **Short-term (< 24 hours)**
   - [ ] Remove secrets from git history (BFG)
   - [ ] Force push cleaned history
   - [ ] Notify team members
   - [ ] Update documentation

3. **Long-term (< 1 week)**
   - [ ] Review security policies
   - [ ] Implement pre-commit hooks
   - [ ] Enable secret scanning
   - [ ] Security training for team

---

## 🔧 Tools & Services

### Secret Scanning
- **GitGuardian**: Real-time secret detection
- **GitHub Secret Scanning**: Native GitHub feature
- **AWS Secrets Manager**: Cloud secret storage
- **HashiCorp Vault**: Enterprise secret management

### Monitoring
- **Vercel**: Deployment logs and monitoring
- **Sentry**: Error tracking
- **DataDog**: Application monitoring
- **CloudFlare**: DDoS protection

---

## 📋 Security Checklist

### Repository Setup
- [x] `.gitignore` includes `.env*` files
- [x] `.env.example` with placeholders only
- [ ] Pre-commit hooks for secret scanning
- [ ] GitHub secret scanning enabled
- [ ] Branch protection rules enabled

### Production Deployment
- [ ] Secrets stored in Vercel/Platform env vars
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints

### Database Security
- [ ] Strong password (rotated regularly)
- [ ] SSL/TLS required
- [ ] IP whitelist configured
- [ ] Read-only users for reporting
- [ ] Regular backups enabled
- [ ] Encryption at rest enabled

### Authentication
- [ ] JWT secrets rotated quarterly
- [ ] Session timeout configured
- [ ] 2FA available for users
- [ ] Password reset flow secure
- [ ] Account lockout after failed attempts
- [ ] CSRF protection enabled

---

## 🎯 Todo App Specific Security

### Current Configuration

#### Backend (FastAPI)
- Authentication: Better Auth
- Database: Neon PostgreSQL (SSL required)
- Secrets: Environment variables only
- CORS: Configured for frontend domain

#### Frontend (Next.js)
- Authentication: NextAuth.js + Better Auth
- API: HTTPS only
- Secrets: Environment variables
- CSP: Configured with security headers

#### Deployment
- **Frontend**: Vercel (HTTPS, CDN, DDoS protection)
- **Backend**: Hugging Face Spaces (HTTPS, auto-sleep)
- **Database**: Neon (SSL, automated backups)

---

## 📊 Audit Log

### Security Events
| Date | Event | Action | Status |
|------|-------|--------|--------|
| 2026-01-25 | GitGuardian Alert: Exposed BETTER_AUTH_SECRET | Rotated secret | ✅ Resolved |
| 2026-01-24 | Added security headers | Configured CSP | ✅ Complete |
| 2026-01-24 | Fixed "Dangerous site" warning | Updated config | ✅ Complete |

---

## 🔄 Regular Maintenance

### Monthly
- [ ] Review access logs
- [ ] Check for dependency vulnerabilities (`npm audit`)
- [ ] Review environment variables
- [ ] Test backup restoration

### Quarterly
- [ ] Rotate all secrets
- [ ] Security audit
- [ ] Update dependencies
- [ ] Penetration testing

### Annually
- [ ] Full security review
- [ ] Update security policies
- [ ] Team security training
- [ ] Compliance check

---

## 📞 Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Better Auth Docs](https://www.better-auth.com/docs)

### Tools
- [Have I Been Pwned](https://haveibeenpwned.com/)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Observatory](https://observatory.mozilla.org/)

---

**Last Updated**: January 25, 2026  
**Next Review**: April 25, 2026
