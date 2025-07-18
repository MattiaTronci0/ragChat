# EC2 Deployment Guide - AnythingLLM + React Frontend

This guide will help you deploy the migrated application (React frontend + AnythingLLM backend) on an Amazon EC2 instance.

## Prerequisites

- AWS EC2 instance (t3.medium or larger recommended)
- Ubuntu 22.04 LTS or similar
- Domain name (optional, for SSL)
- SSH access to your EC2 instance

## Step 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance
```bash
# Recommended specs:
# - Instance type: t3.medium (2 vCPU, 4GB RAM) minimum
# - Storage: 20GB+ SSD
# - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### 1.2 Connect to EC2 Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.3 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Docker and Docker Compose

### 2.1 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Log out and back in to apply group changes
exit
# SSH back in
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2.2 Install Docker Compose
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Step 3: Deploy Application

### 3.1 Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/ragChat.git
cd ragChat
```

### 3.2 Configure Environment Variables
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

Update the `.env` file:
```env
# AnythingLLM Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure
VITE_ANYTHINGLLM_API_KEY=will-be-generated-after-first-setup
VITE_ANYTHINGLLM_WORKSPACE=default-workspace

# Optional: Configure LLM Provider
LLM_PROVIDER=ollama
EMBEDDING_ENGINE=ollama
VECTOR_DB=lancedb

# Production Configuration
NODE_ENV=production
```

### 3.3 Update nginx Configuration for Production
```bash
nano nginx.conf
```

Update the server_name in `nginx.conf`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP
    
    # ... rest of configuration stays the same
}
```

### 3.4 Create Production Docker Compose Override
```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - VITE_API_URL=/api
      - VITE_ANYTHINGLLM_API_KEY=${VITE_ANYTHINGLLM_API_KEY}
      - VITE_ANYTHINGLLM_WORKSPACE=${VITE_ANYTHINGLLM_WORKSPACE}
    restart: unless-stopped

  anythingllm:
    restart: unless-stopped
    
  nginx:
    restart: unless-stopped
```

### 3.5 Create Production Dockerfile
```bash
nano Dockerfile
```

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Step 4: Deploy Services

### 4.1 Start Services
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check if services are running
docker-compose ps
```

### 4.2 Monitor Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f anythingllm
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## Step 5: Configure AnythingLLM

### 5.1 Access AnythingLLM Setup
```bash
# Get your EC2 public IP
curl http://checkip.amazonaws.com

# Open browser and go to: http://your-ec2-ip
```

### 5.2 Initial AnythingLLM Setup
1. **First-time setup**: AnythingLLM will show setup wizard
2. **Create admin account**: Set username and password
3. **Configure LLM Provider**: 
   - For testing: Use OpenAI (add API key)
   - For production: Use Ollama (local) or other providers
4. **Create workspace**: Name it "default-workspace"

### 5.3 Generate API Key
1. Go to Settings → API Keys
2. Create new API key
3. Copy the generated key

### 5.4 Update Environment with API Key
```bash
# Stop services
docker-compose down

# Update .env file
nano .env
```

Update the API key:
```env
VITE_ANYTHINGLLM_API_KEY=your-actual-api-key-here
```

```bash
# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Step 6: Configure Security Group

### 6.1 EC2 Security Group Rules
```bash
# Allow HTTP traffic
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0

# Allow HTTPS traffic (for SSL later)
Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0

# Allow SSH (restrict to your IP)
Type: SSH
Protocol: TCP
Port: 22
Source: Your-IP/32
```

## Step 7: Test Deployment

### 7.1 Test Frontend
```bash
# Should show your React app
curl http://your-ec2-ip
```

### 7.2 Test API
```bash
# Should return AnythingLLM system info
curl http://your-ec2-ip/api/system/ping
```

### 7.3 Test Document Upload
1. Open browser: `http://your-ec2-ip`
2. Navigate to Documents page
3. Upload a test document
4. Check if it processes successfully

### 7.4 Test Chat Functionality
1. Navigate to Chat page
2. Send a message
3. Verify AI response from AnythingLLM

## Step 8: SSL Setup (Optional but Recommended)

### 8.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Get SSL Certificate
```bash
# Stop nginx temporarily
docker-compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration for SSL
nano nginx.conf
```

Uncomment and update the HTTPS server block in `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of SSL configuration
}
```

### 8.3 Update Docker Compose for SSL
```bash
nano docker-compose.prod.yml
```

Add SSL volume mount:
```yaml
services:
  nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 8.4 Restart with SSL
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Step 9: Backup and Monitoring

### 9.1 Create Backup Script
```bash
nano backup.sh
```

```bash
#!/bin/bash
# Backup AnythingLLM data
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup AnythingLLM data
docker run --rm -v ragchat_anythingllm-storage:/volume -v $BACKUP_DIR:/backup ubuntu tar czf /backup/anythingllm_backup_$DATE.tar.gz -C /volume .

# Keep only last 7 backups
find $BACKUP_DIR -name "anythingllm_backup_*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x backup.sh

# Setup daily backup cron
crontab -e
# Add: 0 2 * * * /home/ubuntu/ragChat/backup.sh
```

### 9.2 Monitor Resources
```bash
# Check resource usage
docker stats

# Check disk usage
df -h

# Check service status
docker-compose ps
```

## Step 10: Troubleshooting

### 10.1 Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose logs -f

# Check port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

**API key not working:**
```bash
# Verify API key in AnythingLLM settings
# Check environment variables
docker-compose exec frontend env | grep VITE_ANYTHINGLLM_API_KEY
```

**Document upload failures:**
```bash
# Check AnythingLLM logs
docker-compose logs -f anythingllm

# Check nginx logs
docker-compose logs -f nginx
```

### 10.2 Useful Commands
```bash
# Restart all services
docker-compose restart

# Update application
git pull
docker-compose build
docker-compose up -d

# Check service health
curl http://localhost/health
```

## Step 11: Production Optimizations

### 11.1 Performance Tuning
```bash
# Increase nginx worker processes
nano nginx.conf

# Add at the top:
worker_processes auto;
worker_connections 1024;
```

### 11.2 Log Rotation
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/docker-compose

# Add:
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

### 11.3 Auto-restart on Boot
```bash
# Add to crontab
crontab -e

# Add:
@reboot cd /home/ubuntu/ragChat && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Success! 🎉

Your application should now be running on:
- **Frontend**: `http://your-ec2-ip` (or `https://your-domain.com` with SSL)
- **AnythingLLM**: Available via API at `/api/*`
- **Document Management**: Full upload/chat functionality
- **Production Ready**: Auto-restart, backups, monitoring

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review docker-compose logs
3. Ensure all environment variables are set correctly
4. Verify EC2 security group settings
5. Check AnythingLLM documentation for specific configuration options