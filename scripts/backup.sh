#!/bin/bash

# RagChat Backup Script
# Backs up AnythingLLM data and application configuration

set -e

# Configuration
PROJECT_NAME="ragchat"
BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ragchat_backup_$DATE"
KEEP_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK")
            echo -e "${GREEN}[OK]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        *)
            echo -e "[INFO] $message"
            ;;
    esac
}

create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$backup_path"
    echo "$backup_path"
}

backup_anythingllm_data() {
    local backup_path=$1
    
    print_status "INFO" "Backing up AnythingLLM data..."
    
    # Check if AnythingLLM volume exists
    if docker volume inspect "${PROJECT_NAME}_anythingllm-storage" &> /dev/null; then
        # Create backup of AnythingLLM data
        docker run --rm \
            -v "${PROJECT_NAME}_anythingllm-storage":/source:ro \
            -v "$backup_path":/backup \
            alpine \
            tar czf /backup/anythingllm_data.tar.gz -C /source .
        
        print_status "OK" "AnythingLLM data backed up"
    else
        print_status "WARN" "AnythingLLM volume not found"
    fi
}

backup_configuration() {
    local backup_path=$1
    
    print_status "INFO" "Backing up configuration files..."
    
    # Backup configuration files
    cp -r "$(dirname "$(realpath "$0")")/.." "$backup_path/app_config"
    
    # Remove sensitive files and directories
    rm -rf "$backup_path/app_config/node_modules" 2>/dev/null || true
    rm -rf "$backup_path/app_config/*/node_modules" 2>/dev/null || true
    rm -rf "$backup_path/app_config/.git" 2>/dev/null || true
    rm -f "$backup_path/app_config/.env" 2>/dev/null || true
    
    print_status "OK" "Configuration files backed up"
}

backup_database() {
    local backup_path=$1
    
    print_status "INFO" "Backing up database..."
    
    # AnythingLLM uses SQLite, which is included in the data backup
    # If using external database, add backup commands here
    
    print_status "OK" "Database backup completed"
}

create_backup_manifest() {
    local backup_path=$1
    
    cat > "$backup_path/backup_manifest.json" << EOF
{
    "backup_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "backup_name": "$BACKUP_NAME",
    "project_name": "$PROJECT_NAME",
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "components": [
        "anythingllm_data",
        "configuration",
        "database"
    ],
    "docker_images": [
        "$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep anythingllm || echo "N/A")",
        "$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep nginx || echo "N/A")"
    ]
}
EOF
    
    print_status "OK" "Backup manifest created"
}

compress_backup() {
    local backup_path=$1
    
    print_status "INFO" "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    local size=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    print_status "OK" "Backup compressed: ${size}"
}

cleanup_old_backups() {
    print_status "INFO" "Cleaning up old backups..."
    
    find "$BACKUP_DIR" -name "ragchat_backup_*.tar.gz" -mtime +$KEEP_DAYS -delete
    
    local remaining=$(find "$BACKUP_DIR" -name "ragchat_backup_*.tar.gz" | wc -l)
    print_status "OK" "Cleanup completed. $remaining backups remaining"
}

verify_backup() {
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    print_status "INFO" "Verifying backup integrity..."
    
    if tar tzf "$backup_file" > /dev/null 2>&1; then
        print_status "OK" "Backup integrity verified"
    else
        print_status "ERROR" "Backup integrity check failed"
        exit 1
    fi
}

send_notification() {
    local status=$1
    local message=$2
    
    # Add notification logic here (email, Slack, etc.)
    # For now, just log to syslog
    logger -t "ragchat-backup" "$status: $message"
}

# Main execution
echo "RagChat Backup Script - $(date)"
echo "========================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_status "ERROR" "Docker is not installed"
    exit 1
fi

# Create backup directory
backup_path=$(create_backup_dir)
print_status "INFO" "Backup location: $backup_path"

# Perform backup
backup_anythingllm_data "$backup_path"
backup_configuration "$backup_path"
backup_database "$backup_path"
create_backup_manifest "$backup_path"

# Compress and cleanup
compress_backup "$backup_path"
verify_backup
cleanup_old_backups

# Final status
final_backup="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
backup_size=$(du -h "$final_backup" | cut -f1)

print_status "OK" "Backup completed successfully"
print_status "INFO" "Backup file: $final_backup"
print_status "INFO" "Backup size: $backup_size"

send_notification "SUCCESS" "Backup completed: $final_backup ($backup_size)"

echo "========================================"
echo "Backup complete!"