import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useProgressStore } from '@/lib/progressStore';
import { useAuthStore } from '@/lib/authStore';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  const data = [
    { name: 'completed', value: value },
    { name: 'remaining', value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 relative" style={{ minWidth: 80, minHeight: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={35}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#3a3b4f" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{value}%</span>
        </div>
      </div>
      <span className="text-gray-400 text-xs mt-2 text-center">{label}</span>
    </div>
  );
}

export function DashboardStats() {
  const { puntosTotales, calcularNivel, desafios, metas, logros, backendDashboardOk, diasSobrio } = useProgressStore();
  const { user } = useAuthStore();
  const nivel = calcularNivel();
  
  // Calcular porcentajes reales
  
  // 1. Desafíos diarios completados
  const desafiosCompletados = desafios.filter(d => d.completado).length;
  const desafiosPorcentaje = desafios.length > 0 
    ? Math.round((desafiosCompletados / desafios.length) * 100)
    : 0;
  
  // 2. Progreso de metas activas (promedio)
  const metasActivas = metas.filter(m => !m.completada);
  const metasPorcentaje = metasActivas.length > 0
    ? Math.round(
        metasActivas.reduce((sum, meta) => 
          sum + (meta.progreso / meta.objetivo) * 100, 0
        ) / metasActivas.length
      )
    : metas.filter(m => m.completada).length === metas.length && metas.length > 0
    ? 100 // Si todas están completadas
    : 0;
  
  // 3. Logros desbloqueados
  const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;
  const logrosPorcentaje = logros.length > 0
    ? Math.round((logrosDesbloqueados / logros.length) * 100)
    : 0;

  // Obtener nombre del usuario
  const nombreUsuario = user?.fullName || 'Usuario';
  
  return (
    <div className="bg-[#2c2d3f] rounded-2xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">
            ¡Bienvenido de nuevo, {nombreUsuario}!
          </h2>
          <p className="text-gray-400 text-sm">Mantén tu racha activa</p>
          <div className="mt-8">
            <div className="flex items-baseline gap-3">
              <div className="text-cyan-400 text-7xl font-bold">{diasSobrio}</div>
            </div>
            <p className="text-gray-400 text-sm mt-3">Días limpios</p>
            <p className="text-gray-500 text-xs mt-1">Nivel {nivel} • {puntosTotales} puntos</p>
          </div>
        </div>

        {/* Los círculos de % dependen de metas/desafíos/logros locales */}
        {true ? (
          <div className="flex gap-6">
            <StatCard
              label="Desafíos diarios"
              color="#8b5cf6"
              value={desafiosPorcentaje}
            />
            <StatCard
              label="Progreso de metas"
              color="#06b6d4"
              value={metasPorcentaje}
            />
            <StatCard
              label="Logros"
              color="#10b981"
              value={logrosPorcentaje}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-sm max-w-xs">
            Progreso de desafíos/metas aún no disponible desde el backend.
          </div>
        )}
      </div>
    </div>
  );
}
