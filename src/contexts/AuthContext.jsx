import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        (async () => {
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
        })()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        const { data: userData } = await supabase.auth.getUser()
        const displayName = userData?.user?.user_metadata?.display_name || 'Petualang Baru'

        await supabase.from('profiles').insert({
          user_id: userId,
          display_name: displayName
        })

        await supabase.from('settings').insert({
          user_id: userId
        })

        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        setProfile(newProfile)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email, password, displayName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      })

      if (error) throw error

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            display_name: displayName || 'Petualang Baru'
          })

          await supabase.from('settings').insert({
            user_id: data.user.id
          })
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => fetchProfile(user?.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
