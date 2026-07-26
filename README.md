# Backend Anima Studio

Backend API para la plataforma Anima Studio, construido con Node.js, Express, TypeScript y TypeORM.

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MySQL (o compatible como MariaDB)

## Configuración

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd backend-anima-studio
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   - Copiar el archivo `.env.example` a `.env`
   - Configurar las variables según tu entorno
   ```bash
   cp .env.example .env
   ```

4. **Configurar la base de datos**
   - Asegúrate de que MySQL esté en ejecución
   - Crea una base de datos con el nombre especificado en `DB_NAME` (por defecto: `ai_platform`)

## Ejecutar la aplicación

### Desarrollo

```bash
# Iniciar en modo desarrollo (con hot-reload)
npm run dev
# o
yarn dev
```

### Producción

```bash
# Compilar TypeScript a JavaScript
npm run build
# o
yarn build

# Iniciar la aplicación
npm start
# o
yarn start
```

## Estructura del Proyecto

```
src/
├── config/         # Configuraciones (base de datos, variables de entorno)
├── controllers/    # Controladores de la API
├── dtos/           # Data Transfer Objects
├── entities/       # Entidades de TypeORM
├── middlewares/    # Middlewares de Express
├── repositories/   # Repositorios para acceso a datos
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
└── utils/          # Utilidades y helpers
```

## Endpoints

### Autenticación

#### Registrar un nuevo usuario

```http
POST /api/v1/auth/register
```

**Cuerpo de la solicitud (JSON):**

```json
{
  "username": "nuevousuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseñaSegura123",
  "role": "creator"
}
```

**Respuesta exitosa (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "nuevousuario",
    "email": "usuario@ejemplo.com",
    "role": "creator"
  }
}
```

**Errores comunes:**

- 400: Validación fallida (campos faltantes o inválidos)
- 400: El correo electrónico ya está en uso
- 500: Error interno del servidor

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.
