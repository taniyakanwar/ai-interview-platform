// AuthContext.tsx
// This file creates a "global state" for authentication
// Any component in the app can access the logged-in user and token from here

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

// This defines the shape of a User object
interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

// This defines everything our Auth Context will provide to the app
interface AuthContextType {
  user: User | null           // the logged-in user (null if not logged in)
  token: string | null        // the JWT token (null if not logged in)
  isLoading: boolean          // true while we're checking if user is logged in
  login: (token: string, user: User) => void   // call this to log in
  logout: () => void          // call this to log out
}

// ─── Create Context ───────────────────────────────────────────────────────────

// createContext creates the global "container" for our auth state
// We start with undefined and handle that below
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Auth Provider ────────────────────────────────────────────────────────────

// This component WRAPS the entire app (see main.tsx later)
// Every component inside it can access auth state
export function AuthProvider({ children }: { children: ReactNode }) {

  // user state — stores the logged-in user object or null
  const [user, setUser] = useState<User | null>(null)

  // token state — stores the JWT token or null
  const [token, setToken] = useState<string | null>(null)

  // isLoading — true while we check localStorage on first app load
  const [isLoading, setIsLoading] = useState(true)

  // ── On App Load ─────────────────────────────────────────────────────────────
  // When the app first loads, check if a token exists in localStorage
  // If it does, restore the user session automatically
  useEffect(() => {
    const savedToken = localStorage.getItem("token") // get saved token
    const savedUser = localStorage.getItem("user")   // get saved user

    if (savedToken && savedUser) {
      // If both exist, restore the session
      setToken(savedToken)
      setUser(JSON.parse(savedUser)) // convert string back to object
    }

    setIsLoading(false) // done checking, hide loading state
  }, []) // empty array = run only once when app loads

  // ── Login Function ───────────────────────────────────────────────────────────
  // Call this after a successful login or register API call
  // It saves the token and user to both state and localStorage
  const login = (newToken: string, newUser: User) => {
    setToken(newToken)           // save token in state
    setUser(newUser)             // save user in state
    localStorage.setItem("token", newToken)           // persist token
    localStorage.setItem("user", JSON.stringify(newUser)) // persist user
  }

  // ── Logout Function ──────────────────────────────────────────────────────────
  // Call this when the user clicks logout
  // It clears everything from state and localStorage
  const logout = () => {
    setToken(null)   // clear token from state
    setUser(null)    // clear user from state
    localStorage.removeItem("token") // remove from localStorage
    localStorage.removeItem("user")  // remove from localStorage
  }

  // ── Provide to App ───────────────────────────────────────────────────────────
  // Everything inside `value` is available to any component in the app
  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Custom Hook ─────────────────────────────────────────────────────────────

// This is a helper hook so components don't have to write useContext(AuthContext)
// Instead they just write: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)

  // If useAuth is used outside of AuthProvider, throw a helpful error
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}