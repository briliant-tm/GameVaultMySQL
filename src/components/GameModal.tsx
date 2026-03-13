'use client'

import { useState, useEffect } from 'react'
import type { Game } from '@/types'
import styles from './GameModal.module.css'

interface Props {
  game: Game | null
  platformOptions: string[]
  onClose: () => void
  onSave: (game: Game, isNew: boolean) => void
}

export default function GameModal({ game, platformOptions, onClose, onSave }: Props) {
  const [title, setTitle] = useState(game?.title || '')
  const [genre, setGenre] = useState(game?.genre || '')
  const [platformPreset, setPlatformPreset] = useState('')
  const [platformCustom, setPlatformCustom] = useState('')
  const [coverUrl, setCoverUrl] = useState(game?.cover_url || '')
  const [notes, setNotes] = useState(game?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const OTHER = '__other__'

  useEffect(() => {
    if (game?.platform) {
      if (platformOptions.includes(game.platform)) {
        setPlatformPreset(game.platform)
      } else {
        setPlatformPreset(OTHER)
        setPlatformCustom(game.platform)
      }
    }
  }, [game, platformOptions])

  const platform = platformPreset === OTHER ? platformCustom : platformPreset

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform) { setError('Please select or enter a platform'); return }
    setLoading(true)
    setError('')

    try {
      const body = { title, genre, platform, cover_url: coverUrl || null, notes: notes || null }
      const url = game ? `/api/games/${game.id}` : '/api/games'
      const method = game ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onSave(data.data.game, !game)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{game ? 'Edit Game' : 'Add Game'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Game Title <span className={styles.required}>*</span></label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Elden Ring"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Genre <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Action RPG"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                required
                list="genre-suggestions"
              />
              <datalist id="genre-suggestions">
                {['Action', 'Action RPG', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
                  'Adventure', 'Horror', 'FPS', 'Puzzle', 'Fighting', 'Platformer', 'MOBA',
                  'MMORPG', 'Visual Novel', 'Sandbox', 'Battle Royale'].map(g => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Platform <span className={styles.required}>*</span></label>
              <select
                className={styles.input}
                value={platformPreset}
                onChange={e => { setPlatformPreset(e.target.value); if (e.target.value !== OTHER) setPlatformCustom('') }}
              >
                <option value="">Select platform...</option>
                {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                <option value={OTHER}>Other (type manually)</option>
              </select>
            </div>
          </div>

          {platformPreset === OTHER && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Platform Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Sega Dreamcast"
                value={platformCustom}
                onChange={e => setPlatformCustom(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image URL <span className={styles.optional}>(optional)</span></label>
            <input
              type="url"
              className={styles.input}
              placeholder="https://..."
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
            />
            {coverUrl && (
              <div className={styles.coverPreview}>
                <img src={coverUrl} alt="Cover preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Any notes about this game..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : game ? 'Save Changes' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
