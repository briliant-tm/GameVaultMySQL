'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Game, User } from '@/types'
import GameModal from './GameModal'
import styles from './LibraryClient.module.css'

const PLATFORM_OPTIONS = [
  'PC',
  'PS1', 'PS2', 'PS3', 'PS4', 'PS5',
  'Original Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series X|S',
  'NES', 'SNES', 'N64', 'GameCube', 'Wii', 'Wii U',
  'Nintendo DS', 'Nintendo 3DS', 'Nintendo Switch', 'Nintendo Switch 2',
  'iOS',
  'Android',
]

export default function LibraryClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchUser = useCallback(async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (data.success) setUser(data.data.user)
    else router.push('/landing')
  }, [router])

  const fetchGames = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterGenre) params.set('genre', filterGenre)
    if (filterPlatform) params.set('platform', filterPlatform)
    const res = await fetch(`/api/games?${params}`)
    const data = await res.json()
    if (data.success) setGames(data.data.games)
    setLoading(false)
  }, [search, filterGenre, filterPlatform])

  useEffect(() => { fetchUser() }, [fetchUser])
  useEffect(() => { fetchGames() }, [fetchGames])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/landing')
    router.refresh()
  }

  const handleDeleteGame = async (id: number) => {
    const res = await fetch(`/api/games/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setGames(games.filter(g => g.id !== id))
      setDeleteConfirm(null)
    }
  }

  const handleSaveGame = (game: Game, isNew: boolean) => {
    if (isNew) setGames([game, ...games])
    else setGames(games.map(g => g.id === game.id ? game : g))
    setModalOpen(false)
    setEditingGame(null)
  }

  const uniqueGenres = [...new Set(games.map(g => g.genre))].sort()
  const uniquePlatforms = [...new Set(games.map(g => g.platform))].sort()

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>V</span>
          <span className={styles.logoText}>Vault</span>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemActive}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
            </svg>
            Library
          </Link>
          <Link href="/account" className={styles.navItem}>
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

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>My Library</h1>
            <p className={styles.pageSubtitle}>{games.length} game{games.length !== 1 ? 's' : ''} in your collection</p>
          </div>
          <button className={styles.btnAdd} onClick={() => { setEditingGame(null); setModalOpen(true) }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Game
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search games..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.filterSelect} value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
            <option value="">All genres</option>
            {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className={styles.filterSelect} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="">All platforms</option>
            {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Games grid */}
        {loading ? (
          <div className={styles.loadingState}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : games.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 14h12M10 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 4l-3 4M19 4l3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>{search || filterGenre || filterPlatform ? 'No games found' : 'Your library is empty'}</h3>
            <p>{search || filterGenre || filterPlatform ? 'Try different filters.' : 'Add your first game to get started.'}</p>
            {!search && !filterGenre && !filterPlatform && (
              <button className={styles.btnAdd} onClick={() => setModalOpen(true)} style={{ marginTop: 12 }}>
                Add your first game
              </button>
            )}
          </div>
        ) : (
          <div className={styles.gamesGrid}>
            {games.map((game, i) => (
              <div key={game.id} className={styles.gameCard} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={styles.gameCover}>
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className={styles.coverImg} />
                  ) : (
                    <div className={styles.coverPlaceholder}>
                      <span>{game.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className={styles.gameActions}>
                    <button className={styles.actionBtn} onClick={() => { setEditingGame(game); setModalOpen(true) }}
                      title="Edit">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M1 12l3-1 7-7-2-2-7 7-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        <path d="M8.5 2.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => setDeleteConfirm(game.id)} title="Delete">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 4h9M5 4V2.5h3V4M5.5 6.5v3M7.5 6.5v3M3 4l.5 7.5h6L10 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={styles.gameInfo}>
                  <div className={styles.gameTitle}>{game.title}</div>
                  <div className={styles.gameMeta}>
                    <span className={styles.gameTag}>{game.genre}</span>
                    <span className={styles.gamePlatform}>{game.platform}</span>
                  </div>
                  {game.notes && <p className={styles.gameNotes}>{game.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Game Modal */}
      {modalOpen && (
        <GameModal
          game={editingGame}
          platformOptions={PLATFORM_OPTIONS}
          onClose={() => { setModalOpen(false); setEditingGame(null) }}
          onSave={handleSaveGame}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Remove game?</h3>
            <p>This will permanently remove the game from your library.</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.btnDanger} onClick={() => handleDeleteGame(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
