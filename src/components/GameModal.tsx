'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (file: File) => {
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, and GIF images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error)
      setCoverUrl(data.data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleRemoveCover = () => {
    setCoverUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

          {/* Cover Image Upload */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image <span className={styles.optional}>(optional)</span></label>

            {coverUrl ? (
              <div className={styles.coverPreviewLarge}>
                <img src={coverUrl} alt="Cover preview" />
                <div className={styles.coverOverlay}>
                  <button type="button" className={styles.coverChangeBtn} onClick={() => fileInputRef.current?.click()}>
                    Change Image
                  </button>
                  <button type="button" className={styles.coverRemoveBtn} onClick={handleRemoveCover}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className={styles.uploadingState}>
                    <span className={styles.spinner} />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span className={styles.uploadText}>Click to upload or drag & drop</span>
                    <span className={styles.uploadHint}>JPG, PNG, WEBP, GIF · max 5MB</span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
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
            <button type="submit" className={styles.btnSave} disabled={loading || uploading}>
              {loading ? <span className={styles.spinner} /> : game ? 'Save Changes' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
