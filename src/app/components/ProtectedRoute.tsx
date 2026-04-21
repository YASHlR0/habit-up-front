import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';

export function ProtectedRoute() {
  const authStore = useAuthStore();
  const { isAuthenticated, onboardingData } = authStore;
  const location = useLocation();
  
  console.log('🔐 ProtectedRoute - Verificando acceso:', {
    isAuthenticated,
    onboardingCompleted: onboardingData.completado,
    currentPath: location.pathname,
  });

  // Si no está autenticado, redirigir a welcome
  if (!isAuthenticated) {
    console.log('❌ No autenticado - Redirigiendo a welcome');
    return <Navigate to="/" replace />;
  }

  // Si está en una ruta de onboarding, permitir acceso sin importar si está completado
  const isOnboardingRoute = location.pathname.startsWith('/onboarding/');
  if (isOnboardingRoute) {
    console.log('✅ En ruta de onboarding - Permitiendo acceso');
    return <Outlet />;
  }

  // Si está autenticado pero no completó onboarding y accede a contenido protegido, redirigir a categoria
  if (!onboardingData.completado) {
    console.log('⏳ Onboarding no completado - Redirigiendo a categoria');
    return <Navigate to="/onboarding/categoria" replace />;
  }

  // Si está autenticado y completó onboarding, mostrar contenido protegido
  console.log('✅ Acceso permitido - Mostrando contenido protegido');
  return <Outlet />;
}
