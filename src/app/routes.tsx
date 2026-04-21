import { createBrowserRouter } from 'react-router-dom';
import { Root } from './Root';
import { Dashboard } from './pages/Dashboard';
import { Comunidad } from './pages/Comunidad';
import { UserProfile } from './pages/UserProfile';
import { MiProgreso } from './pages/MiProgreso';
import { Configuracion } from './pages/Configuracion';
import { SOS } from './pages/SOS';

// Auth
import { Welcome } from './pages/onboarding/Welcome';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Onboarding
import { OnboardingCategoria } from './pages/onboarding/OnboardingCategoria';
import { OnboardingFecha } from './pages/onboarding/OnboardingFecha';
import { OnboardingDiasSemana } from './pages/onboarding/OnboardingDiasSemana';
import { OnboardingMejoras } from './pages/onboarding/OnboardingMejoras';
import { OnboardingImportancia } from './pages/onboarding/OnboardingImportancia';
import { OnboardingAutopercepcion } from './pages/onboarding/OnboardingAutopercepcion';
import { OnboardingLogros } from './pages/onboarding/OnboardingLogros';
import { OnboardingRecordatorio } from './pages/onboarding/OnboardingRecordatorio';

// Componente de ruta protegida
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  // Rutas públicas (solo auth)
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  
  // Rutas protegidas (autenticación requerida)
  {
    element: <ProtectedRoute />,
    children: [
      // Onboarding (después de registro)
      {
        path: '/onboarding/categoria',
        element: <OnboardingCategoria />,
      },
      {
        path: '/onboarding/fecha',
        element: <OnboardingFecha />,
      },
      {
        path: '/onboarding/dias-semana',
        element: <OnboardingDiasSemana />,
      },
      {
        path: '/onboarding/mejoras',
        element: <OnboardingMejoras />,
      },
      {
        path: '/onboarding/importancia',
        element: <OnboardingImportancia />,
      },
      {
        path: '/onboarding/autopercepcion',
        element: <OnboardingAutopercepcion />,
      },
      {
        path: '/onboarding/logros',
        element: <OnboardingLogros />,
      },
      {
        path: '/onboarding/recordatorio',
        element: <OnboardingRecordatorio />,
      },

      // Dashboard con sidebar
      {
        path: '/dashboard',
        Component: Root,
        children: [
          { index: true, Component: Dashboard },
        ],
      },
      {
        path: '/comunidad',
        Component: Root,
        children: [
          { index: true, Component: Comunidad },
        ],
      },
      {
        path: '/perfil/:id',
        Component: Root,
        children: [
          { index: true, Component: UserProfile },
        ],
      },
      {
        path: '/progreso',
        Component: Root,
        children: [
          { index: true, Component: MiProgreso },
        ],
      },
      {
        path: '/configuracion',
        Component: Root,
        children: [
          { index: true, Component: Configuracion },
        ],
      },
      {
        path: '/sos',
        Component: Root,
        children: [
          { index: true, Component: SOS },
        ],
      },
    ],
  },
]);
