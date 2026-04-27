import sanitizeHtml from 'sanitize-html'

export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'span', 'strong', 'b', 'em', 'i', 'u', 'br',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre'
]

const DEFAULT_ALLOWED_ATTR = ['class']

export function sanitizeHTML(html: string, options?: SanitizeOptions): string {
  if (!html || typeof html !== 'string') return ''

  return sanitizeHtml(html, {
    allowedTags: options?.allowedTags || DEFAULT_ALLOWED_TAGS,
    allowedAttributes: { '*': options?.allowedAttributes || DEFAULT_ALLOWED_ATTR },
  })
}

export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') return ''
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
}

export function containsDangerousPatterns(html: string): boolean {
  if (!html) return false

  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /javascript:/gi,
    /vbscript:/gi,
  ]

  return dangerousPatterns.some(pattern => pattern.test(html))
}

export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

export function validateHTML(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!html || typeof html !== 'string') {
    return { valid: false, errors: ['Invalid HTML: empty or not a string'] }
  }

  if (containsDangerousPatterns(html)) {
    errors.push('HTML contains potentially dangerous patterns')
  }

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g
  const openTags: string[] = []
  let match

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const isClosing = match[0].startsWith('</')

    if (['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tag)) {
      continue
    }

    if (isClosing) {
      if (openTags.length === 0 || openTags[openTags.length - 1] !== tag) {
        errors.push(`Unmatched closing tag: ${tag}`)
      } else {
        openTags.pop()
      }
    } else {
      openTags.push(tag)
    }
  }

  if (openTags.length > 0) {
    errors.push(`Unclosed tags: ${openTags.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
