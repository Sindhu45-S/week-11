'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import styles from './Auth.module.css'

type Props = {
  type: 'login' | 'signup'
}

export default function Auth({ type }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    if (type === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return alert(error.message)
      alert('Signup successful! Now login.')
      router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return alert(error.message)
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>💬 SupaChat</h1>
        <p className={styles.tagline}>
          Connect instantly with realtime messaging
        </p>

        <h2>{type === 'login' ? 'Welcome back' : 'Create account'}</h2>

        <input
          className={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className={styles.primaryBtn} onClick={handleAuth}>
          {type === 'login' ? 'Login' : 'Signup'}
        </button>

        <div className={styles.switch}>
          {type === 'login' ? (
            <span onClick={() => router.push('/signup')}>
              No account? <b>Create one</b>
            </span>
          ) : (
            <span onClick={() => router.push('/')}>
              Already have an account? <b>Login</b>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
