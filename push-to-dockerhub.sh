#!/bin/bash

# Script to push all Docker images to Docker Hub
# Usage: ./push-to-dockerhub.sh [dockerhub-username] [tag]
# Example: ./push-to-dockerhub.sh myusername latest
#          ./push-to-dockerhub.sh myusername v1.0

set -e  # Exit on error

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Docker Hub username is required"
    echo ""
    echo "Usage: $0 <dockerhub-username> [tag]"
    echo "Example: $0 myusername latest"
    echo "         $0 myusername v1.0"
    exit 1
fi

DOCKERHUB_USERNAME="$1"
TAG="${2:-latest}"

echo "🐳 Pushing Docker images to Docker Hub..."
echo "   Username: $DOCKERHUB_USERNAME"
echo "   Tag: $TAG"
echo ""

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo "⚠️  Not logged in to Docker Hub"
    echo "   Logging in..."
    docker login
    if [ $? -ne 0 ]; then
        echo "❌ Docker login failed"
        exit 1
    fi
fi

# Define image name prefix (local)
LOCAL_PREFIX="shopsquare"

# Services to push
services=(
    "eureka-server"
    "apigateway"
    "user-service"
    "shop-service"
    "product-service"
    "cart-service"
    "order-service"
    "profile-service"
    "cart-item-service"
    "order-item-service"
    "frontend"
)

# Push each service
for service_name in "${services[@]}"; do
    LOCAL_IMAGE="${LOCAL_PREFIX}/${service_name}:latest"
    DOCKERHUB_IMAGE="${DOCKERHUB_USERNAME}/${service_name}:${TAG}"
    
    # Check if local image exists
    if ! docker image inspect "$LOCAL_IMAGE" &>/dev/null; then
        echo "⚠️  Skipping $service_name - image not found: $LOCAL_IMAGE"
        echo "   Run ./build-docker-images.sh first to build all images"
        continue
    fi
    
    echo "📤 Pushing $service_name..."
    echo "   From: $LOCAL_IMAGE"
    echo "   To:   $DOCKERHUB_IMAGE"
    
    # Tag the image for Docker Hub
    docker tag "$LOCAL_IMAGE" "$DOCKERHUB_IMAGE"
    
    # Push to Docker Hub
    docker push "$DOCKERHUB_IMAGE"
    
    if [ $? -eq 0 ]; then
        echo "   ✓ $service_name pushed successfully!"
    else
        echo "   ❌ Failed to push $service_name"
    fi
    echo ""
done

echo ""
echo "✅ Push process completed!"
echo ""
echo "📋 Your images are now available at:"
echo "   https://hub.docker.com/r/$DOCKERHUB_USERNAME/"
echo ""
echo "💡 To pull images:"
echo "   docker pull ${DOCKERHUB_USERNAME}/<service-name>:${TAG}"

