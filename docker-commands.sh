#!/bin/bash
# Docker Compose Helper Script for MSA Project

PROJECT_DIR="/Users/heril/Downloads/MSA_PROJECT 2/MSA_PROJECT"

cd "$PROJECT_DIR"

case "$1" in
    start)
        echo "🚀 Starting all containers..."
        docker-compose up -d
        ;;
    stop)
        echo "🛑 Stopping all containers..."
        docker-compose down
        ;;
    restart)
        echo "🔄 Restarting all containers..."
        docker-compose restart
        ;;
    rebuild)
        echo "🔨 Rebuilding and starting containers..."
        docker-compose up -d --build
        ;;
    logs)
        if [ -z "$2" ]; then
            echo "📋 Viewing all logs (Ctrl+C to exit)..."
            docker-compose logs -f
        else
            echo "📋 Viewing logs for $2..."
            docker-compose logs -f "$2"
        fi
        ;;
    status)
        echo "📊 Container status:"
        docker-compose ps
        ;;
    clean)
        echo "🧹 Removing all containers, volumes, and networks..."
        docker-compose down -v --remove-orphans
        ;;
    push)
        if [ -z "$2" ]; then
            echo "❌ Error: Docker Hub username is required"
            echo "Usage: $0 push <dockerhub-username> [tag]"
            echo "Example: $0 push myusername latest"
            exit 1
        fi
        echo "🚀 Pushing images to Docker Hub..."
        if [ -f "./push-to-dockerhub.sh" ]; then
            ./push-to-dockerhub.sh "$2" "${3:-latest}"
        else
            echo "❌ push-to-dockerhub.sh script not found"
            exit 1
        fi
        ;;
    *)
        echo "Docker Compose Helper Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|rebuild|logs|status|clean|push}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all containers"
        echo "  stop      - Stop all containers"
        echo "  restart   - Restart all containers"
        echo "  rebuild   - Rebuild and start containers"
        echo "  logs      - View logs (all services or specify service name)"
        echo "  status    - Show container status"
        echo "  clean     - Remove everything including volumes"
        echo "  push      - Push all images to Docker Hub (requires username)"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs user-service"
        echo "  $0 rebuild"
        echo "  $0 push myusername latest"
        ;;
esac



