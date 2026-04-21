/**
 * Servicio de API para Hábitos
 * Mapeado a endpoints reales de backend
 */

import { httpClient } from './httpClient';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: string;
  startDate?: string;
  dailyExpense: number;
  currency: string;
  isActive: boolean;
  currentStreak: number;
  daysClean: number;
  totalSaved: number;
}

export interface CreateHabitDTO {
  name: string;
  description?: string;
  category: string;
  startDate?: string;
  dailyExpense: number;
  currency?: string;
  goalDays?: number;
}

/**
 * Obtiene hábitos activos de un usuario
 * GET /api/habits/user/{userId}
 */
export async function getHabitsByUser(userId: number): Promise<Habit[]> {
  return httpClient.get<Habit[]>(`/habits/user/${userId}`);
}

/**
 * Obtiene un hábito específico por ID
 * GET /api/habits/{id}
 */
export async function getHabitById(id: number): Promise<Habit> {
  return httpClient.get<Habit>(`/habits/${id}`);
}

/**
 * Crea un hábito para un usuario
 * POST /api/habits/user/{userId}
 */
export async function createHabitForUser(userId: number, data: CreateHabitDTO): Promise<Habit> {
  return httpClient.post<Habit>(`/habits/user/${userId}`, data);
}

/**
 * Actualiza un hábito existente
 * PUT /api/habits/{id}
 */
export async function updateHabit(id: number, data: Partial<CreateHabitDTO>): Promise<Habit> {
  return httpClient.put<Habit>(`/habits/${id}`, data);
}

/**
 * Registrar recaída sobre hábito
 * POST /api/habits/{id}/relapse
 */
export async function registerHabitRelapse(id: number, reason: string): Promise<Habit> {
  return httpClient.post<Habit>(`/habits/${id}/relapse`, { reason });
}

/**
 * Elimina/desactiva un hábito
 * DELETE /api/habits/{id}
 */
export async function deleteHabit(id: number): Promise<void> {
  return httpClient.delete(`/habits/${id}`);
}
