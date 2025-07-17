#!/bin/bash

# RAG Chat - Production Deployment Script
# This script deploys the RAG Chat application to a Linux VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BACKUP_DIR="/backup/ragchat"
APP_NAME="ragchat"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env.prod file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env.prod file not found. Creating template..."
        create_env_template
    fi
    
    log_success "Prerequisites check passed"
}

create_env_template() {
    cat > "$ENV_FILE" << EOL
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# n8n Configuration
N8N_AUTH_USER=admin
N8N_AUTH_PASSWORD=your-secure-password

# SSL Configuration (optional)
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# Domain Configuration
DOMAIN=your-domain.com
EOL
    
    log_warning "Please edit $ENV_FILE with your actual configuration values"
    log_warning "Press Enter to continue after editing the file..."
    read
}

backup_existing() {
    log_info "Creating backup of existing deployment..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup volumes
    if docker volume ls | grep -q "${APP_NAME}_uploads-data"; then
        log_info "Backing up uploads data..."
        docker run --rm -v "${APP_NAME}_uploads-data:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/uploads-$(date +%Y%m%d_%H%M%S).tar.gz" -C /data .
    fi
    
    if docker volume ls | grep -q "${APP_NAME}_metadata-data"; then
        log_info "Backing up metadata..."
        docker run --rm -v "${APP_NAME}_metadata-data:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/metadata-$(date +%Y%m%d_%H%M%S).tar.gz" -C /data .
    fi
    
    log_success "Backup completed"
}

stop_existing() {
    log_info "Stopping existing containers..."
    
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    log_success "Existing containers stopped"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build all images
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    log_success "Images built successfully"
}

deploy_services() {
    log_info "Deploying services..."
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services deployed"
}

health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost/health-backend > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    # Create SSL directory
    mkdir -p ssl
    
    # Check if SSL certificates exist
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_warning "SSL certificates not found. Generating self-signed certificates..."
        
        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log_warning "Self-signed certificates generated. Replace with real certificates for production."
    fi
    
    log_success "SSL setup completed"
}

cleanup() {
    log_info "Cleaning up unused resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

show_status() {
    echo
    log_info "Deployment Status:"
    echo "===================="
    
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo
    log_info "Access URLs:"
    echo "  - Frontend: http://localhost"
    echo "  - Backend API: http://localhost/api"
    echo "  - n8n: http://localhost:5678"
    echo "  - Backend Health: http://localhost/health-backend"
    echo
    
    log_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
    log_info "To stop: docker-compose -f $COMPOSE_FILE down"
}

# Main deployment process
main() {
    log_info "Starting RAG Chat deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Backup existing data
    backup_existing
    
    # Stop existing services
    stop_existing
    
    # Setup SSL
    setup_ssl
    
    # Build new images
    build_images
    
    # Deploy services
    deploy_services
    
    # Run health checks
    if health_check; then
        log_success "Deployment completed successfully!"
    else
        log_error "Deployment completed but health checks failed"
        log_warning "Check logs with: docker-compose -f $COMPOSE_FILE logs"
    fi
    
    # Cleanup
    cleanup
    
    # Show status
    show_status
}

# Script usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  deploy      Full deployment (default)"
    echo "  backup      Backup existing data only"
    echo "  stop        Stop all services"
    echo "  logs        Show service logs"
    echo "  status      Show deployment status"
    echo "  cleanup     Clean up unused resources"
    echo "  help        Show this help message"
    echo
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    backup)
        backup_existing
        ;;
    stop)
        stop_existing
        ;;
    logs)
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    help)
        usage
        ;;
    *)
        log_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac