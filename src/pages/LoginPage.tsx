import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { GoogleIcon } from '../components/Icons'

interface Props {
  onSignIn: () => void
  signingIn: boolean
  error: string | null
}

const ease = [0.22, 1, 0.36, 1] as const

function Preview() {
  const rows: { name: string; meta: string; done?: boolean; pct?: number }[] = [
    { name: 'Hit the gym', meta: 'Completed', done: true },
    { name: 'Steps', meta: '7,400 / 10,000', pct: 0.74 },
    { name: 'Water', meta: '2.25 / 3 L', pct: 0.75 },
    { name: 'Learned something new', meta: 'Not yet' },
  ]
  return (
    <motion.div className="preview" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.25 }} aria-hidden>
      {rows.map((r, i) => (
        <div key={r.name} className="preview-row">
          <div className="preview-text">
            <strong>{r.name}</strong>
            <small>{r.meta}</small>
            {r.pct !== undefined && (
              <div className="bar">
                <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${r.pct * 100}%` }} transition={{ duration: 1, ease, delay: 0.7 + i * 0.1 }} />
              </div>
            )}
          </div>
          <motion.span
            className={`check ${r.done ? 'on' : ''}`}
            initial={false}
            animate={r.done ? { scale: [0.8, 1.08, 1] } : {}}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            {r.done && <Check size={14} strokeWidth={3} color="#fff" />}
          </motion.span>
        </div>
      ))}
    </motion.div>
  )
}

export function LoginPage({ onSignIn, signingIn, error }: Props) {
  return (
    <div className="login">
      <motion.div className="login-top" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <img src="/favicon.svg" alt="" width={44} height={44} className="logo" />
        <h1 className="display xl">
          Make every
          <br />
          <em>day</em> count.
        </h1>
        <p className="tagline">A quiet place to track the small habits that shape your days.</p>
      </motion.div>

      <Preview />

      <motion.div className="login-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
        <button className="google-btn" onClick={onSignIn} disabled={signingIn}>
          {signingIn ? <span className="spinner" /> : <GoogleIcon />}
          {signingIn ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <small className="fine">Private by design. Only you can see your data.</small>
      </motion.div>
    </div>
  )
}
