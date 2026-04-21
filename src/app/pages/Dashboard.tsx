import { useEffect } from 'react';
// Subimos dos niveles (../..) para salir de pages y app, luego entramos a lib
import { useProgressStore } from '../../lib/progressStore';
import { useAuthStore } from '../../lib/authStore'; 
import { DashboardStats } from '../components/DashboardStats';
import { ActivityFeed } from '../components/ActivityFeed';
import { MyLatestSection } from '../components/MyLatestSection';
import { Target, Trophy, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard() {
  // Extraemos los datos y la función de carga del store
  const { 
    metas,
    logros, 
    fetchDashboardData,
    backendDashboardOk,
  } = useProgressStore();

  const user = useAuthStore((state) => state.user);

  // Efecto para sincronizar con el backend de Java (Puerto 8080)
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id);
    }
  }, [user?.id, fetchDashboardData]);

  // Lógica de filtrado para la vista
  const metasActivas = metas.filter(m => !m.completada);
  
  const logrosRecientes = logros
    .filter(l => l.desbloqueado && l.fecha)
    .map(l => ({
      ...l,
      fecha: l.fecha instanceof Date ? l.fecha : new Date(l.fecha!)
    }))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Componente que muestra la racha de días */}
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metas/Desafíos no existen en backend actual: se ocultan cuando el dashboard real está activo */}
        {!backendDashboardOk ? (
          <div className="bg-[#2c2d3f] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="text-cyan-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Metas Activas</h2>
              </div>
              <Link
                to="/progreso"
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
              >
                Ver todas
                <ChevronRight size={16} />
              </Link>
            </div>

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
        ) : (
          <div className="bg-[#2c2d3f] rounded-2xl p-6 text-gray-400 text-sm">
            Metas y desafíos aún no están disponibles desde el backend.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logros Recientes */}
        <div className="bg-[#2c2d3f] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Logros Recientes</h2>
            </div>
            {/* Puntos no vienen del backend actual */}
          </div>
          <div className="space-y-3">
            {logrosRecientes.map((logro) => (
              <div key={logro.id} className="bg-[#3a3b4f] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{logro.icono}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{logro.titulo}</h3>
                    <p className="text-gray-400 text-sm">{logro.descripcion}</p>
                    {logro.fecha && (
                      <p className="text-gray-500 text-xs mt-1">
                        {format(logro.fecha, "dd 'de' MMM 'de' yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                  <div className="text-yellow-400 font-semibold">+{logro.puntos}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ActivityFeed es mock; se oculta */}
        <div className="hidden">
          <ActivityFeed />
        </div>
        <MyLatestSection />
      </div>
    </div>
  );
}