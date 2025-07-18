#!/bin/bash

# RagChat System Monitor
# Monitors Docker containers, system resources, and application health

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ragchat"
SERVICES=("frontend" "api-proxy" "anythingllm" "nginx")
HEALTH_ENDPOINTS=(
    "http://localhost/health"
    "http://localhost:3002/health"
    "http://localhost:3001/api/system/ping"
)

# Functions
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

check_docker() {
    echo "=== Docker Status ==="
    
    if ! command -v docker &> /dev/null; then
        print_status "ERROR" "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status "ERROR" "Docker daemon is not running"
        exit 1
    fi
    
    print_status "OK" "Docker is running"
}

check_containers() {
    echo "=== Container Status ==="
    
    local all_running=true
    
    for service in "${SERVICES[@]}"; do
        local container_name="${PROJECT_NAME}-${service}"
        
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            local status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{print $2}')
            print_status "OK" "$service: $status"
        else
            print_status "ERROR" "$service: Not running"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        print_status "WARN" "Some containers are not running. Try: docker-compose up -d"
    fi
}

check_health_endpoints() {
    echo "=== Health Endpoints ==="
    
    for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
        if curl -s --max-time 5 "$endpoint" > /dev/null 2>&1; then
            print_status "OK" "$endpoint is responding"
        else
            print_status "ERROR" "$endpoint is not responding"
        fi
    done
}

check_system_resources() {
    echo "=== System Resources ==="
    
    # Memory usage
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 80" | bc -l) )); then
        print_status "WARN" "Memory usage: ${mem_usage}%"
    else
        print_status "OK" "Memory usage: ${mem_usage}%"
    fi
    
    # Disk usage
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        print_status "WARN" "Disk usage: ${disk_usage}%"
    else
        print_status "OK" "Disk usage: ${disk_usage}%"
    fi
    
    # Load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    print_status "OK" "Load average: $load_avg"
}

check_logs() {
    echo "=== Recent Errors in Logs ==="
    
    for service in "${SERVICES[@]}"; do
        local container_name="${PROJECT_NAME}-${service}"
        local errors=$(docker logs --since="5m" "$container_name" 2>&1 | grep -i "error" | wc -l)
        
        if [ "$errors" -gt 0 ]; then
            print_status "WARN" "$service: $errors errors in last 5 minutes"
            # Show last 3 errors
            docker logs --since="5m" "$container_name" 2>&1 | grep -i "error" | tail -3
        else
            print_status "OK" "$service: No recent errors"
        fi
    done
}

check_volumes() {
    echo "=== Volume Usage ==="
    
    local volumes=$(docker volume ls --format "table {{.Name}}" | grep "$PROJECT_NAME" | grep -v "NAME")
    
    if [ -z "$volumes" ]; then
        print_status "WARN" "No project volumes found"
        return
    fi
    
    while IFS= read -r volume; do
        local size=$(docker run --rm -v "$volume":/volume alpine du -sh /volume 2>/dev/null | awk '{print $1}')
        print_status "OK" "$volume: $size"
    done <<< "$volumes"
}

show_stats() {
    echo "=== Container Stats ==="
    
    if docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -q "$PROJECT_NAME"; then
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(CONTAINER|$PROJECT_NAME)"
    else
        print_status "WARN" "No running containers found"
    fi
}

# Main execution
echo "RagChat System Monitor - $(date)"
echo "========================================"

check_docker
check_containers
check_health_endpoints
check_system_resources
check_logs
check_volumes
show_stats

echo "========================================"
echo "Monitoring complete!"

# Return non-zero if any critical issues found
if docker ps --format "table {{.Names}}" | grep -q "$PROJECT_NAME"; then
    exit 0
else
    exit 1
fi