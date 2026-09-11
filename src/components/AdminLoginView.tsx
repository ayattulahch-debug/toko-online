import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, Lock } from 'lucide-react'
import { ADMIN_CREDENTIALS } from '../data'

interface AdminLoginViewProps {
  onLogin: () => void
  onBack: () => void
}

export function AdminLoginView({ onLogin, onBack }: AdminLoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin()
    } else {
      setError(true)
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
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xs text-center border-t-4 border-[#ee4d2d]">
        <div className="w-16 h-16 bg-red-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Login Pengelola</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username (admin)"
            className="w-full border border-gray-300 p-3 rounded-md text-sm outline-none focus:border-[#ee4d2d]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (admin123)"
            className="w-full border border-gray-300 p-3 rounded-md text-sm outline-none focus:border-[#ee4d2d]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs text-left">Username atau password salah!</p>}
          <button
            type="submit"
            className="w-full bg-[#ee4d2d] text-white p-3 rounded-md font-bold shadow-md active:bg-red-600"
          >
            Masuk Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
