import { useEffect, useState } from 'react';
import { useAuthStore } from './authStore';

export function useTimeElapsed() {
  const { user } = useAuthStore();
  const [elapsed, setElapsed] = useState({ days: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Si no hay usuario, no calculamos
    if (!user) {
      setElapsed({ days: 0, minutes: 0, seconds: 0 });
      return;
    }

    // Obtener timestamp de creación desde localStorage
    const createdAtKey = `user_created_at_${user.id}`;
    let createdAtTimestamp = localStorage.getItem(createdAtKey);

    // Si no existe, establecerlo ahora
    if (!createdAtTimestamp) {
      createdAtTimestamp = Date.now().toString();
      localStorage.setItem(createdAtKey, createdAtTimestamp);
    }

    const createdAt = parseInt(createdAtTimestamp, 10);

    // Actualizar cada segundo
    const updateElapsed = () => {
      const now = Date.now();
      const diffMs = now - createdAt;
      const diffSeconds = Math.floor(diffMs / 1000);
      
      const days = Math.floor(diffSeconds / 86400); // 86400 segundos = 1 día
      const remainingSeconds = diffSeconds % 86400;
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      setElapsed({ days, minutes, seconds });
    };

    // Actualizar inmediatamente
    updateElapsed();

    // Actualizar cada segundo
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [user]);

  return elapsed;
}
