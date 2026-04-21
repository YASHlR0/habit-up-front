import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { useProgressStore } from '@/lib/progressStore';
import { createHabitForUser } from '@/lib/api/habitsApi';

export function OnboardingRecordatorio() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const progressStore = useProgressStore();
  const [recordatorio, setRecordatorio] = useState(authStore.onboardingData.recordatorio || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const mapCategoria = (categoria: string | undefined) => {
    switch (categoria) {
      case 'alcohol':
        return 'Alcohol';
      case 'nicotina':
        return 'Nicotina y tabaco';
      case 'drogas':
        return 'Drogas';
      case 'comportamiento':
        return 'Comportamiento impulsivo';
      default:
        return 'General';
    }
  };

  const handleComplete = async () => {
    if (isProcessing) return;
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando completación de onboarding...');

      // Paso 1.1: Crear hábito real en backend (tabla habits)
      const currentUser = authStore.user;
      if (currentUser?.id) {
        const categoria = mapCategoria(authStore.onboardingData.categoria);
        const startDate = authStore.onboardingData.fechaInicio
          ? new Date(authStore.onboardingData.fechaInicio).toISOString()
          : new Date().toISOString();

        await createHabitForUser(currentUser.id, {
          name: categoria,
          description: recordatorio.trim() || `Objetivo personal: ${categoria}`,
          category: categoria,
          startDate,
          dailyExpense: 0,
          currency: 'MXN',
        });
      }
      
      // Paso 2: Actualizar recordatorio
      console.log('📝 Guardando recordatorio...');
      authStore.updateOnboarding({ recordatorio });
      
      // Paso 3: Pequeña pausa
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Paso 4: Resetear progress store
      console.log('🔄 Reseteando progress store...');
      progressStore.resetearTodo();
      
      // Paso 5: Inicializar con datos del onboarding
      console.log('📅 Inicializando con fecha:', authStore.onboardingData.fechaInicio);
      if (authStore.onboardingData.fechaInicio) {
        progressStore.inicializarConOnboarding(authStore.onboardingData.fechaInicio);
      }
      
      // Paso 6: Pequeña pausa
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Paso 7: Marcar onboarding como completado
      console.log('✅ Marcando onboarding como completado...');
      authStore.completeOnboarding();
      
      // Paso 8: Verificar estado
      const currentState = authStore.onboardingData;
      console.log('📊 Estado final:', {
        completado: currentState.completado,
        isAuthenticated: authStore.isAuthenticated,
      });
      
      // Paso 9: Pausa final antes de navegar
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Paso 10: Navegar
      console.log('🚀 Navegando al dashboard...');
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('❌ Error al completar onboarding:', error);
      setIsProcessing(false);
    }
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
          Recuérdame ti mismo por qué estas haciendo esto
        </h1>
        <p className="text-gray-300 text-sm">
          Lo usaremos las veces cuando te lo tengamos que recordar
        </p>

        {/* Input */}
        <div className="pt-6">
          <textarea
            value={recordatorio}
            onChange={(e) => setRecordatorio(e.target.value)}
            className="w-full h-32 px-6 py-4 bg-[#2c2d3f] border border-gray-600 text-white placeholder-gray-400 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-center"
            placeholder="Escribe tu recordatorio aquí..."
          />
        </div>

        {/* Botón finalizar */}
        <div className="pt-4">
          <Button
            onClick={handleComplete}
            disabled={!recordatorio.trim() || isProcessing}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-6 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? 'Completando...' : 'Comenzar mi viaje'}
          </Button>
        </div>
      </div>
    </div>
  );
}
