export interface User {
  id: number
  username: string
  email: string
  nickname: string | null
  created_at: string
}

export interface Game {
  id: number
  user_id: number
  title: string
  genre: string
  platform: string
  cover_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
