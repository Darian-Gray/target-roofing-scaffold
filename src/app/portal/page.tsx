import { permanentRedirect } from 'next/navigation'

/** The previous customer portal was only a demo. Keep the public route safe. */
export default function PortalPage() {
  permanentRedirect('/contact')
}
