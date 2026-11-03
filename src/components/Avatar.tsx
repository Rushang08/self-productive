import { useState } from 'react'
import type { User } from 'firebase/auth'

export function PersonAvatar({ name, photo, size = 40 }: { name: string; photo: string | null; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (photo && !failed) {
    return (
      <img
        className="avatar"
        src={photo}
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
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  )
}

export function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  return <PersonAvatar name={user.displayName ?? user.email ?? '?'} photo={user.photoURL} size={size} />
}
