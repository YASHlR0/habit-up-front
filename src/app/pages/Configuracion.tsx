import { useEffect, useState } from 'react';
import { User, Bell, Lock, HelpCircle, AlertTriangle, Mail, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useAuthStore } from '@/lib/authStore';
import { updateUserProfile } from '@/lib/api/userApi';
import { getHabitsByUser, updateHabit } from '@/lib/api/habitsApi';

type Section = 'perfil' | 'peligro';

export function Configuracion() {
  const [activeSection, setActiveSection] = useState<Section>('perfil');
  const { profileImage, setProfileImage, user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [habitId, setHabitId] = useState<number | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('');
  const [habitExpense, setHabitExpense] = useState<string>('0');
  const [settings, setSettings] = useState<{
    notifNuevosSeguidores: boolean;
    notifComentarios: boolean;
    notifMensiones: boolean;
    notifLogros: boolean;
    notifEmail: boolean;
    notifPush: boolean;
    perfilPublico: boolean;
    mostrarEstadisticas: boolean;
    permitirMensajes: boolean;
    mostrarActividad: boolean;
  }>({
    // Notificaciones
    notifNuevosSeguidores: true,
    notifComentarios: true,
    notifMensiones: true,
    notifLogros: true,
    notifEmail: false,
    notifPush: true,
    // Privacidad
    perfilPublico: true,
    mostrarEstadisticas: true,
    permitirMensajes: true,
    mostrarActividad: false,
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings({ ...settings, [key]: value });
  };

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setBio(user?.bio ?? '');
  }, [user?.fullName, user?.bio]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user?.id) return;
      try {
        const habits = await getHabitsByUser(user.id);
        if (!mounted) return;
        if (habits.length > 0) {
          const main = habits[0];
          setHabitId(main.id);
          setHabitName(main.name ?? '');
          setHabitCategory(main.category ?? '');
          setHabitExpense(String(main.dailyExpense ?? 0));
        } else {
          setHabitId(null);
          setHabitName('');
          setHabitCategory('');
          setHabitExpense('0');
        }
      } catch (e) {
        console.error('No se pudieron cargar hábitos en configuración:', e);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const sections = [
    { id: 'perfil', label: 'Mi Perfil', icon: User },
    { id: 'peligro', label: 'Zona Peligrosa', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-gray-400">Personaliza tu experiencia en Habit Up</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menú lateral */}
        <div className="lg:col-span-1">
          <div className="bg-[#2c2d3f] rounded-xl p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as Section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-cyan-400 text-black'
                      : 'text-gray-300 hover:bg-[#3a3b4f] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <div className="lg:col-span-3">
          <div className="bg-[#2c2d3f] rounded-xl p-6">
            {/* PERFIL */}
            {activeSection === 'perfil' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Mi Perfil</h2>
                  <p className="text-gray-400 mb-6">Actualiza tu información personal</p>
                </div>

                {/* Avatar/Foto de perfil */}
                <div>
                  <Label className="text-white mb-4 block">Foto de perfil</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-28 h-28 rounded-full border-2 border-cyan-400 overflow-hidden flex-shrink-0">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">AL</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 flex-1">
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        onClick={() => document.getElementById('profile-image')?.click()}
                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Seleccionar foto
                      </button>
                      <p className="text-gray-400 text-xs">JPG, PNG, GIF o WebP (máx. 5MB)</p>
                      {profileImage && (
                        <Button 
                          variant="outline" 
                          className="w-full text-white border-gray-600 hover:bg-[#1a1b2e]"
                          onClick={() => setProfileImage(null)}
                        >
                          Eliminar foto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nombre de usuario */}
                <div>
                  <Label className="text-white mb-2">Nombre completo</Label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-white mb-2">Correo electrónico</Label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-white mb-2">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 min-h-[80px] resize-none"
                  />
                </div>

                {/* Hábito principal */}
                <div className="pt-4 border-t border-gray-700 space-y-4">
                  <h3 className="text-white font-semibold">Hábito principal</h3>
                  <div>
                    <Label className="text-white mb-2">Nombre del hábito</Label>
                    <input
                      type="text"
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2">Categoría</Label>
                    <input
                      type="text"
                      value={habitCategory}
                      onChange={(e) => setHabitCategory(e.target.value)}
                      className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2">Gasto diario</Label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={habitExpense}
                      onChange={(e) => setHabitExpense(e.target.value)}
                      className="w-full bg-[#1a1b2e] border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  {!habitId && (
                    <p className="text-gray-400 text-sm">No hay hábito creado todavía. Completa onboarding para crearlo.</p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-black"
                    onClick={async () => {
                      if (!user?.id) return;
                      try {
                        const updatedUser = await updateUserProfile(user.id, {
                          fullName,
                          bio,
                          avatarUrl: profileImage ?? user.avatarUrl ?? '',
                        });
                        if (habitId) {
                          await updateHabit(habitId, {
                            name: habitName,
                            category: habitCategory,
                            dailyExpense: Number(habitExpense || 0),
                          });
                        }
                        // Guardamos lo que devuelve el backend en el store
                        setUser({ ...user, ...updatedUser });
                      } catch (e) {
                        console.error('No se pudieron guardar cambios en backend:', e);
                      }
                    }}
                  >
                    Guardar cambios
                  </Button>
                  <Button variant="outline" className="text-white">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}




            {/* ZONA PELIGROSA */}
            {activeSection === 'peligro' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Zona Peligrosa</h2>
                  <p className="text-gray-400 mb-6">Acciones irreversibles. Procede con cuidado.</p>
                </div>

                <div className="space-y-4">
                  {/* Reset Stats */}
                  <div className="p-4 bg-[#1a1b2e] border border-red-500 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium mb-1">Reiniciar estadísticas</h3>
                        <p className="text-gray-400 text-sm">Esto no se puede deshacer. Borraré todos tus datos de progreso.</p>
                      </div>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Reiniciar
                      </Button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 bg-[#1a1b2e] border border-red-500 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium mb-1">Eliminar cuenta</h3>
                        <p className="text-gray-400 text-sm">Esta acción es permanente. Se eliminarán todos tus datos.</p>
                      </div>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
