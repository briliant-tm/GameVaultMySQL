'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/types'
import styles from './AccountClient.module.css'

export default function AccountClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit profile state
  const [nickname, setNickname] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUser(data.data.user)
        setNickname(data.data.user.nickname || data.data.user.username)
      } else {
        router.push('/landing')
      }
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/landing')
    router.refresh()
  }

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')
    setEditSuccess('')
    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setUser(data.data.user)
      setEditSuccess('Nickname updated!')
      setTimeout(() => setEditSuccess(''), 3000)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassLoading(true)
    setPassError('')
    setPassSuccess('')
    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPassSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPassSuccess(''), 3000)
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPassLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push('/landing')
      router.refresh()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingCenter}>
          <span className={styles.spinner} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>V</span>
          <span className={styles.logoText}>Vault</span>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/" className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
            </svg>
            Library
          </Link>
          <Link href="/account" className={`${styles.navItem} ${styles.navItemActive}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Account
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>{(user.nickname || user.username)[0].toUpperCase()}</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user.nickname || user.username}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Account</h1>
            <p className={styles.pageSubtitle}>Manage your profile and settings</p>
          </div>
        </div>

        <div className={styles.sections}>
          {/* Profile info */}
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.bigAvatar}>{(user?.nickname || user?.username || '?')[0].toUpperCase()}</div>
              <div>
                <div className={styles.profileName}>{user?.nickname || user?.username}</div>
                <div className={styles.profileSub}>@{user?.username} · {user?.email}</div>
                <div className={styles.profileDate}>
                  Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Edit nickname */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Edit Nickname</h2>
            <p className={styles.cardDesc}>This is your display name across the app.</p>
            {editError && <div className={styles.errorMsg}>{editError}</div>}
            {editSuccess && <div className={styles.successMsg}>{editSuccess}</div>}
            <form onSubmit={handleUpdateNickname} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nickname</label>
                <input
                  type="text"
                  className={styles.input}
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Your display name"
                  required
                />
              </div>
              <button type="submit" className={styles.btnSave} disabled={editLoading}>
                {editLoading ? <span className={styles.spinner} /> : 'Save Nickname'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Change Password</h2>
            <p className={styles.cardDesc}>Keep your account secure.</p>
            {passError && <div className={styles.errorMsg}>{passError}</div>}
            {passSuccess && <div className={styles.successMsg}>{passSuccess}</div>}
            <form onSubmit={handleChangePassword} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className={styles.btnSave} disabled={passLoading}>
                {passLoading ? <span className={styles.spinner} /> : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <h2 className={styles.cardTitle} style={{ color: 'var(--danger)' }}>Danger Zone</h2>
            <p className={styles.cardDesc}>
              Permanently delete your account and all game data. This cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button className={styles.btnDanger} onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
            ) : (
              <div className={styles.deleteConfirm}>
                <p className={styles.deleteWarning}>
                  Enter your password to confirm account deletion.
                </p>
                {deleteError && <div className={styles.errorMsg}>{deleteError}</div>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Your current password"
                  />
                </div>
                <div className={styles.deleteActions}>
                  <button className={styles.btnCancel} onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); setDeletePassword('') }}>
                    Cancel
                  </button>
                  <button className={styles.btnDanger} onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}>
                    {deleteLoading ? <span className={styles.spinner} /> : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
