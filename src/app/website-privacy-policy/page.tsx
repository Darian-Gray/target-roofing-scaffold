import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Website Privacy Policy',
  description: 'How Target Roofing collects, uses, and protects personal information on targetroofers.com.',
  alternates: { canonical: '/website-privacy-policy' },
}

export default function WebsitePrivacyPolicyPage() {
  return <LegalPage title="Website Privacy Policy" slug="website-privacy-policy" />
}
