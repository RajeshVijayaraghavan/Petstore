import { create } from 'zustand'

interface AuthSession {
  username: string
  token: string
  expiresAt: string
  isAdmin: boolean
}

interface AuthState {
  session: AuthSession | null
  sidebarOpen: boolean
  filterPreferences: {
    petStatus: 'available' | 'pending' | 'sold'
  }
  token: string | null

  login: (session: AuthSession) => void
  logout: () => void
  toggleSidebar: () => void
  setPetStatusFilter: (status: 'available' | 'pending' | 'sold') => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  sidebarOpen: true,
  filterPreferences: {
    petStatus: 'available',
  },
  token: null,

  login: (session) =>
    set({
      session,
      token: session.token,
    }),

  logout: () =>
    set({
      session: null,
      token: null,
    }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setPetStatusFilter: (status) =>
    set((state) => ({
      filterPreferences: { ...state.filterPreferences, petStatus: status },
    })),
}))
