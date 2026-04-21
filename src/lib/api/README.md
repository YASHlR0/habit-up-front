# 📡 Guía de Mapeo de API

Este documento explica cómo está estructurado el sistema de API y cómo crear nuevos servicios.

## Estructura

```
src/lib/api/
├── httpClient.ts      # Cliente HTTP reutilizable
├── authApi.ts         # Servicios de autenticación
├── index.ts           # Exportaciones públicas
└── [otros servicios]
```

## Cliente HTTP (httpClient.ts)

Es un cliente genérico para realizar llamadas HTTP con manejo automático de:
- Headers (token, content-type)
- Parámetros de query
- Manejo de errores
- Almacenamiento de token en localStorage

### Uso

```typescript
import { httpClient } from '@/lib/api';

// GET
const data = await httpClient.get<UserType>('/users/1');

// POST
const result = await httpClient.post<ResponseType>('/users', {
  email: 'test@example.com',
  name: 'John'
});

// PUT
const updated = await httpClient.put<ResponseType>('/users/1', {
  email: 'new@example.com'
});

// DELETE
await httpClient.delete('/users/1');

// Con parámetros de query
const filtered = await httpClient.get<UserType[]>('/users', {
  params: {
    page: 1,
    limit: 10,
    search: 'john'
  }
});

// Con token personalizado
const response = await httpClient.post('/endpoint', {}, { 
  token: 'custom-token' 
});
```

## Servicio de Autenticación (authApi.ts)

Proporciona funciones específicas para login, registro y verificación:

```typescript
import { loginUser, registerUser, verifyToken, logoutUser } from '@/lib/api';

// Login
const user = await loginUser('email@example.com', 'password123');
// Retorna: { id, email, nombre, token }

// Registro
const newUser = await registerUser('email@example.com', 'password123', 'John Doe');
// Retorna: { id, email, nombre, token }

// Verificar token
const verified = await verifyToken('token-string');
// Retorna: { id, email, nombre }

// Logout
await logoutUser();
```

## Cómo Crear un Nuevo Servicio

Ejemplo: Servicio para Hábitos

### 1. Crear archivo `habitsApi.ts`

```typescript
import { httpClient } from './httpClient';

interface Habit {
  id: string;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  createdAt: string;
}

export async function getHabits(): Promise<Habit[]> {
  return httpClient.get<Habit[]>('/habits');
}

export async function createHabit(data: {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}): Promise<Habit> {
  return httpClient.post<Habit>('/habits', data);
}

export async function updateHabit(id: string, data: Partial<Habit>): Promise<Habit> {
  return httpClient.put<Habit>(`/habits/${id}`, data);
}

export async function deleteHabit(id: string): Promise<void> {
  return httpClient.delete(`/habits/${id}`);
}
```

### 2. Exportar en `index.ts`

```typescript
export * from './habitsApi';
```

### 3. Usar en componentes

```typescript
import { getHabits, createHabit } from '@/lib/api';

function HabitsComponent() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    getHabits().then(setHabits).catch(console.error);
  }, []);

  const handleCreate = async (formData: any) => {
    const newHabit = await createHabit(formData);
    setHabits([...habits, newHabit]);
  };

  // ... resto del componente
}
```

## Configuración de URL Base

La URL base se obtiene de la variable de entorno `VITE_API_URL` o usa `http://localhost:8080/api` por defecto.

Para configurar:

### Archivo `.env.local`
```
VITE_API_URL=https://tu-api.com/api
```

### Archivo `.env.production`
```
VITE_API_URL=https://produccion-api.com/api
```

## Autenticación con Token

El cliente HTTP automáticamente incluye el token almacenado en `localStorage` bajo la clave `token`.

Después de login/registro:
```typescript
const user = await loginUser(email, password);
// El token se guarda automáticamente en localStorage
// El cliente HTTP lo usará en todas las peticiones futuras
```

## Manejo de Errores

Todos los servicios lanzan errores que puedes capturar:

```typescript
try {
  const user = await loginUser(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
  setError('Credenciales incorrectas');
}
```

## Flujo de Autenticación Actual

1. Usuario entra credenciales
2. `Login.tsx` llama `useAuthStore().login(email, password)`
3. AuthStore llama `loginUser()` del authApi
4. AuthApi usa httpClient para POST a `/users/login`
5. Si éxito, token se guarda y usuario se establece en store
6. Token se incluye automáticamente en futuras peticiones

## Ventajas de esta Estructura

✅ **DRY** - No repites lógica de fetch  
✅ **Centralizado** - Todos los endpoints en un lugar  
✅ **Tipado** - Interfaces TypeScript para respuestas  
✅ **Reutilizable** - httpClient se usa en todos lados  
✅ **Mantenible** - Cambios en un solo lugar  
✅ **Testeable** - Fácil de mockear en tests  
✅ **Escalable** - Fácil agregar nuevos servicios
