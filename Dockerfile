# Dockerfile para Backend Anima Studio
FROM node:20-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# Construir el proyecto
RUN npm run build

# Exponer el puerto definido en .env
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/index.js"]

