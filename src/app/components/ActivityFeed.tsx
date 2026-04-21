import { MessageCircle, Heart, Award } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: 'María García',
    action: 'alcanzó 30 días de sobriedad',
    time: 'Hace 2 horas',
    icon: Award,
    color: 'text-yellow-400',
  },
  {
    id: 2,
    user: 'Carlos Ruiz',
    action: 'publicó una reflexión',
    time: 'Hace 4 horas',
    icon: MessageCircle,
    color: 'text-blue-400',
  },
  {
    id: 3,
    user: 'Ana López',
    action: 'recibió 50 apoyos',
    time: 'Hace 6 horas',
    icon: Heart,
    color: 'text-red-400',
  },
];

export function ActivityFeed() {
  return (
    <div className="bg-[#2c2d3f] rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Actividad de la comunidad
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#3a3b4f] transition-colors"
            >
              <div className="w-10 h-10 bg-[#3a3b4f] rounded-full flex items-center justify-center">
                <Icon className={activity.color} size={18} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  {activity.action}
                </p>
                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
