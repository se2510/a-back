#!/bin/bash
# Script para construir la imagen y subirla a un registro Docker

# Variables
IMAGE_NAME="backend"
TAG="latest"
REGISTRY="isvgxd"

# Construir la imagen
npm run build || { echo "Fallo el build de npm"; exit 1; }
docker build -t $IMAGE_NAME:$TAG . || { echo "Fallo el build de Docker"; exit 1; }

echo "Imagen construida: $IMAGE_NAME:$TAG"

docker tag $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG

echo "Subiendo imagen a $REGISTRY..."
docker push $REGISTRY/$IMAGE_NAME:$TAG

echo "Imagen subida correctamente."
