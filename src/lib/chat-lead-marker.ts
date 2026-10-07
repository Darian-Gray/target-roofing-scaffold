const PREFIX = '[SUBMIT_LEAD:'

export interface LeadMarker {
  json: string
  start: number
  end: number
}

function readMarker(text: string, start: number): LeadMarker | null {
  let cursor = start + PREFIX.length
  while (/\s/.test(text[cursor] || '')) cursor++
  if (text[cursor] !== '{') return null

  const jsonStart = cursor
  let depth = 0
  let inString = false
  let escaped = false

  for (; cursor < text.length; cursor++) {
    const char = text[cursor]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) {
      const jsonEnd = cursor + 1
      cursor = jsonEnd
      while (/\s/.test(text[cursor] || '')) cursor++
      if (text[cursor] !== ']') return null
      return { json: text.slice(jsonStart, jsonEnd), start, end: cursor + 1 }
    }
  }

  return null
}

export function extractChatLeadMarkers(text: string): { markers: LeadMarker[]; cleanText: string } {
  const markers: LeadMarker[] = []
  let searchFrom = 0
  let start: number
  while ((start = text.indexOf(PREFIX, searchFrom)) !== -1) {
    const marker = readMarker(text, start)
    if (marker) {
      markers.push(marker)
      searchFrom = marker.end
    } else {
      searchFrom = start + PREFIX.length
    }
  }

  let cleanText = ''
  let copiedThrough = 0
  for (const marker of markers) {
    cleanText += text.slice(copiedThrough, marker.start)
    copiedThrough = marker.end
  }
  cleanText += text.slice(copiedThrough)
  return { markers, cleanText: cleanText.trim() }
}
