'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle } from 'lucide-react'
import { submitProspectIntake, type ProspectIntakeInput } from './actions'

const EMPTY: ProspectIntakeInput = {
  customerFirstName: '',
  customerLastName: '',
  createdBy: '',
  customerEmail: '',
  customerPhone: '',
  salesperson: '',
  projectName: '',
  bidDueDate: '',
  comments: '',
  website: '',
}

type FieldName = keyof ProspectIntakeInput

export default function ProspectIntakeForm({ creators, salespeople }: { creators: string[]; salespeople: string[] }) {
  const [form, setForm] = useState<ProspectIntakeInput>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ notified: boolean } | null>(null)

  function set(name: FieldName, value: string) {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setErrors({})
    try {
      const res = await submitProspectIntake(form)
      if (res.success) {
        setDone({ notified: !!res.notified })
        setForm(EMPTY)
      } else {
        setErrors(res.errors || {})
        setError(res.error || 'Please correct the highlighted fields.')
      }
    } catch {
      setError('A connection error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (name: FieldName) =>
    `w-full px-4 py-3 rounded-lg border bg-white text-base text-[var(--black)] focus:outline-none focus:ring-2 ${
      errors[name] ? 'border-red-500 focus:ring-red-200' : 'border-[var(--gray-300)] focus:ring-[var(--red)]'
    }`
  const label = 'block text-xs font-semibold mb-1 uppercase tracking-wider text-[var(--gray-600)] font-[family-name:var(--font-display)]'
  const err = (name: FieldName) =>
    errors[name] ? <p id={`intake-${name}-error`} className="mt-1 text-xs font-semibold text-red-600">{errors[name]}</p> : null
  const aria = (name: FieldName) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `intake-${name}-error` : undefined,
  })
  const req = <span className="text-[var(--red)]">*</span>

  if (done) {
    return (
      <div role="status" aria-live="polite" className="rounded-lg bg-white p-8 text-center border-t-4 border-[var(--red)] shadow-sm">
        <CheckCircle className="h-12 w-12 text-[var(--red)] mx-auto mb-4" />
        <h2 className="text-2xl font-bold uppercase mb-2 font-[family-name:var(--font-display)] text-[var(--black)]">Prospect submitted</h2>
        <p className="text-[var(--gray-600)]">
          {done.notified
            ? 'The notification email has been sent.'
            : 'The prospect was saved, but the notification email did not go out. Please let the office know directly.'}
        </p>
        <button type="button" onClick={() => setDone(null)} className="mt-6 text-sm font-bold text-[var(--red)] underline underline-offset-2">
          Submit another prospect
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg bg-white p-6 sm:p-8 border-t-4 border-[var(--red)] shadow-sm space-y-5">
      {error && (
        <div role="alert" className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="intake-website">Website</label>
        <input id="intake-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <fieldset>
        <legend className={label}>Customer name {req}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input aria-label="Customer first name" placeholder="First" autoComplete="off" className={inputClass('customerFirstName')}
              value={form.customerFirstName} onChange={(e) => set('customerFirstName', e.target.value)} {...aria('customerFirstName')} />
            {err('customerFirstName')}
          </div>
          <div>
            <input aria-label="Customer last name" placeholder="Last" autoComplete="off" className={inputClass('customerLastName')}
              value={form.customerLastName} onChange={(e) => set('customerLastName', e.target.value)} {...aria('customerLastName')} />
            {err('customerLastName')}
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="intake-createdBy" className={label}>Person who created the project {req}</label>
        <select id="intake-createdBy" className={inputClass('createdBy')} value={form.createdBy} onChange={(e) => set('createdBy', e.target.value)} {...aria('createdBy')}>
          <option value="">Choose one</option>
          {creators.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {err('createdBy')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="intake-customerEmail" className={label}>Customer email {req}</label>
          <input id="intake-customerEmail" type="email" autoComplete="off" className={inputClass('customerEmail')}
            value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} {...aria('customerEmail')} />
          {err('customerEmail')}
        </div>
        <div>
          <label htmlFor="intake-customerPhone" className={label}>Customer phone {req}</label>
          <input id="intake-customerPhone" type="tel" autoComplete="off" placeholder="239-000-0000" className={inputClass('customerPhone')}
            value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} {...aria('customerPhone')} />
          {err('customerPhone')}
        </div>
      </div>

      <div>
        <label htmlFor="intake-salesperson" className={label}>Assigned salesperson {req}</label>
        <select id="intake-salesperson" className={inputClass('salesperson')} value={form.salesperson} onChange={(e) => set('salesperson', e.target.value)} {...aria('salesperson')}>
          <option value="">Choose one</option>
          {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {err('salesperson')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="intake-projectName" className={label}>Project name {req}</label>
          <input id="intake-projectName" type="text" autoComplete="off" className={inputClass('projectName')}
            value={form.projectName} onChange={(e) => set('projectName', e.target.value)} {...aria('projectName')} />
          {err('projectName')}
        </div>
        <div>
          <label htmlFor="intake-bidDueDate" className={label}>Bid due date</label>
          <input id="intake-bidDueDate" type="date" className={inputClass('bidDueDate')}
            value={form.bidDueDate} onChange={(e) => set('bidDueDate', e.target.value)} {...aria('bidDueDate')} />
          {err('bidDueDate')}
        </div>
      </div>

      <div>
        <label htmlFor="intake-comments" className={label}>Other comments</label>
        <textarea id="intake-comments" rows={4} className={inputClass('comments')}
          value={form.comments} onChange={(e) => set('comments', e.target.value)} />
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-4 bg-[var(--red)] hover:bg-[var(--red-dark)] text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-md disabled:opacity-50 font-[family-name:var(--font-display)]">
        {loading ? 'Submitting...' : 'Submit prospect'}
      </button>
    </form>
  )
}
