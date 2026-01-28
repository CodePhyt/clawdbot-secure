# 🤝 Contributing to Clawd Secure

Thank you for your interest in contributing to Clawd Secure! This project implements enterprise-grade security for autonomous agents, and maintaining these security guarantees is **critical**.

---

## 🛡️ Security-First Development

Clawd Secure is built on 5 security directives. **All contributions MUST maintain these guarantees.**

### The 5 Directives (Non-Negotiable)

1. **Network Fortress & Auth** - All API requests require authentication
2. **Rootless Docker** - No privileged containers, no root execution
3. **Data Encryption** - All data at rest is encrypted with AES-256-GCM
4. **Sovereign Ollama** - LLM inference isolated on internal network
5. **Sandboxed Execution** - Commands validated, approved, and logged

---

## ⚠️ Critical Rules

### 🚫 **NEVER Do This**

#### 1. **Do NOT Remove Authentication Checks**

```typescript
// ❌ WRONG - Bypasses security
app.get('/api/sensitive-data', (req, res) => {
    // Missing securityMiddleware!
    res.json({ data: sensitiveData });
});

// ✅ CORRECT - Enforces auth
app.get('/api/sensitive-data', securityMiddleware, (req, res) => {
    res.json({ data: sensitiveData });
});
```

#### 2. **Do NOT Use `exec()` or Enable Shell**

```typescript
// ❌ WRONG - Shell injection vulnerability
import { exec } from 'child_process';
exec(`ls ${userInput}`); // NEVER DO THIS

// ✅ CORRECT - Use spawn without shell
import { spawn } from 'child_process';
const proc = spawn('ls', [userInput], { shell: false });
```

#### 3. **Do NOT Store Plaintext Secrets**

```typescript
// ❌ WRONG - Plaintext storage
fs.writeFileSync('secrets.txt', apiKey);

// ✅ CORRECT - Use encrypted storage
import { writeEncrypted } from './core/memory/storage';
await writeEncrypted('secrets.txt', apiKey);
```

#### 4. **Do NOT Skip Path Validation**

```typescript
// ❌ WRONG - Path traversal vulnerability
const filePath = path.join('/app/data', req.body.filename);
fs.readFileSync(filePath);

// ✅ CORRECT - Validate paths
import { getPathValidator } from './core/security/path-validator';
const validator = getPathValidator();
const validation = await validator.validate(req.body.filename, '/app/data');
if (validation.valid) {
    fs.readFileSync(validation.canonicalPath);
}
```

#### 5. **Do NOT Use Localhost for Ollama**

```typescript
// ❌ WRONG - Breaks network isolation
const OLLAMA_URL = 'http://localhost:11434';

// ✅ CORRECT - Use Docker network
const OLLAMA_URL = 'http://ollama:11434';
```

---

## ✅ Best Practices

### 1. **Always Use the Security Middleware**

```typescript
import { securityMiddleware } from './middleware/security';

// Apply to ALL routes
app.use(securityMiddleware);

// Or selectively
app.post('/api/protected', securityMiddleware, handler);
```

### 2. **Always Use the Storage API**

```typescript
import { 
    writeEncryptedJSON, 
    readEncryptedJSON 
} from './core/memory/storage';

// Writing data
const userData = { name: 'Alice', role: 'admin' };
await writeEncryptedJSON('data/users/alice.json', userData);

// Reading data
const user = await readEncryptedJSON<User>('data/users/alice.json');
```

### 3. **Always Use the Command Executor**

```typescript
import { getCommandExecutor } from './core/security/executor';

const executor = getCommandExecutor();

// Execute with security checks
const result = await executor.execute('ls', ['-la'], {
    cwd: '/app/data',
    userId: req.user?.id
});
```

### 4. **Always Log Security Events**

```typescript
import { getAuditLogger } from './core/security/audit-log';

const logger = getAuditLogger();

await logger.log(
    'security_event',
    'User attempted unauthorized access',
    'warning',
    { userId, resource },
    userId,
    req.ip
);
```

---

## 📋 Contribution Workflow

### 1. **Fork and Clone**

```bash
git clone https://github.com/yourusername/clawd-secure.git
cd clawd-secure
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Create Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

### 4. **Make Changes**

- Follow existing code style (TypeScript strict mode)
- Add TypeScript types for all new code
- Document security-critical functions
- Add error handling

### 5. **Test Your Changes**

```bash
# Build
npm run build

# Run smoke tests
npm run test:smoke

# Test manually with Docker
docker-compose -f docker-compose.secure.yml up --build
```

### 6. **Commit with Clear Messages**

```bash
git commit -m "feat: Add new secure feature X"
git commit -m "fix: Patch path validation edge case"
git commit -m "docs: Update API documentation"
```

**Commit Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `security:` - Security patch
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring

### 7. **Submit Pull Request**

- Describe what your PR does
- Reference any related issues
- Confirm you've tested the security features
- Wait for code review

---

## 🧪 Testing Requirements

All contributions must include:

1. **Build Verification**
   ```bash
   npm run build  # Must succeed with 0 errors
   ```

2. **Smoke Tests**
   ```bash
   npm run test:smoke  # Must pass all tests
   ```

3. **Manual Security Testing**
   - Test authentication rejection
   - Test command blocking
   - Test encryption verification

---

## 🔍 Code Review Checklist

Before submitting, verify:

- [ ] No authentication bypasses
- [ ] No `exec()` or shell usage
- [ ] All file operations use encrypted storage
- [ ] All commands use the executor
- [ ] Path validation for file operations
- [ ] Audit logging for security events
- [ ] TypeScript strict mode compliance
- [ ] Build succeeds with no errors
- [ ] Smoke tests pass
- [ ] Documentation updated

---

## 📝 Documentation Standards

### Function Documentation

```typescript
/**
 * Brief description of what the function does
 * 
 * Security Note: Describe any security implications
 * 
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description
 * @throws Error description
 */
export function secureFunction(param1: string, param2: number): Result {
    // Implementation
}
```

### File Headers

```typescript
/**
 * CLAWD SECURE - MODULE NAME
 * Directive X: Brief Description
 * 
 * Purpose of this module
 * Security features implemented
 */
```

---

## 🐛 Reporting Security Vulnerabilities

**DO NOT create public issues for security vulnerabilities.**

Instead:
1. Email: [security@your-domain.com]
2. Use GitHub Security Advisories
3. Provide detailed reproduction steps
4. Allow 90 days for patch before public disclosure

---

## 📚 Resources

- **README.md** - Project overview and setup
- **Architecture Docs** - System design and security model
- **API Documentation** - Endpoint reference
- **Smoke Tests** - `tests/smoke-test.ts` - Security verification

---

## 💡 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community support
- **Pull Requests** - Code contributions

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## 🙏 Thank You!

Security is a team effort. Your contributions help make autonomous agents safer for everyone.

**Remember:** When in doubt about security, ask. It's better to over-communicate than to introduce a vulnerability.

---

**Made with 🛡️ by the Clawd Secure Community**
