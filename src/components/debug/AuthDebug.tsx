import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const AuthDebug: React.FC = () => {
  const { user, profile, session, loading } = useAuth()

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-sm">🔍 DEBUG AUTH</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Loading:</strong> {loading ? '🔄 TRUE' : '✅ FALSE'}
        </div>
        <div>
          <strong>User:</strong> {user ? '✅' : '❌'}
          {user && <div className="text-gray-600">{user.email}</div>}
        </div>
        <div>
          <strong>Profile:</strong> {profile ? '✅' : '❌'}
          {profile && <div className="text-gray-600">{profile.role}</div>}
        </div>
        <div>
          <strong>Session:</strong> {session ? '✅' : '❌'}
        </div>
      </CardContent>
    </Card>
  )
}