"use client"

import type React from "react"
import type { User } from "@/lib/real-time"

interface UserHoverCardProps {
  user: User | null
  position: { x: number; y: number }
  visible: boolean
}

export const UserHoverCard: React.FC<UserHoverCardProps> = ({ user, position, visible }) => {
  if (!visible || !user) return null

  return (
    <div
      className="fixed z-50 pointer-events-none bg-black/80 rounded-lg px-3 py-2 text-white flex items-center gap-2 shadow-lg animate-in fade-in duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* User avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
        {user.avatarUrl ? (
          <img src={user.avatarUrl || "/placeholder.svg"} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-medium">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Username */}
      <span className="font-medium">{user.username}</span>
    </div>
  )
}

