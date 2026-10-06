import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Email notifications for form submissions, sent over SMTP.
 *
 * Environment:
 *   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   NOTIFY_FROM          e.g. "Target Roofing Website <website@targetroofers.com>" (defaults to SMTP_USER)
 *   LEAD_NOTIFY_TO       comma-separated recipients for contact / estimate leads
 *   SOFTWASH_NOTIFY_TO   comma-separated recipients for softwash leads (falls back to LEAD_NOTIFY_TO)
 *   INTAKE_NOTIFY_TO     comma-separated office copy for Prospect Intake submissions
 *
 * A notification never blocks a submission: the record is saved first, and a failed or
 * unconfigured send is logged and reported back to the caller.
 */

export type NotifyField = [label: string, value: string | null | undefined]

export interface NotifyResult {
  sent: boolean
  error?: string
}

const SEND_TIMEOUT_MS = 10_000

export function recipientList(...values: (string | undefined)[]): string[] {
  const all = values.flatMap((v) => (v || '').split(',')).map((s) => s.trim()).filter(Boolean)
  return [...new Set(all.map((s) => s.toLowerCase()))].map((lower) => all.find((s) => s.toLowerCase() === lower)!)
}

let transporter: Transporter | null = null

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  }
  return transporter
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export async function sendNotification(opts: {
  to: string[]
  subject: string
  heading: string
  fields: NotifyField[]
  replyTo?: string
}): Promise<NotifyResult> {
  if (!opts.to.length) {
    console.warn('[notify] No recipients configured for:', opts.subject)
    return { sent: false, error: 'No notification recipients are configured.' }
  }
  const transport = getTransport()
  if (!transport) {
    console.warn('[notify] SMTP is not configured; skipped:', opts.subject)
    return { sent: false, error: 'Email sending is not configured.' }
  }

  const rows = opts.fields.filter(([, v]) => v != null && String(v).trim() !== '')
  const text = [opts.heading, '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n')
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a">
<h2 style="margin:0 0 12px;font-size:18px;color:#9e2a2f">${escapeHtml(opts.heading)}</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="vertical-align:top;font-weight:bold;color:#555;white-space:nowrap;border-bottom:1px solid #eee">${escapeHtml(k)}</td><td style="vertical-align:top;border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`
  )
  .join('\n')}
</table>
</div>`

  try {
    await Promise.race([
      transport.sendMail({
        from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
        to: opts.to,
        replyTo: opts.replyTo || undefined,
        subject: opts.subject,
        text,
        html,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP send timed out')), SEND_TIMEOUT_MS)),
    ])
    return { sent: true }
  } catch (error) {
    console.error('[notify] Send failed:', opts.subject, error)
    return { sent: false, error: error instanceof Error ? error.message : String(error) }
  }
}
