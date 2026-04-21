import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  miembros: number;
  creado: string;
  icono: string;
}

interface GroupStore {
  gruposDisponibles: Grupo[];
  gruposUnidos: number[]; // Array de IDs de grupos unidos
  
  // Acciones
  unirseAGrupo: (grupoId: number) => void;
  abandonarGrupo: (grupoId: number) => void;
  obtenerGruposUnidos: () => Grupo[];
  estaUnido: (grupoId: number) => boolean;
}

const gruposInicial: Grupo[] = [
  {
    id: 1,
    nombre: 'Grupo de Apoyo Principal',
    descripcion: 'Apoyo mutuo 24/7 para todos los miembros',
    miembros: 234,
    creado: '2 años atrás',
    icono: '🔥'
  },
  {
    id: 2,
    nombre: 'Sobriedad Joven',
    descripcion: 'Para jóvenes en recuperación de 18-35 años',
    miembros: 156,
    creado: '1 año atrás',
    icono: '🚀'
  },
  {
    id: 3,
    nombre: 'Familias Unidas',
    descripcion: 'Apoyo para familias afectadas por la adicción',
    miembros: 89,
    creado: '1 año atrás',
    icono: '👨‍👩‍👧‍👦'
  },
  {
    id: 4,
    nombre: 'Meditación y Mindfulness',
    descripcion: 'Prácticas de atención plena y meditación',
    miembros: 312,
    creado: '6 meses atrás',
    icono: '🧘'
  },
  {
    id: 5,
    nombre: 'Ejercicio y Salud',
    descripcion: 'Rutinas de ejercicio y vida saludable',
    miembros: 178,
    creado: '5 meses atrás',
    icono: '💪'
  },
  {
    id: 6,
    nombre: 'Compartir Historias',
    descripcion: 'Comparte tu historia de recuperación',
    miembros: 267,
    creado: '3 meses atrás',
    icono: '📖'
  },
];

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      gruposDisponibles: gruposInicial,
      gruposUnidos: [1, 4], // Por defecto unido a estos dos

      unirseAGrupo: (grupoId: number) => {
        set((state) => {
          if (!state.gruposUnidos.includes(grupoId)) {
            // Incrementar miembros del grupo
            const grupoActualizado = state.gruposDisponibles.map(g =>
              g.id === grupoId ? { ...g, miembros: g.miembros + 1 } : g
            );
            return {
              gruposDisponibles: grupoActualizado,
              gruposUnidos: [...state.gruposUnidos, grupoId]
            };
          }
          return state;
        });
      },

      abandonarGrupo: (grupoId: number) => {
        set((state) => {
          if (state.gruposUnidos.includes(grupoId)) {
            // Decrementar miembros del grupo
            const grupoActualizado = state.gruposDisponibles.map(g =>
              g.id === grupoId ? { ...g, miembros: Math.max(1, g.miembros - 1) } : g
            );
            return {
              gruposDisponibles: grupoActualizado,
              gruposUnidos: state.gruposUnidos.filter(id => id !== grupoId)
            };
          }
          return state;
        });
      },

      obtenerGruposUnidos: () => {
        const { gruposDisponibles, gruposUnidos } = get();
        return gruposDisponibles.filter(g => gruposUnidos.includes(g.id));
      },

      estaUnido: (grupoId: number) => {
        return get().gruposUnidos.includes(grupoId);
      }
    }),
    {
      name: 'habit-up-groups'
    }
  )
);
