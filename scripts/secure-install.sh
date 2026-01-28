#!/bin/bash

# ============================================
# CLAWD SECURE - ONE-CLICK SECURE INSTALLER
# ============================================
# Automates the setup process with secure token generation
# and environment configuration.

set -e  # Exit on error

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# BANNER
# ============================================

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}║       🛡️  CLAWD SECURE INSTALLER  🛡️        ║${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}║   Enterprise-Grade Autonomous Agent Setup    ║${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# PREREQUISITE CHECKS
# ============================================

echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found!${NC}"
    echo "  Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found!${NC}"
    echo "  Please install Docker Compose"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check for OpenSSL
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}✗ OpenSSL not found!${NC}"
    echo "  Please install OpenSSL for cryptographic key generation"
    exit 1
fi
echo -e "${GREEN}✓ OpenSSL found: $(openssl version)${NC}"

# Check for Node.js (optional, for local development)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
else
    echo -e "${YELLOW}⚠ Node.js not found (optional for local development)${NC}"
fi

echo ""

# ============================================
# SECURITY KEY GENERATION
# ============================================

echo -e "${YELLOW}[2/6] Generating cryptographic keys...${NC}"

# Generate gateway token (64 characters)
GATEWAY_TOKEN=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Gateway token generated (64 chars)${NC}"

# Generate encryption key (base64, 44 characters)
SECRET_KEY=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Encryption key generated (AES-256)${NC}"

echo ""

# ============================================
# ENVIRONMENT FILE CREATION
# ============================================

echo -e "${YELLOW}[3/6] Creating .env file...${NC}"

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "  Overwrite existing .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}✗ Installation cancelled${NC}"
        exit 1
    fi
    # Backup existing .env
    cp .env .env.backup
    echo -e "${GREEN}✓ Backed up existing .env to .env.backup${NC}"
fi

# Create .env from template
if [ ! -f ".env.example" ]; then
    echo -e "${RED}✗ .env.example not found!${NC}"
    exit 1
fi

cp .env.example .env
echo -e "${GREEN}✓ Created .env from template${NC}"

# Inject generated tokens
sed -i.bak "s|X_GATEWAY_TOKEN=.*|X_GATEWAY_TOKEN=${GATEWAY_TOKEN}|g" .env
sed -i.bak "s|CLAWD_SECRET_KEY=.*|CLAWD_SECRET_KEY=${SECRET_KEY}|g" .env
rm .env.bak 2>/dev/null || true

echo -e "${GREEN}✓ Injected security tokens into .env${NC}"

echo ""

# ============================================
# DISPLAY GENERATED CREDENTIALS
# ============================================

echo -e "${YELLOW}[4/6] Security credentials generated${NC}"
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ⚠️  SAVE THESE CREDENTIALS SECURELY ⚠️     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Gateway Token (X_GATEWAY_TOKEN):${NC}"
echo -e "${GREEN}${GATEWAY_TOKEN}${NC}"
echo ""
echo -e "${GREEN}Encryption Key (CLAWD_SECRET_KEY):${NC}"
echo -e "${GREEN}${SECRET_KEY}${NC}"
echo ""
echo -e "${RED}⚠️  CRITICAL SECURITY WARNING:${NC}"
echo -e "${RED}   - Store these credentials in a secure password manager${NC}"
echo -e "${RED}   - NEVER commit the .env file to version control${NC}"
echo -e "${RED}   - These credentials cannot be recovered if lost${NC}"
echo ""

# Save credentials to a temporary file (optional)
read -p "Save credentials to credentials.txt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > credentials.txt << EOF
CLAWD SECURE - Generated Credentials
Generated: $(date)

Gateway Token (X_GATEWAY_TOKEN):
${GATEWAY_TOKEN}

Encryption Key (CLAWD_SECRET_KEY):
${SECRET_KEY}

⚠️ DELETE THIS FILE AFTER SAVING TO PASSWORD MANAGER
EOF
    chmod 600 credentials.txt
    echo -e "${GREEN}✓ Credentials saved to credentials.txt (delete after saving)${NC}"
fi

echo ""

# ============================================
# BUILD VERIFICATION
# ============================================

echo -e "${YELLOW}[5/6] Verifying project structure...${NC}"

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "docker-compose.secure.yml"
    "Dockerfile"
    "src/index.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Missing critical file: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ All critical files present${NC}"

# Create data directories
mkdir -p data/audit-logs
mkdir -p tmp
echo -e "${GREEN}✓ Created data directories${NC}"

echo ""

# ============================================
# START SERVICES
# ============================================

echo -e "${YELLOW}[6/6] Docker deployment${NC}"
echo ""
read -p "Do you want to start the secure agent now? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Building Docker images...${NC}"
    docker-compose -f docker-compose.secure.yml build
    
    echo ""
    echo -e "${BLUE}Starting services...${NC}"
    docker-compose -f docker-compose.secure.yml up -d
    
    echo ""
    echo -e "${GREEN}✓ Services started successfully!${NC}"
    echo ""
    echo -e "${BLUE}View logs:${NC}"
    echo "  docker-compose -f docker-compose.secure.yml logs -f"
    echo ""
    echo -e "${BLUE}Stop services:${NC}"
    echo "  docker-compose -f docker-compose.secure.yml down"
    echo ""
    
    # Test connection
    echo -e "${YELLOW}Testing connection in 5 seconds...${NC}"
    sleep 5
    
    if curl -s -H "X-GATEWAY-TOKEN: ${GATEWAY_TOKEN}" http://127.0.0.1:3000/health > /dev/null; then
        echo -e "${GREEN}✓ Agent is responding correctly!${NC}"
    else
        echo -e "${YELLOW}⚠ Agent not responding yet (may need more time to start)${NC}"
    fi
else
    echo ""
    echo -e "${BLUE}To start services later, run:${NC}"
    echo "  docker-compose -f docker-compose.secure.yml up -d"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║          ✓ INSTALLATION COMPLETE ✓           ║${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Save your credentials securely"
echo "  2. Run smoke tests: npm run test:smoke"
echo "  3. Read CONTRIBUTING.md if you plan to modify the code"
echo "  4. Check README.md for API documentation"
echo ""
echo -e "${YELLOW}⚠️  Remember: Delete credentials.txt after saving to password manager${NC}"
echo ""
