/**
 * CSS Sanitizer - Validates and sanitizes CSS to prevent CSS injection attacks
 * Uses a whitelist approach for maximum security
 */

// Whitelist of allowed CSS properties
const ALLOWED_CSS_PROPERTIES = new Set([
  // Color & Text
  'color',
  'background',
  'background-color',
  'background-image',
  'background-clip',
  '-webkit-background-clip',
  'font-size',
  'font-weight',
  'font-family',
  'font-style',
  'text-decoration',
  'text-transform',
  'text-shadow',
  'letter-spacing',
  'line-height',
  'text-align',

  // Border & Box
  'border',
  'border-radius',
  'border-color',
  'border-width',
  'border-style',
  'padding',
  'margin',
  'display',
  'opacity',
  'transform',
  'box-shadow',
  'filter',

  // Webkit specific
  '-webkit-text-fill-color',
  '-webkit-background-clip',

  // Other safe properties
  'width',
  'height',
  'max-width',
  'min-width',
  'max-height',
  'min-height',
  'overflow',
  'transition',
])

// Patterns that indicate dangerous CSS
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /behavior:/gi,
  /binding:/gi,
  /-moz-binding/gi,
  /\/\*/g, // Comments (can hide malicious code)
  /<\s*script/gi,
  /embed\s*:/gi,
  /vbscript:/gi,
]

interface SanitizationResult {
  valid: boolean
  sanitized: string
  errors: string[]
}

/**
 * Sanitizes a single CSS declaration (property: value)
 */
function sanitizeCSSDeclaration(declaration: string): {
  valid: boolean
  sanitized: string
  error?: string
} {
  const trimmed = declaration.trim()
  if (!trimmed) return { valid: true, sanitized: '' }

  const colonIndex = trimmed.indexOf(':')
  if (colonIndex === -1) {
    return { valid: false, sanitized: '', error: `Invalid CSS declaration: ${trimmed}` }
  }

  const property = trimmed.substring(0, colonIndex).trim().toLowerCase()
  const value = trimmed.substring(colonIndex + 1).trim()

  // Check if property is allowed
  if (!ALLOWED_CSS_PROPERTIES.has(property)) {
    return {
      valid: false,
      sanitized: '',
      error: `Property not allowed: ${property}`,
    }
  }

  // Check for dangerous patterns in value
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      return {
        valid: false,
        sanitized: '',
        error: `Dangerous pattern detected in value: ${property}`,
      }
    }
  }

  // Validate URL if present (allow only url() format for safe properties)
  if (value.includes('url(')) {
    const urlPattern = /url\s*\(\s*['"]?(?!javascript:|data:|vbscript:)[^'"()]*['"]?\s*\)/gi
    if (!urlPattern.test(value)) {
      return {
        valid: false,
        sanitized: '',
        error: `Invalid or unsafe URL in value: ${property}`,
      }
    }
  }

  return { valid: true, sanitized: `${property}: ${value}` }
}

/**
 * Sanitizes CSS rules and returns valid CSS with any errors
 * @param css - Raw CSS string (can be multiple declarations separated by semicolons)
 * @returns Object containing validity status, sanitized CSS, and array of errors
 */
export function sanitizeCSS(css: string): SanitizationResult {
  if (!css || typeof css !== 'string') {
    return { valid: false, sanitized: '', errors: ['Invalid CSS: empty or not a string'] }
  }

  // Check for dangerous patterns first
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(css)) {
      return {
        valid: false,
        sanitized: '',
        errors: ['Dangerous pattern detected in CSS'],
      }
    }
  }

  // Split by semicolon and process each declaration
  const declarations = css
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
  const sanitizedDeclarations: string[] = []
  const errors: string[] = []

  for (const decl of declarations) {
    const result = sanitizeCSSDeclaration(decl)
    if (result.valid && result.sanitized) {
      sanitizedDeclarations.push(result.sanitized)
    } else if (result.error) {
      errors.push(result.error)
    }
  }

  // If no valid declarations, it's invalid
  if (sanitizedDeclarations.length === 0 && errors.length === 0) {
    return {
      valid: false,
      sanitized: '',
      errors: ['No valid CSS declarations found'],
    }
  }

  const sanitized = sanitizedDeclarations.join('; ')

  return {
    valid: sanitizedDeclarations.length > 0,
    sanitized: sanitized ? `${sanitized};` : '',
    errors,
  }
}

/**
 * Validates a CSS class name
 * @param className - The class name to validate
 * @returns True if valid, false otherwise
 */
export function isValidClassName(className: string): boolean {
  // CSS class names should only contain letters, numbers, hyphens, and underscores
  // Cannot start with a number or hyphen followed by a number
  const classNamePattern = /^[a-zA-Z_][-a-zA-Z0-9_]*$/
  return classNamePattern.test(className)
}

/**
 * Sanitizes a CSS class name
 * @param className - The class name to sanitize
 * @returns Sanitized class name or empty string if invalid
 */
export function sanitizeClassName(className: string): string {
  if (!className || typeof className !== 'string') return ''

  // Convert to lowercase and replace invalid characters with hyphens
  let sanitized = className.toLowerCase().replace(/[^a-z0-9_-]/g, '-')

  // Remove leading numbers or hyphens followed by numbers
  sanitized = sanitized.replace(/^(-?\d)/, 'c-$1')

  // Remove consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-')

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '')

  return sanitized
}
