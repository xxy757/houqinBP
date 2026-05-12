import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children, permission }: { children: ReactNode; permission?: string }) {
  const { user, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>加载中...</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (permission && !hasPermission(permission)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#DC2626', marginBottom: 8 }}>🔒 权限不足</h2>
        <p style={{ color: '#6B7280' }}>您没有访问此页面所需的权限</p>
      </div>
    )
  }
  return <>{children}</>
}
