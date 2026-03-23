import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { loginUser, getUserByName } from '@/api/user/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const expired = searchParams.get('expired') === 'true'
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/pets'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const loginResponse = await loginUser({ username, password })

      // customInstance returns the raw body; Orval wraps it in a typed union.
      // At runtime the successful response is a string (session token) from the API.
      const token =
        typeof loginResponse === 'string'
          ? loginResponse
          : (loginResponse as { data?: string }).data ?? ''

      let isAdmin = false
      try {
        const userResponse = await getUserByName(username)
        const user =
          typeof userResponse === 'object' && userResponse !== null && 'data' in userResponse
            ? (userResponse as { data?: { userStatus?: number } }).data
            : (userResponse as { userStatus?: number } | undefined)
        isAdmin = user?.userStatus === 1
      } catch {
        // getUserByName may fail; default isAdmin to false
      }

      useAuthStore.getState().login({
        username,
        token,
        expiresAt: '',
        isAdmin,
      })

      navigate(from, { replace: true })
    } catch {
      setError('Invalid username or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Branded left panel — hidden below lg */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center px-12"
        style={{ background: 'linear-gradient(135deg, #00478d, #005eb8)' }}
      >
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white">
          Kindred Petstore
        </h1>
        <p className="mt-2 text-lg font-medium text-white/80">Management Console</p>
      </div>

      {/* Right panel — credential form */}
      <div className="flex flex-1 items-center justify-center bg-surface px-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile-only branding */}
          <div className="text-center lg:hidden">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-primary">
              Kindred Petstore
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Management Console</p>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="font-heading text-xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          {expired && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              Your session has expired. Please log in again.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                required
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #00478d, #005eb8)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
