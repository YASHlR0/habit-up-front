export interface OnboardingData {
  // Información del usuario
  email?: string;
  nombre?: string;
  
  // Información de adicción
  categoria: 'alcohol' | 'nicotina' | 'drogas' | 'comportamiento' | null;
  fechaInicio: Date | null;
  diasPorSemana: number;
  diasSemanaSeleccionados: boolean[];
  
  // Motivación
  mejoras: string[];
  importancia: 'critica' | 'muy' | 'algo' | 'seria-bueno' | null;
  autopercepcion: string | null;
  logroEsperado: string | null;
  recordatorio: string;
  
  // Estado
  completado: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  avatar?: string;
}
