import { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

export function OnboardingFecha() {
  const navigate = useNavigate();
  const { updateOnboarding, onboardingData } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(onboardingData.fechaInicio || null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    // No permitir fechas futuras
    if (isAfter(date, today)) return;
    
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (!selectedDate) return;
    
    updateOnboarding({ fechaInicio: selectedDate });
    navigate('/onboarding/dias-semana');
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    const today = new Date();
    if (next <= today) {
      setCurrentMonth(next);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 text-center">
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
          ¿Cuando fue tu fecha de inicio de abstinencia?
        </h1>

        {/* Calendario */}
        <div className="bg-white rounded-xl p-6 mx-auto max-w-md">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="text-gray-900" size={20} />
            </button>
            <span className="text-gray-900 font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="text-gray-900" size={20} />
            </button>
          </div>

          {/* Grid del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días de la semana */}
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
              <div key={i} className="text-center text-gray-600 text-sm font-semibold py-2">
                {day}
              </div>
            ))}

            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Días del mes */}
            {daysInMonth.map((day) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dayDate = new Date(day);
              dayDate.setHours(0, 0, 0, 0);
              const isFuture = isAfter(dayDate, today);
              const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(dayDate)}
                  disabled={isFuture}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : isFuture
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón continuar */}
        <Button
          onClick={handleContinue}
          disabled={!selectedDate}
          className="w-full max-w-md bg-[#3a3b4f] hover:bg-[#464759] text-white border border-gray-600 py-6 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
