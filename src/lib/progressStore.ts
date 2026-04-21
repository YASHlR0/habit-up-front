import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Meta, Logro, Desafio, DiaCalendario, RachaGuardada } from '@/types/progress';
import axios from 'axios'; // Importamos axios para la conexión
import { getApiBaseUrl } from '@/lib/api/apiBaseUrl';

// Configuración base de la API (misma lógica que httpClient)
const api = axios.create({
  baseURL: getApiBaseUrl(),
});

const logrosIniciales: Logro[] = [
  { id: '1', titulo: 'Primer Paso', descripcion: 'Completa tu primer día sobrio', icono: '🎯', desbloqueado: false, requisito: '1 día sobrio', puntos: 10 },
  { id: '2', titulo: 'Una Semana Fuerte', descripcion: 'Alcanza 7 días de sobriedad', icono: '🔥', desbloqueado: false, requisito: '7 días sobrio', puntos: 50 },
  { id: '3', titulo: 'Dos Semanas', descripcion: 'Mantente sobrio por 14 días', icono: '⭐', desbloqueado: false, requisito: '14 días sobrio', puntos: 100 },
  { id: '4', titulo: 'Un Mes Sobrio', descripcion: 'Alcanza 30 días de sobriedad', icono: '🏆', desbloqueado: false, requisito: '30 días sobrio', puntos: 200 },
  { id: '5', titulo: 'Tres Meses', descripcion: '90 días de sobriedad continua', icono: '💎', desbloqueado: false, requisito: '90 días sobrio', puntos: 500 },
  { id: '6', titulo: 'Seis Meses', descripcion: 'Medio año de sobriedad', icono: '👑', desbloqueado: false, requisito: '180 días sobrio', puntos: 1000 },
  { id: '7', titulo: 'Un Año Completo', descripcion: '365 días de sobriedad', icono: '🎊', desbloqueado: false, requisito: '365 días sobrio', puntos: 2000 },
  { id: '8', titulo: 'Apoyo Comunitario', descripcion: 'Ayuda a 10 personas en la comunidad', icono: '🤝', desbloqueado: false, requisito: '10 comentarios de apoyo', puntos: 75 },
];

const generarDesafiosDiarios = (): Desafio[] => {
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  mañana.setHours(0, 0, 0, 0);
  return [
    { id: 'd1', titulo: 'Reflexión Diaria', descripcion: 'Escribe una publicación en la comunidad', tipo: 'diario', progreso: 0, objetivo: 1, completado: false, icono: '✍️', recompensa: 15, expira: mañana },
    { id: 'd2', titulo: 'Apoyo Mutuo', descripcion: 'Comenta en 3 publicaciones de otros usuarios', tipo: 'diario', progreso: 0, objetivo: 3, completado: false, icono: '💬', recompensa: 20, expira: mañana },
    { id: 'd3', titulo: 'Registra tu Día', descripcion: 'Marca el día de hoy como sobrio', tipo: 'diario', progreso: 0, objetivo: 1, completado: false, icono: '📅', recompensa: 10, expira: mañana },
  ];
};

const metasIniciales: Meta[] = [
  { id: 'm1', titulo: 'Alcanzar 30 Días', descripcion: 'Mantente sobrio por un mes completo', tipo: 'mensual', progreso: 0, objetivo: 30, completada: false, icono: '🎯', recompensa: 200 },
  { id: 'm2', titulo: 'Racha de 7 Días', descripcion: 'Mantén una racha continua de 7 días', tipo: 'semanal', progreso: 0, objetivo: 7, completada: false, icono: '🔥', recompensa: 50 },
  { id: 'm3', titulo: 'Participación Comunitaria', descripcion: 'Publica o comenta 5 veces en la comunidad', tipo: 'semanal', progreso: 0, objetivo: 5, completada: false, icono: '👥', recompensa: 30 },
];

