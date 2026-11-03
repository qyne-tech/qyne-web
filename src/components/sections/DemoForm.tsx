import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { Button } from '../primitives/Button'
import { fieldClass } from '../primitives/field-styles'
import { DEMO_ROLES, SITE } from '../../lib/site'

interface FormState {
  email: string
  academy: string
  city: string
  role: string
}

const EMPTY: FormState = { email: '', academy: '', city: '', role: DEMO_ROLES[0] }

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

function ThankYou({ academy }: { academy: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-primary-bg">
        <Check className="text-primary" size={22} />
      </div>
      <h3 className="mt-5 text-xl font-medium text-ink">Request received.</h3>
      <p className="mt-2 max-w-xs text-[14px] leading-[1.6] text-muted">
        Thanks{academy ? `, ${academy}` : ''} — we’ll be in touch within two
        working days to set up your demo.
      </p>
      <a
        href={`mailto:${SITE.email}`}
        className="mt-5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
      >
        Or email us directly →
      </a>
    </div>
  )
}

/** Demo request form. No backend yet — logs the request and confirms. */
export function DemoForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const update =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // No backend in this phase — log the request and show confirmation.
    console.info('[QYNE] Demo request:', form)
    setSubmitted(true)
  }

  if (submitted) return <ThankYou academy={form.academy.trim()} />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Work email" htmlFor="demo-email">
        <input
          id="demo-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@academy.in"
          value={form.email}
          onChange={update('email')}
          className={fieldClass}
        />
      </Field>

      <Field label="Academy name" htmlFor="demo-academy">
        <input
          id="demo-academy"
          name="academy"
          type="text"
          required
          placeholder="e.g. Karnataka Cricket Centre"
          value={form.academy}
          onChange={update('academy')}
          className={fieldClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor="demo-city">
          <input
            id="demo-city"
            name="city"
            type="text"
            required
            placeholder="Bangalore"
            value={form.city}
            onChange={update('city')}
            className={fieldClass}
          />
        </Field>

        <Field label="Your role" htmlFor="demo-role">
          <div className="relative">
            <select
              id="demo-role"
              name="role"
              value={form.role}
              onChange={update('role')}
              className={`${fieldClass} cursor-pointer appearance-none pr-9`}
            >
              {DEMO_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
            />
          </div>
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-1 w-full">
        Request a demo
        <ArrowRight size={16} />
      </Button>
      <p className="text-center text-[12px] text-faint">
        No spam. We reply within two working days.
      </p>
    </form>
  )
}
