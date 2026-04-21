import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Calendar as CalendarIcon, Flame, AlertTriangle, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProgressStore } from '@/lib/progressStore';
import { Button } from '../components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { createRelapse, getAchievements, getDashboard, getRelapseHistory, getRelapseStats } from '@/lib/api/progressApi';

export function MiProgreso() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecaidaModal, setShowRecaidaModal] = useState(false);
  const [motivoRecaida, setMotivoRecaida] = useState('');
  const [emocionRecaida, setEmocionRecaida] = useState('');
  const [comentarioRecaida, setComentarioRecaida] = useState('');
  const [loading, setLoading] = useState(false);
  const [relapses, setRelapses] = useState<Array<{
    id: number;
    reason: string;
    emotion: string;
    comment: string;
    relapsedAt: string;
  }>>([]);
  const [relapseStats, setRelapseStats] = useState<Array<{ nombre: string; dias: number }>>([]);
  const [progressData, setProgressData] = useState<Array<{ mes: string; dias: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ nombre: string; dias: number }>>([]);
  const [achievementsData, setAchievementsData] = useState<Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    category: string;
  }>>([]);

  const {
    rachaActual,
    mejorRacha,
    metas,
    logros,
    fechaInicioRacha,
    rachasGuardadas,
    fetchDashboardData,
  } = useProgressStore();
  const user = useAuthStore((s) => s.user);

  const userId = user?.id;

  // Asegurar que fechaInicioRacha es un Date
  const fechaInicio = fechaInicioRacha instanceof Date 
    ? fechaInicioRacha 
    : new Date(fechaInicioRacha);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // El backend actual NO expone endpoints para marcar días sobrios en calendario.
  // Usamos recaídas para marcar días rojos, y el resto queda neutro.
  const getDayStatus = (day: Date) => {
    const match = relapses.find((r) => isSameDay(new Date(r.relapsedAt), day));
    if (!match) return null;
    return { tipo: 'recaida' as const, nota: match.reason };
  };

  const { registrarRecaida } = useProgressStore();

  const handleRecaida = () => {
    if (!userId) return;
    if (!motivoRecaida.trim() || !emocionRecaida.trim()) {
      alert('Por favor, completa razón y emoción');
      return;
    }
    void (async () => {
      try {
        // 1. Crear recaída en el backend
        await createRelapse(userId, {
          reason: motivoRecaida.trim(),
          emotion: emocionRecaida.trim(),
          comment: comentarioRecaida.trim() || undefined,
        });
        
        // 2. Actualizar estado local (reiniciar racha y revocar logros)
        await registrarRecaida(motivoRecaida.trim());
        
        setMotivoRecaida('');
        setEmocionRecaida('');
        setComentarioRecaida('');
        setShowRecaidaModal(false);
        
        // 3. Refrescar data del backend
        setLoading(true);
        const [dash, hist, stats] = await Promise.all([
          getDashboard(userId),
          getRelapseHistory(userId),
          getRelapseStats(userId),
        ]);
        setRelapses(hist);
        setRelapseStats((stats ?? []).map(([reason, count]) => ({ nombre: reason, dias: Number(count) })));
        setCategoryData((dash.habits ?? []).map((h) => ({ nombre: h.category ?? h.name, dias: Number(h.currentStreak ?? 0) })));
      } catch (e) {
        console.error('No se pudo registrar la recaída:', e);
      } finally {
        setLoading(false);
      }
    })();
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const firstDayOfWeek = monthStart.getDay();
  
  const logrosDesbloqueados = achievementsData.length;
  const metasActivas = useMemo(() => metas.filter((meta) => !meta.completada), [metas]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [dash, hist, stats, achievements] = await Promise.all([
          getDashboard(userId),
          getRelapseHistory(userId),
          getRelapseStats(userId),
          getAchievements(userId),
        ]);
        if (!mounted) return;

        // Relapses
        setRelapses(hist ?? []);
        setRelapseStats((stats ?? []).map(([reason, count]) => ({ nombre: reason, dias: Number(count) })));

        // Category chart desde hábitos (racha actual por categoría/nombre)
        setCategoryData((dash.habits ?? []).map((h) => ({ nombre: h.category ?? h.name, dias: Number(h.currentStreak ?? 0) })));

        // Progreso mensual: contamos recaídas por mes (últimos 6 meses)
        const now = new Date();
        const months: Array<{ label: string; from: Date; to: Date }> = [];
        for (let i = 5; i >= 0; i--) {
          const d = subMonths(now, i);
          months.push({
            label: format(d, 'MMM', { locale: es }),
            from: startOfMonth(d),
            to: endOfMonth(d),
          });
        }
        const byMonth = months.map((m) => ({
          mes: m.label,
          dias: (hist ?? []).filter((r) => {
            const dt = new Date(r.relapsedAt);
            return dt >= m.from && dt <= m.to;
          }).length,
        }));
        setProgressData(byMonth);

        // Logros reales (completos) para esta vista
        setAchievementsData(achievements ?? []);

        // Sincroniza dashboard en store (dias/racha) para otras vistas
        await fetchDashboardData(userId);
      } catch (e) {
        console.error('No se pudo cargar Mi Progreso:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [userId, fetchDashboardData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mi Progreso</h1>
          <p className="text-gray-400">Visualiza tu camino hacia la sobriedad</p>
        </div>
        
        {/* Botón de Recaída */}
        <Button
          onClick={() => setShowRecaidaModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <AlertTriangle size={18} />
          Registrar Recaída
        </Button>
      </div>

      {/* Modal de Recaída */}
      {showRecaidaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2c2d3f] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Registrar Recaída</h3>
              <button
                onClick={() => setShowRecaidaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                Entendemos que la recuperación es un proceso. Registrar esto te ayudará a aprender y seguir adelante.
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-200 text-sm">
                ⚠️ Esto reiniciará tu racha actual, pero guardaremos tu progreso de {rachaActual} días como un logro.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Razón (obligatorio)
                </label>
                <input
                  value={motivoRecaida}
                  onChange={(e) => setMotivoRecaida(e.target.value)}
                  placeholder="Ej: Ansiedad, Estrés, Presión Social..."
                  className="w-full bg-[#3a3b4f] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Emoción (obligatorio)
                  </label>
                  <input
                    value={emocionRecaida}
                    onChange={(e) => setEmocionRecaida(e.target.value)}
                    placeholder="Ej: Triste, Frustrado, Enojado..."
                    className="w-full bg-[#3a3b4f] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comentarioRecaida}
                    onChange={(e) => setComentarioRecaida(e.target.value)}
                    placeholder="¿Qué pasó en ese momento? (opcional)"
                    className="w-full bg-[#3a3b4f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[90px] resize-none"
                  />
                </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowRecaidaModal(false)}
                  className="flex-1 bg-[#3a3b4f] hover:bg-[#464759] text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRecaida}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmar Recaída
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2c2d3f] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center">
              <Flame className="text-cyan-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Racha actual</span>
          </div>
          <p className="text-3xl font-bold text-white">{rachaActual} días</p>
          {rachaActual > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Desde {format(fechaInicio, 'dd/MM/yyyy', { locale: es })}
            </p>
          )}
        </div>

        <div className="bg-[#2c2d3f] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
              <Trophy className="text-green-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Mejor racha</span>
          </div>
          <p className="text-3xl font-bold text-white">{mejorRacha} días</p>
        </div>

        <div className="bg-[#2c2d3f] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="text-purple-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Días sobrios totales</span>
          </div>
          <p className="text-3xl font-bold text-white">—</p>
        </div>

        <div className="bg-[#2c2d3f] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Rachas completadas</span>
          </div>
          <p className="text-3xl font-bold text-white">{rachasGuardadas.length}</p>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-[#2c2d3f] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Calendario de Sobriedad</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-[#3a3b4f] rounded-lg transition-colors"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
            <span className="text-white font-semibold min-w-[150px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-[#3a3b4f] rounded-lg transition-colors"
            >
              <ChevronRight className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            <span className="text-gray-400">Día sobrio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">Recaída</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-gray-400">Inicio de racha</span>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-2">
          {/* Días de la semana */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">
              {day}
            </div>
          ))}

          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Días del mes */}
          {daysInMonth.map((day) => {
            const status = getDayStatus(day);
            const esHoy = isToday(day);
            const esFuturo = isBefore(new Date(), day);

            return (
              <button
                key={day.toISOString()}
                disabled={esFuturo}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative ${
                  esFuturo
                    ? 'bg-[#3a3b4f]/30 text-gray-600 cursor-not-allowed'
                    : status?.tipo === 'recaida'
                    ? 'bg-red-500 text-white'
                    : 'bg-[#3a3b4f] text-white hover:bg-[#464759]'
                } ${esHoy ? 'ring-2 ring-white' : ''}`}
                title={
                  status?.tipo === 'recaida' ? `Recaída: ${status.nota || 'Sin nota'}` : ''
                }
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rachas Anteriores */}
      {rachasGuardadas.length > 0 && (
        <div className="bg-[#2c2d3f] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Rachas Anteriores</h2>
          <div className="space-y-3">
            {[...rachasGuardadas].reverse().map((racha) => {
              const fechaIni = racha.fechaInicio instanceof Date ? racha.fechaInicio : new Date(racha.fechaInicio);
              const fechaFinal = racha.fechaFin instanceof Date ? racha.fechaFin : new Date(racha.fechaFin);
              
              return (
                <div key={racha.id} className="bg-[#3a3b4f] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="text-yellow-400" size={20} />
                        <h3 className="text-white font-semibold">
                          Racha de {racha.dias} días
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        {format(fechaIni, 'dd/MM/yyyy', { locale: es })} -{' '}
                        {format(fechaFinal, 'dd/MM/yyyy', { locale: es })}
                      </p>
                      {racha.motivoRecaida && (
                        <p className="text-gray-500 text-sm italic">
                          "{racha.motivoRecaida}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">+{racha.puntos} pts</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metas Activas */}
      <div className="bg-[#2c2d3f] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Metas Activas
        </h2>
        <div className="space-y-3">
          {metasActivas.slice(0, 3).map((meta) => (
            <div key={meta.id} className="bg-[#3a3b4f] rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="text-2xl">{meta.icono}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{meta.titulo}</h3>
                  <p className="text-gray-400 text-sm">{meta.descripcion}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {meta.progreso}/{meta.objetivo}
                  </span>
                  <span className="text-cyan-400">
                    {Math.round((meta.progreso / meta.objetivo) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#2c2d3f] rounded-full h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all"
                    style={{ width: `${(meta.progreso / meta.objetivo) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logros */}
      <div className="bg-[#2c2d3f] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Logros Desbloqueados ({logrosDesbloqueados})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievementsData.map((logro) => (
            <div
              key={logro.id}
              className="rounded-xl p-4 text-center transition-all bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30"
            >
              <div className="text-4xl mb-2">{logro.icon || '🏆'}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{logro.title}</h3>
              <p className="text-gray-400 text-xs mb-2">{logro.description}</p>
              <p className="text-cyan-400 text-xs">{logro.category}</p>
            </div>
          ))}
          {achievementsData.length === 0 && (
            <div className="text-gray-400 text-sm col-span-2 md:col-span-4">
              Aún no tienes logros registrados en el backend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}