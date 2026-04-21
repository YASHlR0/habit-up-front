import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-cyan-400/10 px-6 py-3 rounded-xl border-2 border-cyan-400">
            <Flame className="text-cyan-400" size={48} />
            <div className="text-left">
              <div className="text-5xl font-black text-cyan-400 tracking-tight">HU</div>
              <div className="text-xs text-cyan-300 font-semibold">Habit Up</div>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="text-2xl font-bold text-white mt-12">
          Felicidades no todos dan el primer paso
        </h1>

        {/* Botones */}
        <div className="space-y-4 pt-8">
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-6 text-lg font-semibold rounded-full"
          >
            Iniciar sesión
          </Button>

          <Button
            onClick={() => navigate('/register')}
            className="w-full bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600 py-6 text-lg font-semibold rounded-full transition-colors"
          >
            Crear cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
