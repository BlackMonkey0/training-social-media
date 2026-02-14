# SportCommunity 🏃‍♂️🚴‍♀️

Una plataforma comunitaria completa para deportistas donde pueden compartir rutas, registrar actividades, gestionar nutrición y crear una comunidad sana y conectada.

## Características Principales

### 🔐 Autenticación y Seguridad
- Registro y login con username y contraseña
- JWT (JSON Web Tokens) para sesiones seguras
- Contraseñas hasheadas con bcrypt

### 🏃 Actividades y Tracking
- Registro de actividades (correr, ciclismo, etc.)
- Integración con dispositivos (Fitbit, Garmin, Apple Watch)
- Cálculo automático de calorías quemadas
- Tracking de pasos, distancia, tiempo y frecuencia cardíaca

### 🗺️ Gestión de Rutas
- Crear nuevas rutas
- Editar rutas en tiempo real
- Ver rutas disponibles filtradas por tipo y dificultad
- Unirse a rutas de la comunidad

### 🍽️ Nutrición Automática
- Registrar alimentos consumidos antes/durante/después de actividades
- Base de datos de alimentos con información nutricional
- **Cálculo automático** de:
  - Calorías totales
  - Proteínas
  - Carbohidratos
  - Grasas
  - Fibra
- Estadísticas de nutrición por período

### 📸 Fotos y Reseñas
- Compartir fotos de lugares y rutas
- Escribir reseñas de ubicaciones
- Calificación de rutas (1-5 estrellas)
- Comentarios de la comunidad

### 👥 Comunidad
- Seguir a otros deportistas
- Ver actividades de la comunidad
- Logros y badges
- Perfil público personalizable

## Requisitos

- Node.js (v18+)
- PostgreSQL (v12+)
- npm o yarn

## Instalación

### 1. Backend

```bash
cd backend
npm install
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb sportcommunity_db

# Ejecutar script de inicialización
psql -d sportcommunity_db -f src/config/database-init.sql
```

### 3. Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sportcommunity_db
JWT_SECRET=tu-secreto-super-largo-y-aleatorio-aqui
```

### 4. Iniciar Backend

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de BD y scripts
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Middleware (autenticación, etc)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de API
│   └── utils/           # Funciones auxiliares
├── server.js            # Entrada principal
└── package.json

frontend/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios (API, store)
│   └── App.jsx
└── package.json
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Rutas
- `GET /api/routes` - Listar rutas
- `POST /api/routes` - Crear ruta
- `GET /api/routes/:routeId` - Obtener ruta
- `PUT /api/routes/:routeId` - Actualizar ruta
- `POST /api/routes/:routeId/join` - Unirse a ruta

### Actividades
- `GET /api/activities` - Listar actividades
- `POST /api/activities` - Registrar actividad
- `GET /api/activities/stats` - Estadísticas
- `POST /api/activities/device/sync` - Sincronizar dispositivo

### Nutrición
- `GET /api/nutrition` - Listar registros
- `POST /api/nutrition` - Registrar alimentos
- `GET /api/nutrition/stats` - Estadísticas nutricionales
- `POST /api/nutrition/food/custom` - Añadir alimento personalizado

### Reseñas
- `GET /api/reviews/route/:routeId` - Obtener reseñas
- `POST /api/reviews` - Crear reseña
- `PUT /api/reviews/:reviewId` - Actualizar reseña
- `DELETE /api/reviews/:reviewId` - Eliminar reseña

## Características de Nutrición

El sistema calcula automáticamente la información nutricional basado en una base de datos de alimentos comunes:

```javascript
{
  name: "manzana",
  calories: 52,
  protein: 0.26,
  carbs: 13.8,
  fats: 0.17,
  fiber: 2.4
}
```

Se pueden añadir alimentos personalizados con valores específicos.

## Integración con Dispositivos

El sistema soporta sincronización con:
- Fitbit
- Garmin
- Apple Watch
- Dispositivos Wear OS

Los datos sincronizados incluyen:
- Pasos
- Frecuencia cardíaca
- Distancia recorrida
- Calorías quemadas
- Tiempo de actividad

## Próximas Características

- [ ] Mapas interactivos en tiempo real
- [ ] Chat comunitario
- [ ] Eventos y desafíos grupales
- [ ] Aplicación móvil
- [ ] Análisis de rendimiento avanzado
- [ ] Integración con redes sociales
- [ ] Sistema de premios y recompensas

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar features, abrir un issue en el repositorio.

---

**SportCommunity** - Juntos, llegamos más lejos 🏆
