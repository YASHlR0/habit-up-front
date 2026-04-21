import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Flame, Trophy, Users, Heart, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { getUserProfile } from '@/lib/api/userApi';
import { getCommunityPosts } from '@/lib/api/communityApi';
import { httpClient } from '@/lib/api/httpClient';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { profileImage, user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'estadisticas'>('publicaciones');

  const userId = useMemo(() => Number(id), [id]);
  const isOwnProfile = !!user?.id && userId === user.id;

  const [profile, setProfile] = useState<{
    fullName: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    postsCount?: number;
    achievementsCount?: number;
    habitsCount?: number;
    daysClean?: number;
    currentStreak?: number;
  } | null>(null);
  const [posts, setPosts] = useState<Array<{ id: number; content: string; likes: number; createdAt: string }>>([]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!userId || Number.isNaN(userId)) return;
      try {
        const p = await getUserProfile(userId);
        const dashboard = await httpClient.get<{
          daysClean?: number;
          habits?: Array<{ currentStreak?: number }>;
        }>(`/dashboard/${userId}`);
        const allPosts = await getCommunityPosts();
        if (!mounted) return;

        const habits = Array.isArray(dashboard?.habits) ? dashboard.habits : [];
        const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.currentStreak ?? 0), 0);
        setProfile({
          fullName: p.fullName,
          bio: p.bio ?? '',
          avatarUrl: p.avatarUrl ?? '',
          location: p.location ?? '',
          postsCount: p.postsCount ?? 0,
          achievementsCount: p.achievementsCount ?? 0,
          habitsCount: p.habitsCount ?? 0,
          daysClean: Number(dashboard?.daysClean ?? 0),
          currentStreak: maxStreak,
        });
        setPosts(
          (allPosts ?? [])
            .filter((x) => x.userId === userId)
            .map((x) => ({ id: x.id, content: x.content, likes: x.likes ?? 0, createdAt: x.createdAt }))
        );
      } catch (e) {
        console.error('No se pudo cargar el perfil:', e);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Botón volver */}
      <Link
        to="/comunidad"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver a la comunidad</span>
      </Link>

      {/* Header del perfil */}
      <div className="bg-[#2c2d3f] rounded-xl p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {(isOwnProfile ? (profileImage ?? user?.avatarUrl) : profile?.avatarUrl) ? (
              <img
                src={(isOwnProfile ? (profileImage ?? user?.avatarUrl) : profile?.avatarUrl) as string}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {initialsFromName(isOwnProfile ? (user?.fullName ?? 'Usuario') : (profile?.fullName ?? 'Usuario'))}
              </span>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-3xl font-bold text-white">{profile?.fullName ?? 'Usuario'}</h1>
                <p className="text-gray-400">ID #{userId}</p>
              </div>
              {!isOwnProfile && (
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={
                    isFollowing
                      ? 'bg-[#3a3b4f] hover:bg-[#464759] text-white'
                      : 'bg-cyan-400 hover:bg-cyan-500 text-black'
                  }
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              )}
            </div>

            <p className="text-gray-300 mb-4">{profile?.bio ?? ''}</p>

            {/* Estadísticas */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="text-white font-semibold">{profile?.postsCount ?? posts.length}</span>
                <span className="text-gray-400 text-sm ml-1">publicaciones</span>
              </div>
              <div>
                <span className="text-white font-semibold">—</span>
                <span className="text-gray-400 text-sm ml-1">seguidores</span>
              </div>
              <div>
                <span className="text-white font-semibold">—</span>
                <span className="text-gray-400 text-sm ml-1">siguiendo</span>
              </div>
            </div>

            {/* Datos de sobriedad */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#3a3b4f] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="text-cyan-400" size={16} />
                  <span className="text-gray-400 text-sm">Días transcurridos</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-white font-bold text-2xl">{profile?.daysClean ?? 0}</p>
                </div>
              </div>
              <div className="bg-[#3a3b4f] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="text-green-400" size={16} />
                  <span className="text-gray-400 text-sm">Racha</span>
                </div>
                <p className="text-white font-semibold text-sm">{profile?.currentStreak ?? 0} días</p>
              </div>
              <div className="bg-[#3a3b4f] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-gray-400 text-sm">Logros</span>
                </div>
                <p className="text-white font-bold text-xl">{profile?.achievementsCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#2c2d3f] rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('publicaciones')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'publicaciones'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Publicaciones
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'estadisticas'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Estadísticas
          </button>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          {activeTab === 'publicaciones' ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#3a3b4f] rounded-lg p-4">
                  <p className="text-gray-300 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>—</span>
                    </div>
                    <span className="ml-auto">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-ES') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#3a3b4f] rounded-lg p-4 text-gray-300 text-sm">
              Estadísticas detalladas no disponibles con el backend actual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
