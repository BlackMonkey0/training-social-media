# Guía de Inicio Rápido

## 1. Configuración Inicial

### Backend
```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
# DB_HOST=localhost
# DB_NAME=sportcommunity_db
# etc...

# Crear base de datos
createdb sportcommunity_db

# Ejecutar script SQL
psql -d sportcommunity_db -f src/config/database-init.sql

# Iniciar servidor
npm run dev
```

### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

## 2. Primeros Pasos

1. **Registrarse**: Acceder a `http://localhost:5173/register`
2. **Iniciar sesión**: Con tus credenciales
3. **Crear una ruta**: Ir a "Crear Ruta" y rellenar los datos
4. **Registrar actividad**: Log de tu entrenamiento
5. **Añadir alimentos**: Registra lo que comiste

## 3. Pruebas de API

Usar Postman o curl para probar:

```bash
# Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "deportista123",
    "email": "user@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "sportPreference": "running"
  }'

# Iniciar sesión
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "deportista123",
    "password": "password123"
  }'
```

## 4. Troubleshooting

**Error de conexión a BD**:
- Verificar que PostgreSQL está corriendo
- Revisar credenciales en `.env`

**Token expirado**:
- Hacer login nuevamente
- El token expira en 24h

**Puerto en uso**:
- Cambiar PORT en `.env`
- O terminar proceso usando el puerto

## 5. Próximos Pasos

- Implementar WebSocket para tiempo real
- Añadir autenticación con Google/GitHub
- Crear app móvil con React Native
- Implementar notificaciones push
