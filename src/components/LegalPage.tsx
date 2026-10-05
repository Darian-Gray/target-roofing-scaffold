import fs from 'fs'
import path from 'path'

/**
 * Renders one of the legal documents carried over from the WordPress site
 * (src/data/legal/<slug>.html, sanitized to headings, paragraphs, lists, and links).
 */
export default function LegalPage({ title, slug }: { title: string; slug: string }) {
  const html = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'legal', `${slug}.html`), 'utf8')

  return (
    <>
      <section className="bg-[var(--black)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14 sm:pt-40 sm:pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight font-[family-name:var(--font-display)]">
            {title}
          </h1>
        </div>
      </section>

      <section className="bg-white">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-[var(--gray-700)] text-base leading-relaxed
            [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--black)] [&_h2]:font-[family-name:var(--font-display)]
            [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--black)]
            [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[var(--black)]
            [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5
            [&_strong]:text-[var(--black)] [&_a]:text-[var(--red)] [&_a]:underline [&_a]:underline-offset-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </>
  )
}
