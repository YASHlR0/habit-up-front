# 🚀 Snippets Rápidos - Sistema de API

Copia y pega estos ejemplos para empezar rápidamente.

## 1️⃣ Login en Componente

```typescript
import { useAuthStore } from '@/lib/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario aquí */}
    </form>
  );
}
```

## 2️⃣ Usar Datos de Hábitos

```typescript
import { useEffect, useState } from 'react';
import { getHabits, createHabit, type Habit } from '@/lib/api';

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      const newHabit = await createHabit(formData);
      setHabits([...habits, newHabit]);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {habits.map((habit) => (
        <div key={habit.id}>{habit.titulo}</div>
      ))}
    </div>
  );
}
```

## 3️⃣ Crear Nuevo Servicio API

```typescript
// src/lib/api/progressApi.ts
import { httpClient } from './httpClient';

export interface Progress {
  id: string;
  habitId: string;
  fecha: string;
  completado: boolean;
}

export async function getProgress(habitId: string): Promise<Progress[]> {
  return httpClient.get<Progress[]>(`/habits/${habitId}/progress`);
}

export async function logProgress(habitId: string): Promise<Progress> {
  return httpClient.post(`/habits/${habitId}/progress/log`);
}
```

Luego en `src/lib/api/index.ts`:
```typescript
export * from './progressApi';
```

## 4️⃣ Usar httpClient Directamente

```typescript
import { httpClient } from '@/lib/api';

// Obtener datos
const data = await httpClient.get('/endpoint', {
  params: {
    page: 1,
    limit: 10
  }
});

// Crear recurso
const result = await httpClient.post('/endpoint', {
  nombre: 'test',
  valor: 100
});

// Actualizar
const updated = await httpClient.put('/endpoint/123', {
  nombre: 'updated'
});

// Eliminar
await httpClient.delete('/endpoint/123');
```

## 5️⃣ Verificación de Login en App

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { verifyToken } from '@/lib/api';

export function App() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        try {
          const user = await verifyToken(token);
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    };

    checkAuth();
  }, []);

  return <YourRoutes />;
}
```

## 6️⃣ Componente con Manejo de Errores

```typescript
import { useState } from 'react';
import { createHabit } from '@/lib/api';

export function CreateHabitForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createHabit({
        titulo: formData.get('titulo') as string,
        descripcion: formData.get('descripcion') as string,
        categoria: formData.get('categoria') as string,
        frecuencia: formData.get('frecuencia') as any,
      });

      setSuccess('Hábito creado exitosamente');
      // Reset form
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message || 'Error al crear hábito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <input name="titulo" placeholder="Título" required />
      <textarea name="descripcion" placeholder="Descripción" />
      <select name="categoria" required>
        <option>Salud</option>
        <option>Productividad</option>
      </select>
      <select name="frecuencia" required>
        <option value="diaria">Diaria</option>
        <option value="semanal">Semanal</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Hábito'}
      </button>
    </form>
  );
}
```

## 7️⃣ Hook Personalizado para Datos

```typescript
import { useEffect, useState } from 'react';
import { getHabits, type Habit } from '@/lib/api';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getHabits()
      .then(setHabits)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { habits, loading, error };
}

// Uso en componente:
function MyComponent() {
  const { habits, loading, error } = useHabits();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return habits.map(h => <div key={h.id}>{h.titulo}</div>);
}
```

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# URL del Backend
VITE_API_URL=http://localhost:8080/api

# En producción
VITE_NODE_ENV=production
```

Para desarrollo local, normalmente no necesitas cambiar nada (usa localhost:8080 por defecto).

---

**¿Necesitas otro servicio API? Sigue el patrón:**
1. Crea `src/lib/api/tuServicio.ts`
2. Usa `httpClient` para las llamadas
3. Exporta en `src/lib/api/index.ts`
4. ¡Úsalo en tus componentes!
