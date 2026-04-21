import { httpClient } from './httpClient';

export interface BackendDashboard {
  userId: number;
  fullName: string;
  daysClean: number;
  totalAchievements: number;
  activeHabitsCount: number;
  habits: Array<{
    id: number;
    name: string;
    category: string;
    currentStreak: number;
    daysClean: number;
    startDate?: string;
    totalSaved?: number;
    dailyExpense?: number;
    currency?: string;
    isActive?: boolean;
  }>;
  recentAchievements: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    category: string;
  }>;
  recentRelapses: Array<{
    id: number;
    reason: string;
    emotion: string;
    comment: string;
    relapsedAt: string;
    userId: number;
    username: string;
    description?: string;
  }>;
}

export interface RelapseRequest {
  reason: string;
  emotion: string;
  comment?: string;
}

export interface RelapseResponse {
  id: number;
  reason: string;
  emotion: string;
  comment: string;
  relapsedAt: string;
  userId: number;
  username: string;
  description?: string;
}

export interface AchievementResponse {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export async function getDashboard(userId: number): Promise<BackendDashboard> {
  return httpClient.get<BackendDashboard>(`/dashboard/${userId}`);
}

export async function getRelapseHistory(userId: number): Promise<RelapseResponse[]> {
  return httpClient.get<RelapseResponse[]>(`/relapses/user/${userId}`);
}

export async function getRelapseStats(userId: number): Promise<Array<[string, number]>> {
  return httpClient.get<Array<[string, number]>>(`/relapses/user/${userId}/stats`);
}

export async function createRelapse(userId: number, body: RelapseRequest): Promise<RelapseResponse> {
  return httpClient.post<RelapseResponse>(`/relapses/user/${userId}`, body);
}

export async function getAchievements(userId: number): Promise<AchievementResponse[]> {
  return httpClient.get<AchievementResponse[]>(`/achievements/user/${userId}`);
}

