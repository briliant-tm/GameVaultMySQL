export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabase } = await import('./lib/db')
    try {
      await initializeDatabase()
    } catch (error) {
      console.error('[GameVault] Failed to initialize database on startup:', error)
    }
  }
}
