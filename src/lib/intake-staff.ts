import 'server-only'

/**
 * Staff choices for the internal Prospect Intake Form (carried over from WordPress Gravity Form 5).
 * Salesperson emails stay on the server for notification routing and are never sent to the browser.
 */
export const INTAKE_CREATORS = ['Sarah Taylor', 'Janely Santamaria'] as const

export const INTAKE_SALESPEOPLE: { name: string; email: string }[] = [
  { name: 'Rast Bryant', email: 'Rast@targetroofers.com' },
  { name: 'Brad North', email: 'Brad@targetroofers.com' },
  { name: 'Trey Peters', email: 'Trey@targetroofers.com' },
  { name: 'Colton Peterson', email: 'Colton@targetroofers.com' },
  { name: 'Andrew Weiczorek', email: 'Andrew@targetroofers.com' },
  { name: 'Jason Odom', email: 'Jason@targetroofers.com' },
]
