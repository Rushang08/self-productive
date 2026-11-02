import { useEffect, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

interface RingProps {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
}

export function ProgressRing({ value, size = 96, stroke = 5, children }: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: 'var(--track)' }} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{ stroke: 'var(--accent)' }}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}

export function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => Math.round(v).toString())

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: 'easeOut' })
    return () => controls.stop()
  }, [mv, value])

  return <motion.span>{text}</motion.span>
}
