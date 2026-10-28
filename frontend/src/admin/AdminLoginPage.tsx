import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { api, persistSession, ApiError } from '../lib/api'
import { Btn, ErrorNote, Field, Input, Panel } from './ui'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await api.auth.login(email, password)
      persistSession(res)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="link-underline mb-6 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-mute hover:text-accent"
        >
          <ArrowLeft size={13} /> BACK TO SITE
        </Link>

        <Panel>
          <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
            <span className="flex h-10 w-10 items-center justify-center bg-accent text-accent-ink">
              <KeyRound size={17} />
            </span>
            <div>
              <p className="font-mono text-sm font-bold tracking-tight">ADMIN ACCESS</p>
              <p className="label">RESTRICTED SHELL</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="EMAIL">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rickyjhon.tayam@gmail.com"
                autoComplete="username"
              />
            </Field>
            <Field label="PASSWORD">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            <ErrorNote message={error} />

            <Btn type="submit" disabled={pending} className="w-full justify-center py-3">
              {pending ? 'AUTHENTICATING…' : 'LOG IN'}
            </Btn>
          </form>
        </Panel>
      </motion.div>
    </div>
  )
}
