'use server'

import { supabase } from '@/lib/supabase'
import { sendNotification, recipientList } from '@/lib/notify'
import { INTAKE_CREATORS, INTAKE_SALESPEOPLE } from '@/lib/intake-staff'

export interface ProspectIntakeInput {
  customerFirstName: string
  customerLastName: string
  createdBy: string
  customerEmail: string
  customerPhone: string
  salesperson: string
  projectName: string
  bidDueDate: string
  comments: string
  /** Honeypot: hidden from people, filled in by bots. */
  website?: string
}

export interface ProspectIntakeResult {
  success: boolean
  /** True when the notification email went out. */
  notified?: boolean
  error?: string
  errors?: Partial<Record<keyof ProspectIntakeInput, string>>
}

export async function submitProspectIntake(input: ProspectIntakeInput): Promise<ProspectIntakeResult> {
  // Quietly accept and drop bot submissions.
  if (input.website && input.website.trim()) return { success: true, notified: false }

  const errors: ProspectIntakeResult['errors'] = {}
  const t = (s: string | undefined) => (s || '').trim()

  if (t(input.customerFirstName).length < 1) errors.customerFirstName = 'First name is required.'
  if (t(input.customerLastName).length < 1) errors.customerLastName = 'Last name is required.'
  const creator = INTAKE_CREATORS.find((c) => c.name === input.createdBy)
  if (!creator) errors.createdBy = 'Choose who created the project.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t(input.customerEmail))) errors.customerEmail = 'A valid customer email is required.'
  if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(t(input.customerPhone))) errors.customerPhone = 'A valid 10-digit phone number is required.'
  const rep = INTAKE_SALESPEOPLE.find((p) => p.name === input.salesperson)
  if (!rep) errors.salesperson = 'Choose the assigned salesperson.'
  if (t(input.projectName).length < 1) errors.projectName = 'Project name is required.'
  if (t(input.bidDueDate) && !/^\d{4}-\d{2}-\d{2}$/.test(t(input.bidDueDate))) errors.bidDueDate = 'Use a valid date.'

  if (Object.keys(errors).length > 0 || !rep || !creator) {
    return { success: false, errors, error: 'Please correct the highlighted fields.' }
  }

  const { data: row, error } = await supabase
    .from('prospect_intakes')
    .insert({
      customer_first_name: t(input.customerFirstName),
      customer_last_name: t(input.customerLastName),
      customer_email: t(input.customerEmail),
      customer_phone: t(input.customerPhone),
      created_by: input.createdBy,
      salesperson: rep.name,
      salesperson_email: rep.email,
      project_name: t(input.projectName),
      bid_due_date: t(input.bidDueDate) || null,
      comments: t(input.comments) || null,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('[intake] Save failed:', error)
    return { success: false, error: 'The intake could not be saved. Please try again.' }
  }

  const customer = `${t(input.customerFirstName)} ${t(input.customerLastName)}`
  const sent = await sendNotification({
    // Same routing and subject as the WordPress form: to the person who created the project.
    to: recipientList(creator.notifyEmail, process.env.INTAKE_NOTIFY_TO),
    subject: 'Prospect Intake Form Submission',
    heading: `New prospect: ${t(input.projectName)}`,
    fromName: 'Target Roofing',
    replyTo: process.env.INTAKE_REPLY_TO || undefined,
    fields: [
      ['Project name', t(input.projectName)],
      ['Customer', customer],
      ['Customer email', t(input.customerEmail)],
      ['Customer phone', t(input.customerPhone)],
      ['Assigned salesperson', rep.name],
      ['Created by', input.createdBy],
      ['Bid due date', t(input.bidDueDate) || null],
      ['Comments', t(input.comments) || null],
      ['Intake ID', String(row.id)],
    ],
  })

  if (sent.sent) {
    await supabase.from('prospect_intakes').update({ notified: true }).eq('id', row.id)
  } else {
    console.error('[intake] Saved but notification not sent:', row.id, sent.error)
  }

  return { success: true, notified: sent.sent }
}
