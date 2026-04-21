import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { useState } from 'react';

export function OnboardingMejoras() {
  const navigate = useNavigate();
  const { updateOnboarding, onboardingData } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(onboardingData.mejoras || []);

  const opciones = [
    'Mejorar la salud mental',
    'Sentirme orgulloso/a de mí',
    'Tomar control de mi vida',
    'Otro',
  ];

  const toggleOpcion = (opcion: string) => {
    if (selected.includes(opcion)) {
      setSelected(selected.filter((s) => s !== opcion));
    } else {
      setSelected([...selected, opcion]);
    }
  };

  const handleContinue = () => {
    updateOnboarding({ mejoras: selected });
    navigate('/onboarding/importancia');
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
          ¿Qué te gustaría mejorar específicamente en tu vida?
        </h1>

        {/* Opciones */}
        <div className="space-y-3 pt-6">
          {opciones.map((opcion) => (
            <Button
              key={opcion}
              onClick={() => toggleOpcion(opcion)}
              className={`w-full py-6 text-lg font-semibold rounded-full transition-all ${
                selected.includes(opcion)
                  ? 'bg-cyan-400 text-gray-900'
                  : 'bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600'
              }`}
            >
              {opcion}
            </Button>
          ))}
        </div>

        {/* Botón continuar */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600 py-6 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
