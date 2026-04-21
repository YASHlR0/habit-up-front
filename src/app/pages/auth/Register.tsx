import { useState } from 'react';
import { Flame, ArrowLeft, Zap, Users, Trophy, Target, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const success = await register(email, password, nombre);
      if (success) {
        // Esperar un tick para asegurar que el estado se actualice
        setTimeout(() => {
          navigate('/onboarding/categoria');
        }, 0);
      } else {
        setError('Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Sección Landing - Izquierda */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo Grande */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Flame className="text-white" size={48} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white">Habit Up</h1>
              <p className="text-cyan-400 text-lg font-semibold">Tu compañero de sobriedad</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <p className="text-gray-300 text-lg leading-relaxed">
              Habit Up es tu compañero digital en el camino hacia la recuperación y transformación personal. Diseñado con amor para apoyarte cada día.
            </p>
            <p className="text-gray-400 text-base">
              Únete a miles de personas que están transformando sus vidas, rompiendo patrones negativos y construyendo un futuro mejor.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Rastreo Diario</h3>
                <p className="text-gray-400 text-sm">Monitorea tu progreso en tiempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Comunidad</h3>
                <p className="text-gray-400 text-sm">Conéctate con otros en recuperación</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Logros</h3>
                <p className="text-gray-400 text-sm">Celebra cada hito en tu recuperación</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Metas Personales</h3>
                <p className="text-gray-400 text-sm">Define y alcanza tus objetivos</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-[#2c2d3f] rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-cyan-400">4,877</p>
              <p className="text-gray-400 text-xs mt-1">Usuarios activos</p>
            </div>
            <div className="bg-[#2c2d3f] rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-cyan-400">98%</p>
              <p className="text-gray-400 text-xs mt-1">Satisfacción</p>
            </div>
            <div className="bg-[#2c2d3f] rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-cyan-400">∞</p>
              <p className="text-gray-400 text-xs mt-1">Apoyo 24/7</p>
            </div>
          </div>
        </div>

        {/* Formulario - Derecha */}
        <div className="lg:bg-[#2c2d3f] lg:rounded-2xl lg:p-8 lg:border lg:border-gray-700">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="self-start lg:hidden text-white hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="lg:hidden flex items-center gap-2 bg-cyan-400/10 px-6 py-3 rounded-xl border-2 border-cyan-400">
                <Flame className="text-cyan-400" size={48} />
                <div className="text-left">
                  <div className="text-5xl font-black text-cyan-400 tracking-tight">HU</div>
                  <div className="text-xs text-cyan-300 font-semibold">Habit Up</div>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
            </div>

            {/* Formulario */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-white font-semibold mb-2">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1b2e] lg:bg-[#3a3b4f] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1b2e] lg:bg-[#3a3b4f] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-white font-semibold mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-[#1a1b2e] lg:bg-[#3a3b4f] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-[#1a1b2e] lg:bg-[#3a3b4f] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-6 text-lg font-semibold rounded-full mt-4"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
