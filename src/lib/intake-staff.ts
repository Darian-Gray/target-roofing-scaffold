import 'server-only'

/**
 * Staff choices for the internal Prospect Intake Form (carried over from WordPress Gravity Form 5).
 * Emails stay on the server and are never sent to the browser.
 *
 * Notification routing matches WordPress: the email goes to the person who created the project
 * (Sarah Taylor -> sarah@, Janely Santamaria -> projects@).
 */
export const INTAKE_CREATORS: { name: string; notifyEmail: string }[] = [
  { name: 'Sarah Taylor', notifyEmail: 'sarah@targetroofers.com' },
  { name: 'Janely Santamaria', notifyEmail: 'projects@targetroofers.com' },
]

export const INTAKE_SALESPEOPLE: { name: string; email: string }[] = [
  { name: 'Rast Bryant', email: 'Rast@targetroofers.com' },
  { name: 'Brad North', email: 'Brad@targetroofers.com' },
  { name: 'Trey Peters', email: 'Trey@targetroofers.com' },
  { name: 'Colton Peterson', email: 'Colton@targetroofers.com' },
  { name: 'Andrew Weiczorek', email: 'Andrew@targetroofers.com' },
  { name: 'Jason Odom', email: 'Jason@targetroofers.com' },
]
