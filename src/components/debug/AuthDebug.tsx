import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export const AuthDebug: React.FC = () => {
  const { user, profile, session, loading, refreshProfile } = useAuth()

  const handleRefreshProfile = async () => {
    console.log('🔄 [DEBUG] Botão de refresh clicado')
    await refreshProfile()
  }

  return (
    <Card className="fixed top-4 right-4 w-96 z-50 bg-red-50 border-red-200 max-h-96 overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-sm">🔍 DEBUG AUTH - PROFILE</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="border-b pb-2">
          <strong>Loading:</strong> {loading ? '🔄 TRUE' : '✅ FALSE'}
        </div>
        
        <div className="border-b pb-2">
          <strong>User:</strong> {user ? '✅' : '❌'}
          {user && (
            <div className="ml-2 text-gray-600">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
            </div>
          )}
        </div>
        
        <div className="border-b pb-2">
          <strong>Profile:</strong> {profile ? '✅' : '❌'}
          {profile && (
            <div className="ml-2 text-gray-600">
              <div>ID: {profile.id}</div>
              <div>Email: {profile.email}</div>
              <div>Nome: {profile.full_name || 'N/A'}</div>
              <div>Role: {profile.role}</div>
            </div>
          )}
        </div>
        
        <div className="border-b pb-2">
          <strong>Session:</strong> {session ? '✅' : '❌'}
          {session && (
            <div className="ml-2 text-gray-600">
              <div>Expires: {new Date(session.expires_at! * 1000).toLocaleString()}</div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleRefreshProfile}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Forçar Refresh Profile
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <strong>Instruções:</strong>
          <br />1. Abra o console (F12)
          <br />2. Veja os logs com [PROFILE]
          <br />3. Teste o botão acima
        </div>
      </CardContent>
    </Card>
  )
}