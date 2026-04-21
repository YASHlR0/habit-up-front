import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { useProgressStore } from '@/lib/progressStore';

export function MyLatestSection() {
  const user = useAuthStore((s) => s.user);
  const checkInDiario = useProgressStore((s) => s.checkInDiario);

  return (
    <div className="bg-[#2c2d3f] rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Acciones rápidas
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => {
            if (!user?.id) return;
            void checkInDiario(user.id);
          }}
          className="flex items-center gap-3 p-4 bg-[#3a3b4f] hover:bg-[#464759] rounded-lg transition-colors text-left"
        >
          <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center">
            <Calendar className="text-cyan-400" size={20} />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Registrar día</p>
            <p className="text-gray-400 text-xs">Marca el día de hoy</p>
          </div>
        </button>
      </div>
    </div>
  );
}
