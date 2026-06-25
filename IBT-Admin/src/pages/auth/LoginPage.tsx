import { type FormEvent, useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { FiKey, FiMail } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import loginIllustration from '../../assets/login-illustration.svg'
import { login } from '../../api/auth'
import { ActionButton, Input } from '../../component'
import { setAuthStorage } from '../../features/auth/storage'
import { loginSchema, type LoginSchema } from '../../features/auth/validation'

// logo from react-icons/fi, for temporary use
import { FiHexagon } from 'react-icons/fi'

type FieldErrors = Partial<Record<keyof LoginSchema, string>>

type LoginErrorResponse = {
  message?: string
}

function mapZodErrors(values: LoginSchema) {
  const parseResult = loginSchema.safeParse(values)

  if (parseResult.success) {
    return { valid: true as const, errors: {} as FieldErrors }
  }

  const flattened = parseResult.error.flatten().fieldErrors

  return {
    valid: false as const,
    errors: {
      email: flattened.email?.[0],
      password: flattened.password?.[0],
    } satisfies FieldErrors,
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/admin/dashboard'
  }, [location.state])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formValues: LoginSchema = { email, password }
    const validation = mapZodErrors(formValues)

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    try {
      setLoading(true)
      setErrors({})
      setServerError('')

      const response = await login(formValues)
      setAuthStorage(response.data.token, response.data.user)

      navigate(fromPath, { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<LoginErrorResponse>
      setServerError(axiosError.response?.data?.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto grid h-screen overflow-hidden bg-white/95 backdrop-blur-sm lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#ffffff] via-[#fff1f2] to-[#ffe4e6] p-10 text-slate-800 lg:flex lg:flex-col lg:justify-between border-r border-slate-100">
          <img
            src={loginIllustration}
            alt="Admin platform illustration"
            className="pointer-events-none absolute -bottom-24 left-1/2 w-[120%] max-w-none -translate-x-1/2 opacity-25 mix-blend-multiply"
          />

          {/* Logo and name area */}
          <div>
            <div className="text-[#e63946]">
              <FiHexagon size={48} />
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-[0.18em] text-slate-900">I-BACUS TECH</h1>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="inline-flex rounded-full border border-slate-200 bg-white/50 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#e63946] shadow-sm">
              IBT Control Hub
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] text-slate-900">
              Build <span className="text-[#e63946]">Better Decisions</span> Faster
            </h1>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[var(--ui-surface)] p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ui-primary)]">Welcome Back</p>
            <h2 className="mt-3 text-3xl font-black text-[var(--ui-text)]">Admin Login</h2>
            <p className="mt-2 text-sm text-[var(--ui-muted)]">Sign in to continue to your IBT administration dashboard.</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                startIcon={<FiMail />}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                startIcon={<FiKey />}
                error={errors.password}
              />

              {serverError ? (
                <div className="rounded-xl border border-[var(--ui-danger)] bg-red-50 px-3 py-2 text-sm text-[var(--ui-danger-strong)]">
                  {serverError}
                </div>
              ) : null}

              <ActionButton intent="primary" type="submit" fullWidth loading={loading}>
                Sign In
              </ActionButton>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
