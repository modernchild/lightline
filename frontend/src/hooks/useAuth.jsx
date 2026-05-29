import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)
const WELCOME_KEY = 'll_show_welcome'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ll_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem('ll_token'))
      .finally(() => setLoading(false))
  }, [])

  const finishAuth = useCallback((token, nextUser) => {
    localStorage.setItem('ll_token', token)
    sessionStorage.setItem(WELCOME_KEY, '1')
    setUser(nextUser)
    return nextUser
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const { token, user: u } = await authApi.login({ email, password })
    return finishAuth(token, u)
  }, [finishAuth])

  const register = useCallback(async ({ name, email, password }) => {
    const { token, user: u } = await authApi.register({ name, email, password })
    return finishAuth(token, u)
  }, [finishAuth])

  const loginWithGoogle = useCallback(async (credential) => {
    const { token, user: u } = await authApi.google({ credential })
    return finishAuth(token, u)
  }, [finishAuth])

  const forgotPassword = useCallback((email) => authApi.forgotPassword({ email }), [])

  const resetPassword = useCallback(({ token, password }) =>
    authApi.resetPassword({ token, password }), [])

  const logout = useCallback(() => {
    localStorage.removeItem('ll_token')
    sessionStorage.removeItem(WELCOME_KEY)
    setUser(null)
  }, [])

  const consumeWelcome = useCallback(() => {
    const show = sessionStorage.getItem(WELCOME_KEY) === '1'
    if (show) sessionStorage.removeItem(WELCOME_KEY)
    return show
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      forgotPassword,
      resetPassword,
      logout,
      consumeWelcome,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
