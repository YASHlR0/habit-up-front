export interface Meta {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'diaria' | 'semanal' | 'mensual';
  progreso: number;
  objetivo: number;
  completada: boolean;
  icono: string;
  recompensa: number;
}

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  desbloqueado: boolean;
  fecha?: Date;
  requisito: string;
  puntos: number;
}

export interface Desafio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'diario' | 'semanal';
  progreso: number;
  objetivo: number;
  completado: boolean;
  icono: string;
  recompensa: number;
  expira: Date;
}

export interface DiaCalendario {
  fecha: Date;
  tipo: 'sobrio' | 'recaida';
  nota?: string; // Para recaídas
}

export interface RachaGuardada {
  id: string;
  dias: number;
  fechaInicio: Date;
  fechaFin: Date;
  motivoRecaida?: string;
  puntos: number;
}

// Estado global de usuario
export interface UserProgress {
  diasSobrio: number;
  puntosTotales: number;
  nivel: number;
  rachaActual: number;
  mejorRacha: number;
  fechaInicioRacha: Date;
  metas: Meta[];
  logros: Logro[];
  desafios: Desafio[];
  calendario: DiaCalendario[];
  rachasGuardadas: RachaGuardada[];
}
