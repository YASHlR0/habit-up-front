import { httpClient } from './httpClient';

export interface UserProfileDTO {
  id: number;
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  isPrivate?: boolean | null;
  postsCount?: number | null;
  achievementsCount?: number | null;
  habitsCount?: number | null;
  recentAchievementIcons?: string[] | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeUserProfile(raw: unknown, fallbackId: number): UserProfileDTO {
  const root = asRecord(raw);
  const payload = asRecord(root.data ?? root.user ?? root.profile ?? root);

  const id =
    asNumber(payload.id) ??
    asNumber(payload.userId) ??
    asNumber(payload.user_id) ??
    fallbackId;

  const fullName =
    asString(payload.fullName) ??
    asString(payload.full_name) ??
    asString(payload.username) ??
    asString(payload.name) ??
    `Usuario ${id}`;

  return {
    id,
    fullName,
    bio:
      asString(payload.bio) ??
      asString(payload.biography) ??
      asString(payload.about) ??
      asString(payload.description) ??
      null,
    avatarUrl:
      asString(payload.avatarUrl) ??
      asString(payload.avatar) ??
      asString(payload.profileImageUrl) ??
      asString(payload.profile_image_url) ??
      null,
    location: asString(payload.location) ?? asString(payload.city) ?? null,
    isPrivate:
      asBoolean(payload.isPrivate) ??
      asBoolean(payload.privateProfile) ??
      asBoolean(payload.private) ??
      null,
    postsCount: asNumber(payload.postsCount) ?? asNumber(payload.totalPosts) ?? null,
    achievementsCount: asNumber(payload.achievementsCount) ?? asNumber(payload.totalAchievements) ?? null,
    habitsCount: asNumber(payload.habitsCount) ?? asNumber(payload.totalHabits) ?? null,
    recentAchievementIcons: Array.isArray(payload.recentAchievementIcons)
      ? (payload.recentAchievementIcons as string[])
      : null,
  };
}

export async function getUserProfile(id: number): Promise<UserProfileDTO> {
  const raw = await httpClient.get<unknown>(`/users/${id}/profile`);
  return normalizeUserProfile(raw, id);
}

export async function updateUserProfile(
  id: number,
  data: Partial<{
    fullName: string;
    bio: string;
    avatarUrl: string;
    location: string;
    phoneNumber: string;
    isPrivate: boolean;
    notificationsEnabled: boolean;
  }>
): Promise<any> {
  return httpClient.put(`/users/${id}`, data);
}

