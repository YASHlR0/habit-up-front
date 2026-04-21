import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser, logoutUser } from './api/authApi';

interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  createdAt: string;
  isPrivate?: boolean;
  notificationsEnabled?: boolean;
}

interface OnboardingData {
  completado: boolean;
  categoria?: string;
  fecha?: string;
  fechaInicio?: string;
  diasPorSemana?: number;
  diasSemanaSeleccionados?: boolean[];
  mejoras?: string[];
  importancia?: 'critica' | 'muy' | 'algo' | 'seria-bueno';
  autopercepcion?: string;
  logroEsperado?: string;
  recordatorio?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  onboardingData: OnboardingData;
  profileImage: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nombre: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setProfileImage: (dataUrl: string | null) => void;
  // Agregamos ambos nombres para evitar errores
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: (data?: Partial<OnboardingData>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingData: {
        completado: false,
      },
      profileImage: null,

      login: async (email: string, password: string) => {
        try {
          const response = await loginUser(email, password);
          set({
            user: { ...response },
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      register: async (email: string, password: string, nombre: string) => {
        try {
          const response = await registerUser(email, password, nombre);
          set({
            user: { ...response },
            isAuthenticated: true,
            onboardingData: { completado: false },
          });
          return true;
        } catch (error) {
          console.error('Register failed:', error);
          return false;
        }
      },

      logout: () => {
        logoutUser();
        set({
          user: null,
          isAuthenticated: false,
          onboardingData: { completado: false },
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setProfileImage: (dataUrl: string | null) => {
        set((state) => ({
          profileImage: dataUrl,
          user: state.user ? { ...state.user, avatarUrl: dataUrl ?? state.user.avatarUrl } : state.user,
        }));
      },

      // Esta es la que está buscando tu componente OnboardingRecordatorio.tsx
      updateOnboarding: (data: Partial<OnboardingData>) => {
        set((state) => ({
          onboardingData: {
            ...state.onboardingData,
            ...data,
          },
        }));
      },

      // Dejamos esta por si otros componentes la usan
      completeOnboarding: (data?: Partial<OnboardingData>) => {
        set((state) => ({
          onboardingData: {
            ...state.onboardingData,
            ...(data || {}),
            completado: true,
          },
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);