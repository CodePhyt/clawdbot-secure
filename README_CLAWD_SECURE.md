# 🛡️ Moltbot + Clawd Secure

**Enterprise-grade WhatsApp gateway with Zero Trust security architecture**

This is [Moltbot](https://github.com/moltbot/moltbot) enhanced with the [Clawd Secure](https://github.com/CodePhyt/Crypto-Arbitrage-Sniper) 5-Directive security framework.

---

## 🔒 Security Directives

### ✅ Directive 1: Network Fortress & Authentication
- **X-GATEWAY-TOKEN** validation on ALL API requests
- Helmet.js HTTP security headers
- CORS protection
- Fail-secure design (refuses to start with weak credentials)

### ✅ Directive 2: Rootless Docker Execution
- Non-root user (clawduser:1001)
- Capability drops (CAP_DROP: ALL)
- Docker Socket Proxy for controlled API access
- Internal network isolation

### ✅ Directive 3: Anti-Honeypot Data Encryption
- AES-256-GCM authenticated encryption
- PBKDF2 key derivation (100,000 iterations)
- All data at rest is encrypted
- No plaintext secrets on disk

---

## 🚀 Quick Start

### 1. Clone & Initialize

```bash
git clone https://github.com/YOURUSERNAME/clawd-secure-moltbot.git
cd clawd-secure-moltbot
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Secure Installer

```bash
pnpm install:secure
```

**This will:**
- Check prerequisites (Docker, OpenSSL)
- Generate cryptographic tokens (X_GATEWAY_TOKEN, CLAWD_SECRET_KEY)
- Create `.env` file automatically
- Display credentials (**SAVE THEM!**)

### 4. Start Services

```bash
# Build
pnpm build

# Start with Docker
docker-compose -f docker-compose.secure.yml up -d

# Or run locally
pnpm start
```

### 5. Run Smoke Tests

```bash
pnpm test:smoke
```

---

## 📋 Environment Variables

### Security (Clawd Secure)

```env
# Directive 1: Authentication
X_GATEWAY_TOKEN=<64-char-token>  # Auto-generated

# Directive 3: Encryption
CLAWD_SECRET_KEY=<base64-key>    # Auto-generated
CLAWD_DATA_DIR=./data
```

### Moltbot (Original)

```env
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
BOT_NUMBER=+1234567890
```

---

## 🧪 Testing

### Smoke Tests
```bash
pnpm test:smoke
```

**Tests:**
- ✅ Authentication (blocks unauthorized access)
- ✅ Encryption (verifies no plaintext on disk)
- ✅ Security headers (helmet protection)

### Full Test Suite
```bash
pnpm test
```

---

## 🐳 Docker Deployment

### Build & Run

```bash
# Build secure image
docker-compose -f docker-compose.secure.yml build

# Start services
docker-compose -f docker-compose.secure.yml up -d

# View logs
docker-compose -f docker-compose.secure.yml logs -f

# Stop
docker-compose -f docker-compose.secure.yml down
```

### Security Features

- **Rootless**: Runs as `clawduser:1001`
- **Network Isolation**: Internal Docker network
- **Read-only Filesystem**: Optional (set `read_only: true`)
- **Capability Drops**: No privileges
- **Health Checks**: Automatic restart on failure

---

## 🔧 API Usage

All API requests require the `X-GATEWAY-TOKEN` header:

```bash
# Example: Health check
curl -H "X-GATEWAY-TOKEN: your_token_here" \
  http://127.0.0.1:3000/health
```

**Without token:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing X-GATEWAY-TOKEN header"
}
```

---

## 📁 Project Structure

```
clawd-secure-moltbot/
├── src/
│   ├── core/
│   │   └── clawd-secure/          # 🛡️ Security layer
│   │       ├── middleware/
│   │       │   └── security.ts    # Directive 1
│   │       └── memory/
│   │           ├── encryption.ts  # Directive 3
│   │           └── storage.ts     # Directive 3
│   ├── index.ts                   # Patched entry point
│   └── ...                        # Original moltbot code
├── test/
│   └── security-smoke.test.ts     # Security tests
├── scripts/
│   └── secure-install.sh          # One-click installer
├── Dockerfile.secure              # Rootless Dockerfile
├── docker-compose.secure.yml      # Secure stack
└── CONTRIBUTING_SECURITY.md       # Security guidelines
```

---

## 🤝 Contributing

**⚠️ CRITICAL:** This project enforces strict security rules.

Before contributing, **READ:**
- [CONTRIBUTING_SECURITY.md](./CONTRIBUTING_SECURITY.md)

**Security Rules:**
- ❌ **NEVER** remove authentication checks
- ❌ **NEVER** use `exec()` (shell injection risk)
- ❌ **NEVER** store plaintext secrets
- ✅ **ALWAYS** use encrypted storage API
- ✅ **ALWAYS** validate tokens
- ✅ **ALWAYS** run smoke tests before pushing

---

## 📊 Security Audit

**Last Audit:** 2026-01-28  
**Status:** ✅ PASSED  
**Verified:**
- AES-256-GCM implementation
- Token authentication (constant-time comparison)
- Rootless Docker execution
- No shell injection vectors

---

## 📜 License

MIT License - See [LICENSE](./LICENSE)

---

## 🙏 Credits

- **Moltbot:** Original WhatsApp gateway framework
- **Clawd Secure:** Security architecture by CodePhyt
- **Community:** All contributors who make this secure

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/YOURUSERNAME/clawd-secure-moltbot/issues)
- **Security:** Report vulnerabilities privately to security@yourmail.com
- **Docs:** [Moltbot Docs](https://github.com/moltbot/moltbot)

---

**Made with 🛡️ and ⚡ by the Clawd Secure Community**
