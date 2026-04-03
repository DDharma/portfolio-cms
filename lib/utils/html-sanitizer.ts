/**
 * HTML Sanitizer - Uses DOMPurify to safely sanitize HTML content
 * Allows safe HTML tags and class attributes for styling
 */

import DOMPurify from 'dompurify'

export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
  allowedClasses?: string[]
}

// Default configuration for sanitization
const DEFAULT_CONFIG: any = {
  ALLOWED_TAGS: [
    'p',
    'span',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'br',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
  ],
  ALLOWED_ATTR: ['class'],
  ALLOWED_CLASSES: ['*'], // Allow all classes (validated separately)
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @param options - Custom sanitization options
 * @returns Sanitized HTML string safe to render with dangerouslySetInnerHTML
 */
export function sanitizeHTML(html: string, options?: SanitizeOptions): string {
  if (!html || typeof html !== 'string') return ''

  const config: any = {
    ALLOWED_TAGS: options?.allowedTags || DEFAULT_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttributes || DEFAULT_CONFIG.ALLOWED_ATTR,
    ALLOWED_CLASSES: options?.allowedClasses || DEFAULT_CONFIG.ALLOWED_CLASSES,
    KEEP_CONTENT: true,
    FORCE_BODY: false,
  }

  // Check if DOMPurify is available (browser environment)
  if (typeof window === 'undefined') {
    // Server-side: For now, return as-is (DOMPurify needs DOM)
    // In production, consider using isomorphic-dompurify
    console.warn(
      'HTML sanitization not available on server side. Consider installing isomorphic-dompurify.'
    )
    return html
  }

  return DOMPurify.sanitize(html, config) as unknown as string
}

/**
 * Extracts plain text from HTML by removing all tags
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') return ''

  if (typeof window === 'undefined') {
    // Server-side fallback: basic regex replacement
    return html.replace(/<[^>]*>/g, '')
  }

  // Client-side: use DOM to extract text
  const temp = document.createElement('div')
  temp.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  return temp.textContent || temp.innerText || ''
}

/**
 * Validates if a string contains potentially dangerous HTML patterns
 * @param html - String to check
 * @returns True if potentially dangerous, false if safe
 */
export function containsDangerousPatterns(html: string): boolean {
  if (!html) return false

  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /javascript:/gi,
    /vbscript:/gi,
  ]

  return dangerousPatterns.some((pattern) => pattern.test(html))
}

/**
 * Escapes HTML special characters
 * Useful for escaping user input that shouldn't contain HTML
 * @param text - Text to escape
 * @returns HTML-escaped text
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validates HTML structure (basic check)
 * @param html - HTML string to validate
 * @returns Object with validity status and any errors
 */
export function validateHTML(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!html || typeof html !== 'string') {
    return { valid: false, errors: ['Invalid HTML: empty or not a string'] }
  }

  if (containsDangerousPatterns(html)) {
    errors.push('HTML contains potentially dangerous patterns')
  }

  // Check for unmatched tags (basic check)
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g
  const openTags: string[] = []
  let match

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const isClosing = match[0].startsWith('</')

    // Self-closing tags
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
