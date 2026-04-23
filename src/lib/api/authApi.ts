/**
 * Servicio de API para autenticación
 * Conecta con tu backend
 */

import { httpClient } from './httpClient';

interface LoginResponse {
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
  token?: string;
}

interface RegisterResponse {
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
  token?: string;
}

/**
 * Realiza el login del usuario
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const data = await httpClient.post<LoginResponse>('/users/login', {
      email,
      password,
    });
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Registra un nuevo usuario
 */
export async function registerUser(
  email: string,
  password: string,
  nombre: string
): Promise<RegisterResponse> {
  try {
    // Opción 1: Usar los datos del formulario
    const payload = {
      fullName: nombre,
      email: email,
      password: password,
    };
    
    // Opción 2: Probar con datos que sabemos funcionan (descomentar para probar)
    // const payload = {
    //   password: "mi_password_seguro",
    //   fullName: "Richard Benjamin Perez", 
    //   email: "richard@ejemplo.com"
    // };
    
    console.log('=== INICIANDO REGISTRO ===');
    console.log('Datos del formulario recibidos:', {
      nombre: nombre,
      email: email, 
      passwordLength: password?.length,
      passwordDefined: !!password
    });

    console.log('Payload que se enviará:', payload);
    
    try {
      console.log('Haciendo llamada a la API...');
      // Probar diferentes endpoints comunes de registro
      let endpoint = '/users/register'; // Corregido - la URL base ya incluye /api
      
      // Si este falla, podemos probar:
      // endpoint = '/auth/register';
      // endpoint = '/register';
      // endpoint = '/api/register';
      // endpoint = '/signup';
      
      console.log(`Intentando endpoint: ${endpoint}`);
      const data = await httpClient.post<RegisterResponse>(endpoint, payload);
      console.log('Registro exitoso:', data);
      return data;
    } catch (error: any) {
      console.error('=== ERROR EN REGISTRO ===');
      console.error('Error completo:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorStatus: error.status,
        errorResponse: error.response
      });
      throw error;
    }
  } catch (error: any) {
    console.error('Error en registerUser:', error);
    throw error;
  }
}

/**
 * Cierra la sesión del usuario (solo frontend)
 */
export function logoutUser(): void {
  localStorage.clear();
}
