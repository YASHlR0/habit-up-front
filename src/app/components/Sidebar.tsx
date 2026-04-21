import { Home, Users, TrendingUp, Settings, Phone, Flame, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/lib/progressStore';
import { useAuthStore } from '@/lib/authStore';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nivel, diasSobrio } = useProgressStore();
  const { user, logout, profileImage } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      navigate('/');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Comunidad', path: '/comunidad' },
    { icon: TrendingUp, label: 'Mi Progreso', path: '/progreso' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <aside className="w-64 bg-[#252636] border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <Flame className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Habit Up</h1>
            <p className="text-gray-400 text-xs">Tu compañero de sobriedad</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActiveItem = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActiveItem
                      ? 'bg-cyan-400 text-black'
                      : 'text-gray-300 hover:bg-[#2c2d3f] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* SOS Button - Destacado en ROJO */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <Link
            to="/sos"
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all ${
              location.pathname === '/sos'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
            }`}
          >
            <Phone size={20} />
            <div className="flex-1">
              <span className="font-bold text-base">SOS Emergencia</span>
              <p className="text-red-100 text-xs">Necesito ayuda ahora</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to={user?.id ? `/perfil/${user.id}` : '/perfil/0'}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2c2d3f] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profileImage || user?.avatarUrl ? (
              <img 
                src={(profileImage ?? user?.avatarUrl) as string} 
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">AL</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{user?.fullName ?? 'Usuario'}</p>
            <p className="text-cyan-400 text-xs font-bold">{diasSobrio} días limpios</p>
          </div>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2c2d3f] transition-colors text-gray-300 hover:text-white w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}