'use client'

import { useEffect } from 'react'

interface CustomStyle {
  id: string
  name: string
  css_rules: string
  is_active?: boolean
}

interface DynamicStylesProviderProps {
  styles?: CustomStyle[]
}

/**
 * Dynamically injects custom CSS styles into the page
 * Used to load WordPress-like custom CSS classes from the database
 */
export function DynamicStylesProvider({ styles }: DynamicStylesProviderProps) {
  useEffect(() => {
    if (!styles || styles.length === 0) return

    // Create or get existing style tag
    let styleTag = document.getElementById('custom-cms-styles') as HTMLStyleElement | null

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'custom-cms-styles'
      styleTag.type = 'text/css'
      document.head.appendChild(styleTag)
    }

    // Generate CSS from custom styles
    const cssContent = styles
      .filter(style => style.is_active !== false) // Exclude inactive styles
      .map(style => `.${style.name} { ${style.css_rules} }`)
      .join('\n')

    // Set the style content
    if ((styleTag as any).styleSheet) {
      // IE fallback
      (styleTag as any).styleSheet.cssText = cssContent
    } else {
      styleTag.textContent = cssContent
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DynamicStylesProvider] Injected custom styles:', styles.length)
      console.log('[DynamicStylesProvider] CSS Content:', cssContent)
      styles.forEach(s => {
        console.log(`[DynamicStylesProvider] Style: ${s.name} => ${s.css_rules}`)
      })
    }

    return () => {
      // Cleanup: remove the style tag when component unmounts
      // But keep it to avoid re-rendering issues
      // Uncomment if you want to remove on unmount
      // if (styleTag && styleTag.parentNode) {
      //   styleTag.parentNode.removeChild(styleTag)
      // }
    }
  }, [styles])

  // This is a non-rendering component
  return null
}

/**
 * Hook to fetch and provide custom styles
 * Usage in Server Components:
 * const { data: styles } = await supabase
 *   .from('custom_styles')
 *   .select('*')
 *   .eq('is_active', true)
 *
 * Then pass to DynamicStylesProvider:
 * <DynamicStylesProvider styles={styles || []} />
 */
export async function getCustomStyles(supabase: any): Promise<CustomStyle[]> {
  try {
    const { data, error } = await supabase
      .from('custom_styles')
      .select('id, name, css_rules, is_active')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to fetch custom styles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching custom styles:', error)
    return []
  }
}
