import { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';

export function OnboardingDiasSemana() {
  const navigate = useNavigate();
  const { updateOnboarding, onboardingData } = useAuthStore();
  
  const [diasSeleccionados, setDiasSeleccionados] = useState(
    onboardingData.diasSemanaSeleccionados || [false, false, false, false, false, false, false]
  );
  const dias = useMemo(() => diasSeleccionados.filter(Boolean).length, [diasSeleccionados]);

  const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const toggleDia = (index: number) => {
    const nuevos = [...diasSeleccionados];
    nuevos[index] = !nuevos[index];
    setDiasSeleccionados(nuevos);
  };

  const handleContinue = () => {
    updateOnboarding({
      diasPorSemana: dias,
      diasSemanaSeleccionados: diasSeleccionados,
    });
    navigate('/onboarding/mejoras');
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
        <h1 className="text-xl font-bold text-white">
          ¿Cuándo días a la semana lo haces?
        </h1>

        {/* Contador basado solo en selección */}
        <div className="flex items-center justify-center gap-6 pt-6">
          <div className="bg-gray-200 px-8 py-4 rounded-full min-w-[140px]">
            <span className="text-gray-900 text-2xl font-bold">{dias} días</span>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="flex justify-center gap-3 pt-6">
          {diasSemana.map((dia, index) => (
            <button
              key={index}
              onClick={() => toggleDia(index)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                diasSeleccionados[index]
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900 border-2 border-gray-300'
              }`}
            >
              {diasSeleccionados[index] ? '✕' : dia}
            </button>
          ))}
        </div>

        {/* Botón continuar */}
        <div className="pt-8">
          <Button
            onClick={handleContinue}
            disabled={dias === 0}
            className="w-full bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600 py-6 text-lg font-semibold rounded-full"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
