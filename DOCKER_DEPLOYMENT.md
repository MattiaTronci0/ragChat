# Docker Deployment Guide

This guide covers how to deploy the RAG Chat application using Docker containers on a Linux VPS.

## 🏗️ Architecture Overview

The dockerized application consists of:
- **Frontend**: React app built and served by Nginx
- **Backend**: Node.js Express API server
- **Reverse Proxy**: Nginx handling routing and SSL termination
- **n8n**: Document processing workflow automation (optional)

## 📋 Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: At least 10GB free space
- **Network**: Ports 80, 443, 5678 available

### Required Software
- Docker 20.10+
- Docker Compose 1.29+
- Git
- OpenSSL (for SSL certificates)

### Installation on Ubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install additional tools
sudo apt install -y git openssl curl

# Logout and login again to apply docker group changes
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd ragChat
```

### 2. Configure Environment

```bash
# Copy environment template
cp backend/.env.example .env.prod

# Edit configuration
nano .env.prod
```

Set the following variables:
```bash
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# n8n Configuration
N8N_AUTH_USER=admin
N8N_AUTH_PASSWORD=your-secure-password

# Domain Configuration
DOMAIN=your-domain.com
```

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🔧 Deployment Options

### Development Environment

For development with hot reload:

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop development environment
docker-compose down
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- n8n: http://localhost:5678

### Production Environment

For production deployment:

```bash
# Deploy to production
./deploy.sh deploy

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Stop all services
./deploy.sh stop
```

Access:
- Frontend: http://localhost (or your domain)
- Backend API: http://localhost/api
- n8n: http://localhost:5678

## 📁 Project Structure

```
ragChat/
├── Dockerfile                    # Frontend production build
├── Dockerfile.dev               # Frontend development
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── deploy.sh                    # Deployment script
├── .dockerignore                # Frontend Docker ignore
├── backend/
│   ├── Dockerfile              # Backend production
│   ├── Dockerfile.dev          # Backend development
│   ├── healthcheck.js          # Health check script
│   └── .dockerignore           # Backend Docker ignore
├── nginx/
│   ├── Dockerfile              # Nginx reverse proxy
│   ├── nginx.conf              # Development nginx config
│   └── nginx.prod.conf         # Production nginx config
└── ssl/                        # SSL certificates
    ├── cert.pem
    └── key.pem
```

## 🔒 SSL/TLS Configuration

### Option 1: Self-Signed Certificates (Development)

```bash
# Generate self-signed certificates
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Option 2: Let's Encrypt (Production)

```bash
# Install certbot
sudo apt install -y certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

### Option 3: Custom Certificates

```bash
# Place your certificates in the ssl directory
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

## 🐳 Docker Commands Reference

### Building Images

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build backend

# Build without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Managing Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View service logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Managing Volumes

```bash
# List volumes
docker volume ls

# Backup uploads volume
docker run --rm -v ragchat_uploads-data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore uploads volume
docker run --rm -v ragchat_uploads-data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

## 📊 Monitoring and Health Checks

### Built-in Health Checks

All containers include health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' ragchat-backend | jq
```

### Manual Health Checks

```bash
# Backend health
curl http://localhost/health-backend

# Frontend health
curl http://localhost/health

# n8n health
curl http://localhost:5678
```

### Monitoring Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View logs with timestamps
docker-compose -f docker-compose.prod.yml logs -f -t backend
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
sudo netstat -tlnp | grep :80

# Stop process
sudo kill -9 <PID>
```

#### 2. Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Regenerate self-signed certificate
rm ssl/*.pem
./deploy.sh
```

#### 4. Google Drive API Issues
```bash
# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep GOOGLE

# Test Google Drive connectivity
docker-compose -f docker-compose.prod.yml exec backend node -e "console.log(process.env.GOOGLE_CLIENT_EMAIL)"
```

#### 5. n8n Connection Issues
```bash
# Check n8n logs
docker-compose -f docker-compose.prod.yml logs -f n8n

# Restart n8n service
docker-compose -f docker-compose.prod.yml restart n8n
```

### Debug Commands

```bash
# Enter container shell
docker-compose -f docker-compose.prod.yml exec backend sh

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Check resource usage
docker stats
```

## 🚀 Production Deployment Checklist

### Before Deployment
- [ ] Configure domain DNS records
- [ ] Set up SSL certificates
- [ ] Configure Google Drive API
- [ ] Set secure passwords
- [ ] Configure firewall rules
- [ ] Set up monitoring

### Security Checklist
- [ ] Change default passwords
- [ ] Configure SSL/TLS
- [ ] Set up firewall
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Set up log monitoring
- [ ] Regular security updates

### Performance Optimization
- [ ] Configure resource limits
- [ ] Set up caching
- [ ] Configure CDN (if needed)
- [ ] Set up log rotation
- [ ] Configure monitoring
- [ ] Set up automated backups

## 🔄 Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/ragchat"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup volumes
docker run --rm -v ragchat_uploads-data:/data -v $BACKUP_DIR:/backup alpine \
    tar czf /backup/uploads-$DATE.tar.gz -C /data .

docker run --rm -v ragchat_metadata-data:/data -v $BACKUP_DIR:/backup alpine \
    tar czf /backup/metadata-$DATE.tar.gz -C /data .

# Backup database (if applicable)
# docker-compose -f docker-compose.prod.yml exec -T database \
#     pg_dump -U username dbname > $BACKUP_DIR/database-$DATE.sql

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Process

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore volumes
docker run --rm -v ragchat_uploads-data:/data -v $BACKUP_DIR:/backup alpine \
    tar xzf /backup/uploads-YYYYMMDD_HHMMSS.tar.gz -C /data

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review container logs
3. Verify configuration
4. Check system resources
5. Consult the main README.md

## 🔗 Related Documentation

- [Main README](README.md)
- [Google Drive Setup](GOOGLE_DRIVE_SETUP.md)
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Note**: This deployment guide covers production-ready containerization. For development, use the simpler `docker-compose up` command with the development configuration.