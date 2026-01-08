#!/bin/bash

# Docker management script for Todo App

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="todo-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

show_usage() {
    cat << EOF
Todo App Docker Management

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    up              Start all services in the background
    up-dev          Start all services in development mode (foreground)
    down            Stop and remove all services
    logs            View logs from all services
    logs-backend    View backend logs
    logs-frontend   View frontend logs
    logs-postgres   View database logs
    build           Build all services
    rebuild         Rebuild all services (ignore cache)
    clean           Stop and remove all containers and volumes
    shell-backend   Open shell in backend container
    shell-frontend  Open shell in frontend container
    shell-db        Open psql shell in database
    status          Show status of all services
    help            Show this help message

Examples:
    $0 up                   # Start all services
    $0 logs-backend         # View backend logs
    $0 shell-backend        # Access backend container shell
    $0 down                 # Stop all services

EOF
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
}

# Use docker compose command
docker_compose() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Main commands
cmd_up() {
    print_info "Starting services..."
    docker_compose -f docker-compose.yml up -d
    print_success "Services started. Frontend: http://localhost:3000, Backend: http://localhost:8000"
}

cmd_up_dev() {
    print_info "Starting services in development mode..."
    docker_compose -f docker-compose.dev.yml up
}

cmd_down() {
    print_info "Stopping services..."
    docker_compose down
    print_success "Services stopped"
}

cmd_logs() {
    docker_compose logs -f
}

cmd_logs_backend() {
    docker_compose logs -f backend
}

cmd_logs_frontend() {
    docker_compose logs -f frontend
}

cmd_logs_postgres() {
    docker_compose logs -f postgres
}

cmd_build() {
    print_info "Building services..."
    docker_compose build
    print_success "Services built"
}

cmd_rebuild() {
    print_info "Rebuilding services (no cache)..."
    docker_compose build --no-cache
    print_success "Services rebuilt"
}

cmd_clean() {
    print_error "This will stop and remove all containers and volumes!"
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    if [ "$confirm" = "yes" ]; then
        docker_compose down -v
        print_success "All containers and volumes removed"
    else
        print_info "Cancelled"
    fi
}

cmd_shell_backend() {
    docker_compose exec backend /bin/bash
}

cmd_shell_frontend() {
    docker_compose exec frontend /bin/sh
}

cmd_shell_db() {
    docker_compose exec postgres psql -U postgres -d todo_dev
}

cmd_status() {
    print_info "Service Status:"
    docker_compose ps
}

# Main script
check_docker

case "${1:-help}" in
    up)
        cmd_up
        ;;
    up-dev)
        cmd_up_dev
        ;;
    down)
        cmd_down
        ;;
    logs)
        cmd_logs
        ;;
    logs-backend)
        cmd_logs_backend
        ;;
    logs-frontend)
        cmd_logs_frontend
        ;;
    logs-postgres)
        cmd_logs_postgres
        ;;
    build)
        cmd_build
        ;;
    rebuild)
        cmd_rebuild
        ;;
    clean)
        cmd_clean
        ;;
    shell-backend)
        cmd_shell_backend
        ;;
    shell-frontend)
        cmd_shell_frontend
        ;;
    shell-db)
        cmd_shell_db
        ;;
    status)
        cmd_status
        ;;
    help)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
