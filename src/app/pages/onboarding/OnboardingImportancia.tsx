import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';

export function OnboardingImportancia() {
  const navigate = useNavigate();
  const { updateOnboarding } = useAuthStore();

  const opciones = [
    { id: 'critica', label: 'Crítica' },
    { id: 'muy', label: 'Muy' },
    { id: 'algo', label: 'Algo' },
    { id: 'seria-bueno', label: 'Sería bueno tenerla' },
  ];

  const handleSelect = (importancia: string) => {
    updateOnboarding({
      importancia: importancia as 'critica' | 'muy' | 'algo' | 'seria-bueno',
    });
    navigate('/onboarding/autopercepcion');
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-cyan-400/10 px-6 py-3 rounded-xl border-2 border-cyan-400">
            <Flame className="text-cyan-400" size={40} />
            <div className="text-left">
              <div className="text-4xl font-black text-cyan-400 tracking-tight">HU</div>
              <div className="text-xs text-cyan-300 font-semibold">Habit Up</div>
            </div>
          </div>
        </div>

        {/* Pregunta */}
        <h1 className="text-xl font-bold text-white px-4">
          ¿Qué tan importante es la abstinencia para ti en este momento?
        </h1>

        {/* Opciones */}
        <div className="space-y-3 pt-6">
          {opciones.map((opcion) => (
            <Button
              key={opcion.id}
              onClick={() => handleSelect(opcion.id)}
              className="w-full bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600 py-6 text-lg font-semibold rounded-full"
            >
              {opcion.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
