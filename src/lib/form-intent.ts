/** Preserve the request's intent when several calls to action share one form. */
export function contactFormSource(service: string, search: string): 'contact-page' | 'estimate' {
  return service === 'free-estimate' || new URLSearchParams(search).get('service') === 'free-estimate'
    ? 'estimate'
    : 'contact-page'
}

export function cleaningFormSource(search: string): 'softwash' | 'roof-cleaning' {
  return new URLSearchParams(search).get('request') === 'roof-cleaning' ? 'roof-cleaning' : 'softwash'
}
