'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const TeamleaderAuthButton = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleAuth = () => {
    setStatus('loading')
    const clientId = process.env.NEXT_PUBLIC_TEAMLEADER_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/teamleader/auth`
    const authUrl = `https://app.teamleader.eu/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`
    window.location.href = authUrl
  }

  const handleRefreshToken = async () => {
    try {
      setStatus('loading')
      const response = await fetch('/api/teamleader/refresh', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message || 'Refresh token failed')
      
      setStatus('success')
      setMessage('Token succesvol ververst')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={handleAuth} disabled={status === 'loading'}>
          {status === 'loading' ? 'Bezig...' : 'Start Teamleader Autorisatie'}
        </Button>
        
        <Button 
          onClick={handleRefreshToken} 
          variant="outline"
          disabled={status === 'loading'}
        >
          Ververs Token
        </Button>
      </div>

      {status === 'success' && (
        <Alert>
          <AlertDescription className="text-green-600">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert>
          <AlertDescription className="text-red-600">
            {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 