interface ProgressStore extends UserProgress {
  actualizarDiasSobrio: (dias: number) => void;
  completarMeta: (metaId: string) => void;
  completarDesafio: (desafioId: string) => void;
  avanzarDesafio: (desafioId: string, cantidad?: number) => void;
  desbloquearLogro: (logroId: string) => void;
  agregarPuntos: (puntos: number) => void;
  calcularNivel: () => number;
  verificarLogros: () => void;
  resetearDesafiosDiarios: () => void;
  marcarDiaSobrio: (fecha: Date) => void;
  registrarRecaida: (motivo: string) => Promise<void>;
  avanzarMeta: (metaId: string, cantidad?: number) => void;
  inicializarConOnboarding: (fechaInicio: Date | string) => void;
  fetchDashboardData: (userId: number) => Promise<void>;
  checkInDiario: (userId: number) => Promise<void>;
  backendDashboardOk: boolean;
  resetearTodo: () => void;
  actualizarParticipacionComunitaria: (postsCount: number) => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      diasSobrio: 0,
      puntosTotales: 0,
      nivel: 1,
      rachaActual: 0,
      mejorRacha: 0,
      fechaInicioRacha: new Date(),
      metas: metasIniciales,
      logros: logrosIniciales,
      desafios: generarDesafiosDiarios(),
      calendario: [],
      rachasGuardadas: [],
      backendDashboardOk: false,

      // CONEXIÓN REAL CON JAVA PARA CARGAR DATOS
      fetchDashboardData: async (userId: number) => {
        console.log(`🔍 Iniciando carga de dashboard para usuario ${userId}`);
        try {
          // Dashboard real desde Spring Boot
          // GET /api/dashboard/${userId}
          console.log(`🌐 Haciendo petición a: /api/dashboard/${userId}`);
          const response = await api.get(`/dashboard/${userId}`);
          console.log(`✅ Respuesta del backend:`, response.data);
          
          const dashboard = response.data as {
            daysClean?: number;
            habits?: Array<{
              id: number;
              currentStreak?: number;
              startDate?: string;
            }>;
            recentAchievements?: Array<{
              id: number;
              title?: string;
              description?: string;
              icon?: string;
              category?: string;
            }>;
            totalAchievements?: number;
            activeHabitsCount?: number;
          };

          const habits = Array.isArray(dashboard?.habits) ? dashboard.habits : [];
          const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.currentStreak ?? 0), 0);
          const mainHabit = habits[0];

          console.log(`📊 Datos procesados:`, {
            daysClean: dashboard?.daysClean,
            maxStreak: maxStreak,
            habitsCount: habits.length,
            achievementsCount: dashboard?.recentAchievements?.length || 0
          });

          const logrosDesdeBack: Logro[] = (dashboard.recentAchievements ?? []).map((a) => ({
            id: String(a.id),
            titulo: a.title ?? 'Logro',
            descripcion: a.description ?? '',
            icono: a.icon ?? '🏆',
            desbloqueado: true,
            // El backend no trae unlockedAt en el response actual; usamos "ahora" para mostrarlo como reciente
            fecha: new Date(),
            requisito: '',
            puntos: 0,
          }));

          console.log(`📊 Logros desde backend:`, logrosDesdeBack);

          set((state) => ({
            diasSobrio: Math.max(0, Number(dashboard?.daysClean ?? 0)),
            rachaActual: maxStreak,
            fechaInicioRacha: mainHabit?.startDate ? new Date(mainHabit.startDate) : state.fechaInicioRacha,
            // Mientras no exista mapping completo de logros/metas en backend,
            // mostramos los logros recientes reales del backend.
            logros: logrosDesdeBack.length > 0 ? logrosDesdeBack : state.logros,
            backendDashboardOk: true,
          }));
          
