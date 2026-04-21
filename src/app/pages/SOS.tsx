import { Shield, Heart, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';

export function SOS() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    if (!email) {
      setMessage('Por favor ingresa un correo electrónico');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Usamos window.location.href para abrir el cliente de correo del usuario
      const subject = encodeURIComponent('🆘 Necesito ayuda - Habit Up SOS');
      const body = encodeURIComponent(`Hola, soy un usuario de Habit Up y necesito apoyo en este momento.

Este es un mensaje de emergencia solicitando ayuda.

Por favor, contáctame lo antes posible.

Gracias.`);
      
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      setMessage('Abriendo tu cliente de correo para enviar el mensaje...');
    } catch (error) {
      setMessage('Error al intentar enviar el correo. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header de Emergencia */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 mb-6 shadow-2xl shadow-red-600/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Shield className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">SOS Emergencia</h1>
            <p className="text-red-100 text-lg">Contacta a tu persona de confianza</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-white font-medium">
            🛡️ Si estás en peligro inmediato, llama al <strong className="text-2xl">911</strong>
          </p>
        </div>
      </div>

      {/* Recordatorio */}
      <div className="bg-gradient-to-br from-cyan-400/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="text-cyan-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Recuerda:</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Este momento difícil pasará</li>
              <li>✓ Has llegado muy lejos, llevas <strong className="text-cyan-400">15 días sobrio</strong></li>
              <li>✓ Pedir ayuda es un signo de fortaleza</li>
              <li>✓ Un día a la vez, un momento a la vez</li>
              <li>✓ Tu contacto de confianza está aquí para apoyarte</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sección de Envío de Correo */}
      <div className="bg-[#2c2d3f] rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center">
            <Mail className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Enviar Correo de Ayuda</h2>
            <p className="text-gray-400">Contacta a alguien de confianza por correo electrónico</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-white font-semibold mb-2">
              Correo electrónico de contacto
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1b2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Error') 
                ? 'bg-red-600/20 border border-red-600 text-red-200'
                : 'bg-cyan-600/20 border border-cyan-600 text-cyan-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            onClick={handleSendEmail}
            disabled={loading || !email}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-4 text-lg font-semibold rounded-full transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Correo de Ayuda'}
          </Button>

          <p className="text-gray-400 text-sm text-center">
            Al hacer clic, se abrirá tu aplicación de correo para enviar un mensaje predefinido
          </p>
        </div>
      </div>
    </div>
  );
}