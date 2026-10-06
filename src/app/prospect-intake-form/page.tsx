import type { Metadata } from 'next'
import ProspectIntakeForm from './ProspectIntakeForm'
import { INTAKE_CREATORS, INTAKE_SALESPEOPLE } from '@/lib/intake-staff'

// Internal staff form: reachable by direct link, kept out of search results.
export const metadata: Metadata = {
  title: 'Prospect Intake Form',
  robots: { index: false, follow: false },
}

export default function ProspectIntakePage() {
  return (
    <>
      <section className="bg-[var(--black)] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 sm:pt-40 sm:pb-14">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight font-[family-name:var(--font-display)]">
            Prospect Intake Form
          </h1>
          <p className="mt-3 text-sm text-white/70">Internal form for the Target Roofing team. Submissions go to the assigned salesperson.</p>
        </div>
      </section>
      <section className="bg-[var(--gray-50)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <ProspectIntakeForm creators={[...INTAKE_CREATORS]} salespeople={INTAKE_SALESPEOPLE.map((p) => p.name)} />
        </div>
      </section>
    </>
  )
}
