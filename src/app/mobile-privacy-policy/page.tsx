import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Mobile Privacy Policy',
  description: 'Target Roofing mobile messaging program terms, opt-in, and opt-out.',
  alternates: { canonical: '/mobile-privacy-policy' },
}

export default function MobilePrivacyPolicyPage() {
  return <LegalPage title="Mobile Privacy Policy" slug="mobile-privacy-policy" />
}