          console.log(`✅ Dashboard cargado exitosamente para usuario ${userId}`);
        } catch (error) {
          console.error("❌ Error conectando con Spring Boot:", error);
          console.error("❌ Detalles del error:", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            url: `/api/dashboard/${userId}`
          });
          set({ backendDashboardOk: false });
        }
      },

      // CHECK-IN REAL (avanza racha en BD)
      checkInDiario: async (userId: number) => {
        try {
          await api.post(`/dashboard/user/${userId}/check-in`);
          // Refrescar dashboard desde BD para que la UI quede consistente
          await get().fetchDashboardData(userId);
        } catch (error) {
          console.error("No se pudo registrar el día en el servidor:", error);
          throw error;
        }
      },

      // CONEXIÓN REAL CON JAVA PARA RECAÍDA
      registrarRecaida: async (motivo: string) => {
        try {
          const { rachaActual, fechaInicioRacha, logros } = get();
          
          // 1. Avisamos al backend (usando el ID del hábito, asumiendo que es el primero)
          await api.post(`/habits/1/relapse`, { reason: motivo });

          set((state) => {
            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            const nuevasRachas = [...state.rachasGuardadas];
            
            // 2. Revocar logros que dependen de la racha al recaer
            const logrosRevocados = logros.map(logro => {
              const reqDias = parseInt(logro.requisito);
              // Si el logro depende de días de racha y ahora la racha es 0, revocarlo
              if (logro.desbloqueado && reqDias > 0) {
                return { ...logro, desbloqueado: false, fecha: undefined };
              }
              return logro;
            });
            
            if (rachaActual >= 1) {
              nuevasRachas.push({ 
                id: Date.now().toString(), 
                dias: rachaActual, 
                fechaInicio: fechaInicioRacha, 
                fechaFin: hoy, 
                motivoRecaida: motivo, 
                puntos: rachaActual * 5 
              });
            }

            return { 
              calendario: [...state.calendario, { fecha: hoy, tipo: 'recaida', nota: motivo }], 
              rachaActual: 0, 
              diasSobrio: 0, 
              fechaInicioRacha: hoy,
              rachasGuardadas: nuevasRachas,
              logros: logrosRevocados // Actualizar logros revocados
            };
          });
        } catch (error) {
          console.error("No se pudo registrar la recaída en el servidor:", error);
        }
      },

      // Lógica interna de la App (se mantiene igual)
      actualizarDiasSobrio: (dias) => {
        set({ diasSobrio: dias, rachaActual: dias });
        get().verificarLogros();
      },

      completarMeta: (metaId) => {
        set((state) => {
          const metas = state.metas.map((meta) => meta.id === metaId ? { ...meta, completada: true, progreso: meta.objetivo } : meta);
          const meta = state.metas.find((m) => m.id === metaId);
          if (meta && !meta.completada) return { metas, puntosTotales: state.puntosTotales + meta.recompensa };
          return { metas };
        });
      },

      avanzarMeta: (metaId, cantidad = 1) => {
        set((state) => {
          const metas = state.metas.map((meta) => {
            if (meta.id === metaId && !meta.completada) {
              const nuevoProgreso = Math.min(meta.progreso + cantidad, meta.objetivo);
              return { ...meta, progreso: nuevoProgreso, completada: nuevoProgreso >= meta.objetivo };
            }
            return meta;
          });
          const meta = metas.find((m) => m.id === metaId);
          const metaAnterior = state.metas.find((m) => m.id === metaId);
          if (meta && metaAnterior && meta.completada && !metaAnterior.completada) return { metas, puntosTotales: state.puntosTotales + meta.recompensa };
          return { metas };
        });
      },

      completarDesafio: (desafioId) => {
        set((state) => {
          const desafios = state.desafios.map((desafio) => desafio.id === desafioId ? { ...desafio, completado: true, progreso: desafio.objetivo } : desafio);
          const desafio = desafios.find((d) => d.id === desafioId);
          if (desafio && !desafio.completado) return { desafios, puntosTotales: state.puntosTotales + desafio.recompensa };
          return { desafios };
        });
      },

      avanzarDesafio: (desafioId, cantidad = 1) => {
        set((state) => {
          const desafios = state.desafios.map((desafio) => {
            if (desafio.id === desafioId && !desafio.completado) {
              const nuevoProgreso = Math.min(desafio.progreso + cantidad, desafio.objetivo);
              return { ...desafio, progreso: nuevoProgreso, completado: nuevoProgreso >= desafio.objetivo };
            }
            return desafio;
          });
          const desafio = desafios.find((d) => d.id === desafioId);
          const desafioAnterior = state.desafios.find((d) => d.id === desafioId);
          if (desafio && desafioAnterior && desafio.completado && !desafioAnterior.completado) return { desafios, puntosTotales: state.puntosTotales + desafio.recompensa };
          return { desafios };
        });
      },

      desbloquearLogro: (logroId) => {
        set((state) => {
          const logros = state.logros.map((logro) => logro.id === logroId && !logro.desbloqueado ? { ...logro, desbloqueado: true, fecha: new Date() } : logro);
          const logro = state.logros.find((l) => l.id === logroId);
          if (logro && !logro.desbloqueado) return { logros, puntosTotales: state.puntosTotales + logro.puntos };
          return { logros };
        });
      },

      agregarPuntos: (puntos) => set((state) => ({ puntosTotales: state.puntosTotales + puntos })),
      calcularNivel: () => Math.floor(get().puntosTotales / 100) + 1,

      verificarLogros: () => {
        const { rachaActual, logros, metas } = get();
        logros.forEach((logro) => {
          if (!logro.desbloqueado) {
            const req = parseInt(logro.requisito);
            if (rachaActual >= req) get().desbloquearLogro(logro.id);
          }
        });

        const nuevasMetas = metas.map((meta) => {
          if ((meta.id === 'm1' || meta.id === 'm2') && !meta.completada) {
            const nuevoProgreso = Math.min(rachaActual, meta.objetivo);
            return { ...meta, progreso: nuevoProgreso, completada: nuevoProgreso >= meta.objetivo };
          }
          return meta;
        });
        set({ metas: nuevasMetas });
      },

      resetearDesafiosDiarios: () => set({ desafios: generarDesafiosDiarios() }),

      actualizarParticipacionComunitaria: (postsCount: number) => {
        const { metas } = get();
        set((state) => {
          const nuevasMetas = metas.map((meta) => {
            if (meta.id === 'm3' && !meta.completada) {
              const nuevoProgreso = Math.min(postsCount, meta.objetivo);
              return { ...meta, progreso: nuevoProgreso, completada: nuevoProgreso >= meta.objetivo };
            }
            return meta;
          });
          return { metas: nuevasMetas };
        });
      },

      marcarDiaSobrio: (fecha: Date) => {
        const f = new Date(fecha); f.setHours(0, 0, 0, 0);
        set((state) => {
          const yaExiste = state.calendario.some((d) => d.fecha.getTime() === f.getTime());
          if (yaExiste) return state;
          const nuevoCalendario = [...state.calendario, { fecha: f, tipo: 'sobrio' as const }].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
          let racha = 0;
          for (let i = nuevoCalendario.length - 1; i >= 0; i--) {
            if (nuevoCalendario[i].tipo === 'sobrio') racha++; else break;
          }
          return { calendario: nuevoCalendario, rachaActual: racha, diasSobrio: racha, mejorRacha: Math.max(state.mejorRacha, racha) };
        });
        get().verificarLogros();
      },

      inicializarConOnboarding: (fechaInput) => {
        const fechaInicio = new Date(fechaInput);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        fechaInicio.setHours(0, 0, 0, 0);
        const dias = Math.floor((hoy.getTime() - fechaInicio.getTime()) / 86400000) + 1;
        const cal: DiaCalendario[] = [];
        for (let i = 0; i < dias; i++) {
          const f = new Date(fechaInicio); f.setDate(fechaInicio.getDate() + i);
          cal.push({ fecha: f, tipo: 'sobrio' });
        }
        set({ calendario: cal, diasSobrio: dias, rachaActual: dias, mejorRacha: dias, fechaInicioRacha: fechaInicio });
        get().verificarLogros();
      },

      resetearTodo: () => set({ diasSobrio: 0, puntosTotales: 0, rachaActual: 0, calendario: [], rachasGuardadas: [] }),
    }),
    {
      name: 'habit-up-progress',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.fechaInicioRacha = new Date(state.fechaInicioRacha);
          state.calendario = state.calendario.map((d) => ({ ...d, fecha: new Date(d.fecha) }));
          state.logros = state.logros.map((l) => ({ ...l, fecha: l.fecha ? new Date(l.fecha) : undefined }));
          state.desafios = state.desafios.map((d) => ({ ...d, expira: new Date(d.expira) }));
        }
      },
    }
  )
);