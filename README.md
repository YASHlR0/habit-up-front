# 🔥 Habit Up

App de recuperación y hábitos. Rastrea tu progreso, crea hábitos saludables y conecta con una comunidad de apoyo.

## 🚀 Inicio Rápido

```bash
pnpm install
pnpm dev
```

Abre http://localhost:5173

## 📁 Estructura

```
src/
├── app/          # Componentes y páginas
├── lib/          # Stores, APIs, utilities
├── types/        # Tipos TypeScript
└── styles/       # Estilos Tailwind
```

## 🔐 Autenticación

- Login y Registro en `/auth`
- API integrada en `src/lib/api/`
- Estado global con Zustand en `src/lib/authStore.ts`

**Requiere backend en `http://100.50.61.245:8080/api`**
  