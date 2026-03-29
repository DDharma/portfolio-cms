// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Auth endpoints (not used with React Query - keep using fetch)
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
} as const

// Admin API endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/api/admin/dashboard',

  // Hero Section
  HERO: {
    LIST: '/api/admin/hero',
    CREATE: '/api/admin/hero',
    GET: (id: string) => `/api/admin/hero/${id}`,
    UPDATE: (id: string) => `/api/admin/hero/${id}`,
    DELETE: (id: string) => `/api/admin/hero/${id}`,
  },

  // About Section
  ABOUT: {
    LIST: '/api/admin/about',
    CREATE: '/api/admin/about',
    GET: (id: string) => `/api/admin/about/${id}`,
    UPDATE: (id: string) => `/api/admin/about/${id}`,
    DELETE: (id: string) => `/api/admin/about/${id}`,
  },

  // Skills Section
  SKILLS: {
    LIST: '/api/admin/skills',
    CREATE: '/api/admin/skills',
    GET: (id: string) => `/api/admin/skills/${id}`,
    UPDATE: (id: string) => `/api/admin/skills/${id}`,
    DELETE: (id: string) => `/api/admin/skills/${id}`,
  },

  // Experience Section
  EXPERIENCE: {
    LIST: '/api/admin/experience',
    CREATE: '/api/admin/experience',
    GET: (id: string) => `/api/admin/experience/${id}`,
    UPDATE: (id: string) => `/api/admin/experience/${id}`,
    DELETE: (id: string) => `/api/admin/experience/${id}`,
  },

  // Projects Section
  PROJECTS: {
    LIST: '/api/admin/projects',
    CREATE: '/api/admin/projects',
    GET: (id: string) => `/api/admin/projects/${id}`,
    UPDATE: (id: string) => `/api/admin/projects/${id}`,
    DELETE: (id: string) => `/api/admin/projects/${id}`,
  },

  // Blog Section
  BLOG: {
    LIST: '/api/admin/blog',
    CREATE: '/api/admin/blog',
    GET: (id: string) => `/api/admin/blog/${id}`,
    UPDATE: (id: string) => `/api/admin/blog/${id}`,
    DELETE: (id: string) => `/api/admin/blog/${id}`,
  },

  // Research Section
  RESEARCH: {
    LIST: '/api/admin/research',
    CREATE: '/api/admin/research',
    GET: (id: string) => `/api/admin/research/${id}`,
    UPDATE: (id: string) => `/api/admin/research/${id}`,
    DELETE: (id: string) => `/api/admin/research/${id}`,
  },

  // Gallery Section
  GALLERY: {
    LIST: '/api/admin/gallery',
    CREATE: '/api/admin/gallery',
    GET: (id: string) => `/api/admin/gallery/${id}`,
    UPDATE: (id: string) => `/api/admin/gallery/${id}`,
    DELETE: (id: string) => `/api/admin/gallery/${id}`,
  },

  // Media
  MEDIA: {
    UPLOAD: '/api/admin/media/upload',
  },

  // Section Metadata
  SECTION_METADATA: {
    GET: (key: string) => `/api/admin/section-metadata/${key}`,
    UPDATE: (key: string) => `/api/admin/section-metadata/${key}`,
  },

  // Contact Settings
  CONTACT: {
    GET: '/api/admin/contact',
    UPDATE: '/api/admin/contact',
  },
} as const
