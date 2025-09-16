'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Auth context type definitions
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { full_name?: string }) => Promise<{ error: AuthError | null }>
  updateEmail: (email: string) => Promise<{ error: AuthError | null }>
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle sign in
        if (event === 'SIGNED_IN' && session?.user) {
          // Create or update user profile
          await createUserProfile(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Create user profile in profiles table
  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error creating/updating profile:', error)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    return { error }
  }

  // Sign out
  const signOut = async () => {
    try {
      // Clear local state first to prevent UI issues
      setSession(null)
      setUser(null)

      // Clear Supabase session from localStorage
      if (typeof window !== 'undefined') {
        try {
          // Clear all Supabase auth-related keys from localStorage
          const keys = Object.keys(window.localStorage)
          keys.forEach(key => {
            if (key.startsWith('supabase.auth.')) {
              window.localStorage.removeItem(key)
            }
          })
        } catch (error) {
          console.error('Error clearing localStorage:', error)
        }
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        // Even if Supabase sign out fails, local state and storage are already cleared
        // This ensures the user is logged out from the app perspective
      }

      return { error }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      // Local state and storage are already cleared above, so user is effectively logged out
      return { error: error as AuthError }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  // Update user profile
  const updateProfile = async (updates: { full_name?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Update user email
  const updateEmail = async (email: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } as AuthError };
    }

    if (email === user.email) {
      return { error: { message: 'New email is the same as current email' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateEmail,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}
