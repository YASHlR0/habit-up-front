import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';

export function OnboardingCategoria() {
  const navigate = useNavigate();
  const { updateOnboarding, onboardingData } = useAuthStore();

  const categorias = [
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'nicotina', label: 'Nicotina y tabaco' },
    { id: 'drogas', label: 'Drogas' },
    { id: 'comportamiento', label: 'Comportamiento impulsivo' },
  ];

  const handleSelect = (categoria: string) => {
    updateOnboarding({ 
      categoria: categoria as 'alcohol' | 'nicotina' | 'drogas' | 'comportamiento' 
    });
    navigate('/onboarding/fecha');
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
        <h1 className="text-xl font-bold text-white mt-8">
          ¿Qué estas dejando?
        </h1>

        {/* Opciones */}
        <div className="space-y-3 pt-6">
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`w-full py-6 text-lg font-semibold rounded-full transition-all ${
                onboardingData.categoria === cat.id
                  ? 'bg-cyan-400 text-gray-900'
                  : 'bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
