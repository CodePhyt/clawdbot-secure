# 🛡️ Clawd Secure
> **The Hardened, Enterprise-Grade Fork of Moltbot**

![Security Audited](https://img.shields.io/badge/Security-Audited-green?style=for-the-badge&logo=shield)
![Docker Rootless](https://img.shields.io/badge/Docker-Rootless-blue?style=for-the-badge&logo=docker)
![Zero Trust](https://img.shields.io/badge/Zero%20Trust-Enabled-purple?style=for-the-badge&logo=auth0)
![License MIT](https://img.shields.io/badge/License-MIT-grey?style=for-the-badge)

---

## 🛑 The "Shodan" Problem
In the age of autonomous agents, convenience often comes at the cost of security. A standard agent listening on `0.0.0.0` is a beacon for botnets.
There are currently **1,000+ exposed AI agents** visible on Shodan, potentially leaking chat logs, API keys, and memory.

**Don't let your digital twin become a zombie.**

**Clawd Secure** is a hardened fork of Moltbot designed for the paranoid. It implements a **Zero Trust** architecture by default, ensuring that even if your server is breached, your agent's memory and control systems remain secure.

---

## 🛡️ Feature Matrix: Why Fork?

| Security Feature | 💀 Original Moltbot | 🛡️ Clawd Secure |
| :--- | :---: | :---: |
| **Execution User** | `root` (Dangerous) | `clawduser:1001` (Rootless) |
| **Network Binding** | `0.0.0.0` (Public) | `127.0.0.1` (Localhost Only) |
| **API Authentication** | ❌ None | ✅ **X-GATEWAY-TOKEN** |
| **Memory Storage** | 📝 Plaintext JSON | 🔐 **AES-256-GCM Encrypted** |
| **Docker Access** | 🔓 Full Socket Mount | 👮 **Socket Proxy** (Read-Only) |
| **Secret Management** | ⚠️ Plaintext .env | 🔑 **PBKDF2 Derived Keys** |

---

## 🏗️ Architecture: Zero Trust

The system creates a **Gatekeeper** layer between the internet and your agent (The Brain).

```mermaid
flowchart LR
    User([👤 User]) <-->|HTTPS| RP[reverse-proxy\n(Caddy/Nginx)]
    RP <-->|X-GATEWAY-TOKEN| GK[🛡️ Gatekeeper\n(Clawd Secure)]
    
    subgraph "Rootless Container"
        GK -->|Protected API| Brain[🧠 Moltbot Core]
        Brain -->|Requests| Ollama[🦙 Ollama]
        Brain <-->|Encrypted| Data[(🔐 Encrypted Storage)]
    end
    
    style GK fill:#11c56e,stroke:#333,stroke-width:2px,color:#fff
    style Data fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff
    style Brain fill:#3b82f6,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🚀 Quick Start (The "One-Click" Setup)

We've automated the hardening process. No manual key generation required.

### 1. Run the Secure Installer
This script generates your **64-char Authentication Token** and **AES-256 Encryption Keys**.

```bash
npm run install:secure
```
*Output: Credentials will be generated and saved to `.env`. Back them up!*

### 2. Launch (Rootless)
Deploy the full stack with the secure Docker Socket Proxy.

```bash
docker-compose -f docker-compose.secure.yml up -d
```

### 3. Verify Security
Run the smoke tests to confirm encryption and authentication are active.

```bash
npm run test:smoke
```

---

## 🔧 API Usage

All requests must include your generated token.

```bash
curl -H "X-GATEWAY-TOKEN: <your_token>" http://127.0.0.1:3000/health
```

---

### 🤝 Contributing
See [CONTRIBUTING_SECURITY.md](./CONTRIBUTING_SECURITY.md) for strict security guidelines.

---
**Maintained by the Clawd Secure Team.**  
*Because your agent deserves a bodyguard.*
