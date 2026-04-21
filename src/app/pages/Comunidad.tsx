import { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Plus, Users as UsersIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { addCommunityComment, createCommunityPost, getCommunityPosts, getPostComments, getUserPosts, likeCommunityPost } from '@/lib/api/communityApi';
import { useProgressStore } from '@/lib/progressStore';

interface Comment {
  id: number;
  userId?: number;
  user: string;
  username: string;
  avatar: string;
  content: string;
  time: string;
}

const LOCAL_COMMENTS_KEY = 'habit-up-community-local-comments';
const LOCAL_POSTS_KEY = 'habit-up-community-local-posts';

interface Post {
  id: number;
  userId: number;
  user: string;
  username: string;
  avatar: string;
  avatarUrl?: string | null;
  date: string;
  category: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapBackendCommentToUi(comment: {
  id: number;
  userId: number;
  user?: string;
  username?: string;
  avatar?: string;
  content: string;
  createdAt: string;
}): Comment {
  const displayName = comment.user || comment.username || 'Usuario';
  return {
    id: comment.id,
    userId: comment.userId,
    user: displayName,
    username: (comment.username || displayName).toLowerCase().replace(/\s+/g, ''),
    avatar: comment.avatar ? String(comment.avatar) : initialsFromName(displayName),
    content: comment.content,
    time: new Date(comment.createdAt).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

function readLocalComments(): Record<number, Comment[]> {
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, Comment[]>;
  } catch {
    return {};
  }
}

function writeLocalComments(data: Record<number, Comment[]>) {
  try {
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(data));
  } catch {
    // Ignoramos errores de almacenamiento para no romper la UI
  }
}

function readLocalPosts(): Post[] {
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Post[];
  } catch {
    return [];
  }
}

function writeLocalPosts(data: Post[]) {
  try {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(data));
  } catch {
    // Ignoramos errores de almacenamiento para no romper la UI
  }
}

function mergeComments(backendComments: Comment[], cachedComments: Comment[]): Comment[] {
  const bySignature = new Map<string, Comment>();
  const all = [...backendComments, ...cachedComments];
  for (const c of all) {
    const signature = `${c.userId ?? 'x'}|${c.content}|${c.time}`;
    if (!bySignature.has(signature)) {
      bySignature.set(signature, c);
    }
  }
  return Array.from(bySignature.values());
}

