import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, Loader2, Lock } from 'lucide-react'

interface AdminLoginViewProps {
  onLogin: (username: string, password: string) => Promise<void>
  onBack: () => void
}

export function AdminLoginView({ onLogin, onBack }: AdminLoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)

    try {
      await onLogin(username.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-sm text-gray-600"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xs text-center border-t-4 border-[var(--accent)]">
        <div className="w-16 h-16 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Login Pengelola</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            className="w-full border border-gray-300 p-3 rounded-md text-sm outline-none focus:border-[var(--accent)]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full border border-gray-300 p-3 rounded-md text-sm outline-none focus:border-[var(--accent)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error !== null && <p className="text-red-500 text-xs text-left">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-bold shadow-md active:bg-[var(--accent-dark)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? 'Memeriksa...' : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
