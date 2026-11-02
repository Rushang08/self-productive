import { useState } from 'react'
import type { User } from 'firebase/auth'

export function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  const [failed, setFailed] = useState(false)
  const initial = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()

  if (user.photoURL && !failed) {
    return (
      <img
        className="avatar"
        src={user.photoURL}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span className="avatar fallback" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initial}
    </span>
  )
}