export function Comunidad() {
  const user = useAuthStore((s) => s.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const { actualizarParticipacionComunitaria } = useProgressStore();
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [commentStatus, setCommentStatus] = useState<{ [key: number]: 'idle' | 'sending' | 'ok' | 'error' }>({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  const categoriaDefault = useMemo(() => 'General', []);

  const updatePosts = (updater: (prev: Post[]) => Post[]) => {
    setPosts((prev) => {
      const next = updater(prev);
      writeLocalPosts(next);
      return next;
    });
  };

  const countCommunityParticipation = (items: Post[], currentUserId?: number) => {
    if (!currentUserId) return 0;
    const postsCount = items.filter((post) => post.userId === currentUserId).length;
    const commentsCount = items.reduce((acc, post) => {
      const ownComments = post.comments.filter((comment) => comment.userId === currentUserId).length;
      return acc + ownComments;
    }, 0);
    return postsCount + commentsCount;
  };

  useEffect(() => {
    const cachedPosts = readLocalPosts();
    if (cachedPosts.length > 0) {
      setPosts(cachedPosts);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await getCommunityPosts();
        if (!mounted) return;

        // Cargar posts con sus comentarios del backend
        const postsWithComments = await Promise.all(
          (data ?? []).map(async (p) => {
            const name = p.username ?? 'Usuario';
            const created = p.createdAt ? new Date(p.createdAt) : new Date();
            
            // Obtener comentarios de este post
            try {
              const comments = await getPostComments(p.id);
              const backendMapped = (comments ?? []).map(mapBackendCommentToUi);
              const cachedByPost = readLocalComments();
              const cached = cachedByPost[p.id] ?? [];
              return {
                id: p.id,
                userId: p.userId,
                user: name,
                username: name.toLowerCase().replace(/\s+/g, ''),
                avatar: p.userAvatar ? String(p.userAvatar) : initialsFromName(name),
                avatarUrl: p.userAvatar ?? null,
                date: created.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                category: categoriaDefault,
                content: p.content,
                likes: p.likes ?? 0,
                liked: false,
                comments: mergeComments(backendMapped, cached),
              };
            } catch (commentError) {
              console.error(`Error cargando comentarios del post ${p.id}:`, commentError);
              const cachedByPost = readLocalComments();
              const cached = cachedByPost[p.id] ?? [];
              // Si falla la carga de comentarios, dejamos el array vacío
              return {
                id: p.id,
                userId: p.userId,
                user: name,
                username: name.toLowerCase().replace(/\s+/g, ''),
                avatar: p.userAvatar ? String(p.userAvatar) : initialsFromName(name),
                avatarUrl: p.userAvatar ?? null,
                date: created.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                category: categoriaDefault,
                content: p.content,
                likes: p.likes ?? 0,
                liked: false,
                comments: cached,
              };
            }
          })
        );

        setPosts(postsWithComments);
        writeLocalPosts(postsWithComments);
      } catch (e) {
        console.error('No se pudieron cargar los posts:', e);
        const cachedPosts = readLocalPosts();
        if (mounted && cachedPosts.length > 0) {
          setPosts(cachedPosts);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [categoriaDefault]);

  // Sincroniza la meta de participación con publicaciones + comentarios propios
  useEffect(() => {
    if (!user?.id) return;
    const participationCount = countCommunityParticipation(posts, user.id);
    actualizarParticipacionComunitaria(participationCount);
  }, [posts, user?.id, actualizarParticipacionComunitaria]);

  const handleLike = (postId: number) => {
    // En backend el like solo suma (no hay "unlike"), así que evitamos doble like desde la UI.
    const target = posts.find((p) => p.id === postId);
    if (!target || target.liked) return;

    updatePosts((prev) => prev.map((p) => (p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p)));

    void (async () => {
      try {
        const updated = await likeCommunityPost(postId);
        updatePosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: updated.likes ?? p.likes, liked: true } : p))
        );
      } catch (e) {
        console.error('No se pudo dar like:', e);
        // rollback
        updatePosts((prev) => prev.map((p) => (p.id === postId ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) } : p)));
      }
    })();
  };

  const handleAddComment = (postId: number) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;
    if (!user?.id) return;

    const newComment: Comment = {
      id: Date.now(), // ID temporal hasta que el backend responda con el ID real
      userId: user.id,
      user: user.fullName || 'Usuario',
      username: (user.fullName || 'Usuario').toLowerCase().replace(/\s+/g, ''),
      avatar: user.avatarUrl ? String(user.avatarUrl) : initialsFromName(user.fullName || 'Usuario'),
      content: commentText,
      time: new Date().toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    // Optimista: se muestra de inmediato aunque falle la red
    updatePosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, comments: mergeComments(post.comments, [newComment]) } : post))
    );
    const cachedByPost = readLocalComments();
    const currentPostCache = cachedByPost[postId] ?? [];
    cachedByPost[postId] = mergeComments(currentPostCache, [newComment]);
    writeLocalComments(cachedByPost);
    setNewComments((c) => ({ ...c, [postId]: '' }));

    void (async () => {
      try {
        setCommentStatus((s) => ({ ...s, [postId]: 'sending' }));
        const res = await addCommunityComment(postId, user.id, commentText);
        setCommentStatus((s) => ({ ...s, [postId]: 'ok' }));

        // Intentamos refrescar desde backend para mantener consistencia
        try {
          const refreshed = await getPostComments(postId);
          const mapped = (refreshed ?? []).map(mapBackendCommentToUi);
          updatePosts((prev) =>
            prev.map((post) => (post.id === postId ? { ...post, comments: mergeComments(mapped, cachedByPost[postId] ?? []) } : post))
          );
        } catch {
          // Si falla, nos quedamos con el comentario local cacheado
        }

        // Feedback rápido para confirmar persistencia en backend
        if (res?.message) console.log(res.message);
      } catch (e) {
        console.error('No se pudo publicar el comentario:', e);
        setCommentStatus((s) => ({ ...s, [postId]: 'error' }));
      }
    })();
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    if (!user?.id) return;

    const content = newPostContent.trim();
    setNewPostContent('');
    setShowNewPostForm(false);

    const tempId = Date.now();
    const tempPost: Post = {
      id: tempId,
      userId: user.id,
      user: user.fullName ?? 'Yo',
      username: (user.fullName ?? 'yo').toLowerCase().replace(/\s+/g, ''),
      avatar: initialsFromName(user.fullName ?? 'Yo'),
      avatarUrl: user.avatarUrl ?? null,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: categoriaDefault,
      content,
      likes: 0,
      liked: false,
      comments: [],
    };
    updatePosts((prev) => [tempPost, ...prev]);

    void (async () => {
      try {
        const created = await createCommunityPost(user.id, content);
        const createdAt = created.createdAt ? new Date(created.createdAt) : new Date();
        const createdPost: Post = {
          id: created.id,
          userId: user.id,
          user: user.fullName ?? 'Yo',
          username: (user.fullName ?? 'yo').toLowerCase().replace(/\s+/g, ''),
          avatar: initialsFromName(user.fullName ?? 'Yo'),
          avatarUrl: user.avatarUrl ?? null,
          date: createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: categoriaDefault,
          content: created.content,
          likes: created.likes ?? 0,
          liked: false,
          comments: [],
        };

        updatePosts((prev) => prev.map((p) => (p.id === tempId ? createdPost : p)));
      } catch (e) {
        console.error('No se pudo crear el post:', e);
      }
    })();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        {/* Formulario de nueva publicación */}
        {showNewPostForm && (
          <div className="bg-[#2c2d3f] rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Nueva publicación</h3>
            <textarea
              placeholder="Comparte tu experiencia..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-[#3a3b4f] text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => setShowNewPostForm(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePost}
                className="bg-cyan-400 hover:bg-cyan-500 text-black"
              >
                Publicar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Posts */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-[#2c2d3f] rounded-xl p-6 text-gray-400 text-sm">
              Cargando publicaciones...
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-[#2c2d3f] rounded-xl p-6">
              {/* Header del post */}
              <div className="flex items-start gap-3 mb-4">
                <Link to={`/perfil/${post.userId}`} className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer overflow-hidden">
                    {post.avatarUrl ? (
                      <img src={post.avatarUrl} alt={post.user} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-semibold">{post.avatar}</span>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <Link to={`/perfil/${post.userId}`} className="hover:text-cyan-400 transition-colors">
                    <h3 className="text-white font-semibold">{post.user}</h3>
                  </Link>
                  <p className="text-gray-500 text-sm">{post.date}</p>
                </div>
              </div>

                  {/* Categoría */}
                  <div className="mb-3">
                    <span className="text-gray-400 text-sm">{post.category}</span>
                  </div>

                  {/* Contenido */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.content}</p>

                  {/* Acciones */}
                  <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Heart
                        size={20}
                        className={post.liked ? 'fill-red-400 text-red-400' : ''}
                      />
                      <span className="text-sm">{post.likes > 0 ? post.likes : ''}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm">{post.comments.length > 0 ? post.comments.length : ''}</span>
                    </button>
                  </div>

                  {/* Comentarios */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-[#3a3b4f] rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-cyan-300 text-xs font-semibold">{comment.user}</span>
                            <span className="text-gray-500 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Añadir comentario */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Añadir un comentario..."
                      value={newComments[post.id] || ''}
                      onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 bg-[#3a3b4f] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <Button
                      onClick={() => handleAddComment(post.id)}
                      size="sm"
                      className="bg-cyan-400 hover:bg-cyan-500 text-black"
                      disabled={commentStatus[post.id] === 'sending'}
                    >
                      {commentStatus[post.id] === 'sending' ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                  {commentStatus[post.id] === 'ok' && (
                    <div className="text-green-400 text-xs mt-2">Comentario enviado al servidor.</div>
                  )}
                  {commentStatus[post.id] === 'error' && (
                    <div className="text-red-400 text-xs mt-2">
                      No se pudo enviar. Revisá que tu backend esté corriendo y mirá la pestaña Network/Console.
                    </div>
                  )}
            </div>
          ))}
        </div>

        {/* Botón flotante para crear post */}
        {!showNewPostForm && (
          <button
            onClick={() => setShowNewPostForm(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-cyan-400 hover:bg-cyan-500 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <Plus size={24} className="text-black" />
          </button>
        )}
      </div>
    </div>
  );
}