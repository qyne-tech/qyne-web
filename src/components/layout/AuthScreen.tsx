import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { Container } from '../primitives/Container'
import { buttonVariants } from '../primitives/Button'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

type Mode = 'login' | 'signup'
type Method = 'phone' | 'email'

/** Indian mobile numbers, matching the mobile app's e.164 formatting. */
const e164 = (phone: string) => `+91${phone}`

const COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in with a one-time code — no password needed.',
    switchText: 'New to QYNE?',
    switchCta: 'Create an account',
    switchTo: '/signup',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up with a one-time code — no password needed.',
    switchText: 'Already have an account?',
    switchCta: 'Log in',
    switchTo: '/login',
  },
} as const

const fieldClass =
  'h-12 w-full rounded-lg border border-border bg-surface text-[15px] text-ink placeholder:text-faint transition-colors focus:border-primary focus:outline-none'

const emailPattern = /^[\w.+-]+@[\w-]+\.[\w.-]+$/
const OTP_LENGTH = 6
const RESEND_SECONDS = 30

export function AuthScreen({ mode }: { mode: Mode }) {
  const c = COPY[mode]
  const [step, setStep] = useState<'contact' | 'otp'>('contact')
  const [method, setMethod] = useState<Method>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const phoneValid = phone.length === 10 && /^[6-9]/.test(phone)
  const emailValid = emailPattern.test(email.trim())
  const valid = method === 'phone' ? phoneValid : emailValid
  const contactDisplay = method === 'phone' ? `+91 ${phone}` : email.trim()

  /** Request a one-time code via Supabase (same project as the mobile app). */
  async function sendCode(e: FormEvent) {
    e.preventDefault()
    if (!valid || sending) return
    setSending(true)
    setError(null)
    const { error: err } =
      method === 'phone'
        ? await supabase.auth.signInWithOtp({ phone: e164(phone) })
        : await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
          })
    setSending(false)
    if (err) {
      setError(err.message)
      return
    }
    setStep('otp')
  }

  /** Verify the entered code; resolves true when a session is established. */
  async function verifyCode(code: string): Promise<boolean> {
    const { data, error: err } = await supabase.auth.verifyOtp(
      method === 'phone'
        ? { phone: e164(phone), token: code, type: 'sms' }
        : { email: email.trim(), token: code, type: 'email' },
    )
    if (err) throw new Error(err.message)
    return data.session != null
  }

  return (
    <section className="relative grid min-h-[calc(100svh-4rem)] place-items-center overflow-hidden px-5 pb-20 pt-24">
      <div aria-hidden className="grid-bg mask-fade pointer-events-none absolute inset-0 opacity-40" />
      <Container className="relative">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm sm:p-8">
            {verified ? (
              <Done mode={mode} />
            ) : step === 'otp' ? (
              <OtpStep
                contactDisplay={contactDisplay}
                onBack={() => {
                  setError(null)
                  setStep('contact')
                }}
                onResend={sendCode}
                onVerify={verifyCode}
                onVerified={() => setVerified(true)}
              />
            ) : (
              <>
                <div className="mb-7 text-center">
                  <h1 className="text-[clamp(1.6rem,4vw,2rem)] font-medium tracking-tight text-ink">{c.title}</h1>
                  <p className="mt-2 text-[14px] text-muted">{c.subtitle}</p>
                </div>

                <MethodToggle method={method} onChange={setMethod} />

                <form onSubmit={sendCode} className="mt-5 flex flex-col gap-5">
                  {method === 'phone' ? (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-medium text-muted">Phone number</span>
                      <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-surface focus-within:border-primary">
                        <span className="flex items-center gap-2 border-r border-border px-3.5 text-[15px] font-medium text-ink">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="h-12 flex-1 bg-transparent px-3.5 text-[15px] text-ink placeholder:text-faint focus:outline-none"
                        />
                      </div>
                    </label>
                  ) : (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-medium text-muted">Email</span>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(fieldClass, 'px-4')}
                      />
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={!valid || sending}
                    className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                  >
                    {sending ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
                    ) : (
                      'Continue'
                    )}
                  </button>

                  {error && (
                    <p role="alert" className="-mt-2 text-center text-[13px] text-danger">
                      {error}
                    </p>
                  )}
                </form>

                <p className="mt-6 text-center text-[14px] text-muted">
                  {c.switchText}{' '}
                  <Link to={c.switchTo} className="font-medium text-primary hover:text-primary-light">
                    {c.switchCta}
                  </Link>
                </p>
              </>
            )}
          </div>

          {step === 'contact' && !verified && (
            <p className="mx-auto mt-5 max-w-[22rem] text-center text-[12px] leading-[1.5] text-faint">
              By continuing you agree to QYNE’s{' '}
              <Link to="/terms" className="underline hover:text-muted">Terms</Link> and{' '}
              <Link to="/privacy" className="underline hover:text-muted">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}

/** Two-segment phone / email selector. */
function MethodToggle({ method, onChange }: { method: Method; onChange: (m: Method) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
      {(['phone', 'email'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            'h-10 flex-1 rounded-lg text-[14px] font-medium capitalize transition-colors',
            method === m ? 'bg-primary text-bg' : 'text-muted hover:text-ink',
          )}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

/** 6-digit one-time code entry with a resend timer. Frontend-only for now. */
function OtpStep({
  contactDisplay,
  onBack,
  onResend,
  onVerify,
  onVerified,
}: {
  contactDisplay: string
  onBack: () => void
  onResend: (e: FormEvent) => void
  onVerify: (code: string) => Promise<boolean>
  onVerified: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  async function verify(full: string) {
    setVerifying(true)
    setError(null)
    try {
      const ok = await onVerify(full)
      if (ok) {
        onVerified()
        return
      }
      setError('That code didn’t work. Try again.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed. Try again.')
    }
    // On failure, clear the entry so the athlete can re-type.
    setVerifying(false)
    setDigits(Array(OTP_LENGTH).fill(''))
    inputs.current[0]?.focus()
  }

  function setAt(i: number, v: string) {
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus()
    const joined = next.join('')
    if (joined.length === OTP_LENGTH && !joined.includes('')) verify(joined)
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, idx) => (next[idx] = d))
    setDigits(next)
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    if (pasted.length === OTP_LENGTH) verify(pasted)
  }

  function resend(e: FormEvent) {
    if (seconds > 0) return
    setDigits(Array(OTP_LENGTH).fill(''))
    setSeconds(RESEND_SECONDS)
    onResend(e)
    inputs.current[0]?.focus()
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-5 inline-flex items-center gap-1.5 text-[13px] text-faint transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <h1 className="text-[clamp(1.6rem,4vw,2rem)] font-medium tracking-tight text-ink">Enter the code</h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink">{contactDisplay}</span>.
      </p>

      <div className="mt-7 flex justify-between gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={verifying}
            onChange={(e) => setAt(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-14 w-full rounded-lg border border-border bg-surface text-center text-xl font-medium text-ink transition-colors focus:border-primary focus:outline-none disabled:opacity-60"
          />
        ))}
      </div>

      <div className="mt-4 h-5 text-center">
        {verifying ? (
          <span className="inline-flex items-center gap-2 text-[13px] text-muted">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
            Verifying…
          </span>
        ) : error ? (
          <span role="alert" className="text-[13px] text-danger">
            {error}
          </span>
        ) : null}
      </div>

      <div className="mt-2 text-center text-[14px]">
        {seconds > 0 ? (
          <span className="text-faint">Resend code in {seconds}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        )}
      </div>

    </div>
  )
}

function Done({ mode }: { mode: Mode }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-primary-bg">
        <Check size={22} className="text-primary" />
      </span>
      <h2 className="mt-5 text-xl font-medium text-ink">
        {mode === 'signup' ? 'You’re all set' : 'You’re in'}
      </h2>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
        Web onboarding is opening soon — we’ll be in touch. For now, continue in the QYNE app to reach your training.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>
    </div>
  )
}
