'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LandingClient.module.css'

export default function LandingClient() {
  const router = useRouter()
  const [mode, setMode] = useState<'none' | 'login' | 'register'>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login state — identifier = username OR email
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regNickname, setRegNickname] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          nickname: regNickname || regUsername,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setMode('none')
    setError('')
  }

  return (
    <div className={styles.landing}>
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>V</span>
          <span className={styles.logoText}>Vault</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnGhost} onClick={() => { setMode('login'); setError('') }}>
            Sign In
          </button>
          <button className={styles.btnPrimary} onClick={() => { setMode('register'); setError('') }}>
            Get Started
          </button>
        </div>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Your Personal Game Collection</div>
          <h1 className={styles.heroTitle}>
            Every game you own,<br />
            <span className={styles.heroAccent}>in one place.</span>
          </h1>
          <p className={styles.heroDesc}>
            Track your game library across all platforms. Add titles, assign genres,
            and keep your collection organized your way.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.btnPrimary + ' ' + styles.btnLarge}
              onClick={() => { setMode('register'); setError('') }}>
              Start your library
            </button>
            <button className={styles.btnGhost + ' ' + styles.btnLarge}
              onClick={() => { setMode('login'); setError('') }}>
              I have an account
            </button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.mockCard}>
            <div className={styles.mockCover} style={{ background: 'linear-gradient(135deg, #1a1f35 0%, #2d3561 100%)' }}>
              <div className={styles.mockCoverText}>Game Cover</div>
            </div>
            <div className={styles.mockInfo}>
              <div className={styles.mockTitle}>Elden Ring</div>
              <div className={styles.mockMeta}>
                <span className={styles.mockTag}>Action RPG</span>
                <span className={styles.mockTag}>PC</span>
              </div>
            </div>
          </div>
          <div className={styles.mockCard + ' ' + styles.mockCardOffset}>
            <div className={styles.mockCover} style={{ background: 'linear-gradient(135deg, #1f1a35 0%, #3d2861 100%)' }}>
              <div className={styles.mockCoverText}>Game Cover</div>
            </div>
            <div className={styles.mockInfo}>
              <div className={styles.mockTitle}>God of War</div>
              <div className={styles.mockMeta}>
                <span className={styles.mockTag}>Action</span>
                <span className={styles.mockTag}>PS5</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {mode !== 'none' && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className={styles.modalTabs}>
              <button
                className={`${styles.modalTab} ${mode === 'login' ? styles.modalTabActive : ''}`}
                onClick={() => { setMode('login'); setError('') }}
              >Sign In</button>
              <button
                className={`${styles.modalTab} ${mode === 'register' ? styles.modalTabActive : ''}`}
                onClick={() => { setMode('register'); setError('') }}
              >Register</button>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Username or Email</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. gamer123 or you@example.com"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Sign In'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Username</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="gamer123"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nickname <span className={styles.optional}>(optional)</span></label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Display name"
                      value={regNickname}
                      onChange={e => setRegNickname(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
