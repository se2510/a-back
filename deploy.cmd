@echo off
REM Script para construir la imagen y subirla a Docker Hub en Windows

SET IMAGE_NAME=backend
SET TAG=latest
SET REGISTRY=isvgxd/backend

REM Construir el proyecto
call npm run build || exit /b 1

REM Construir la imagen Docker
call docker build -t %IMAGE_NAME%:%TAG% . || exit /b 1

echo Imagen construida: %IMAGE_NAME%:%TAG%

REM Etiquetar la imagen para Docker Hub
call docker tag %IMAGE_NAME%:%TAG% %REGISTRY%:%TAG%

echo Subiendo imagen a %REGISTRY%...
call docker push %REGISTRY%:%TAG%

echo Imagen subida correctamente.

