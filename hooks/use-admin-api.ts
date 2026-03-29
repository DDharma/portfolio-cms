'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/axios-instance'
import { ADMIN_ENDPOINTS } from '@/lib/api/endpoints'
import { AboutContent } from '@/lib/validations/about.schema'
import { SkillCategory } from '@/lib/validations/skills.schema'
import { ExperienceItem } from '@/lib/validations/experience.schema'
import { Project } from '@/lib/validations/projects.schema'
import { BlogPost } from '@/lib/validations/blog.schema'
import { ResearchPaper } from '@/lib/validations/research.schema'
import { HeroContent } from '@/lib/validations/hero.schema'
import { GalleryPhoto } from '@/lib/validations/gallery.schema'
import { SectionMetadata } from '@/lib/validations/section-metadata.schema'
import { ContactSettings } from '@/lib/validations/contact.schema'

// ============ QUERY KEYS ============
export const QUERY_KEYS = {
  DASHBOARD: ['dashboard'],
  HERO: ['hero'],
  ABOUT: ['about'],
  SKILLS: ['skills'],
  EXPERIENCE: ['experience'],
  PROJECTS: ['projects'],
  BLOG: ['blog'],
  RESEARCH: ['research'],
  GALLERY: ['gallery'],
  SECTION_METADATA: ['section_metadata'],
  CONTACT: ['contact_settings'],
} as const

// ============ DASHBOARD ============

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.DASHBOARD)
      return response.data
    },
  })
}

// ============ HERO HOOKS ============

export function useCreateHero() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: HeroContent) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.HERO.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HERO })
    },
  })
}

export function useUpdateHero() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HeroContent }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.HERO.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HERO })
    },
  })
}

export function useHeroList() {
  return useQuery({
    queryKey: QUERY_KEYS.HERO,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.HERO.LIST)
      return response.data // Return just the data array
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useHeroById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.HERO, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.HERO.GET(id))
      return response
    },
    enabled: !!id, // Only fetch if id exists
  })
}

export function useDeleteHero() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.HERO.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HERO })
    },
  })
}

// ============ ABOUT HOOKS ============

export function useAboutList() {
  return useQuery({
    queryKey: QUERY_KEYS.ABOUT,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.ABOUT.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useAboutById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ABOUT, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.ABOUT.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useCreateAbout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AboutContent) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.ABOUT.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ABOUT })
    },
  })
}

export function useUpdateAbout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AboutContent }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.ABOUT.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ABOUT })
    },
  })
}

export function useDeleteAbout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.ABOUT.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ABOUT })
    },
  })
}

// ============ SKILLS HOOKS ============

export function useCreateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SkillCategory) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.SKILLS.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS })
    },
  })
}

export function useUpdateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SkillCategory }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.SKILLS.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS })
    },
  })
}

export function useSkillsList() {
  return useQuery({
    queryKey: QUERY_KEYS.SKILLS,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.SKILLS.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useSkillsById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SKILLS, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.SKILLS.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.SKILLS.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS })
    },
  })
}

// ============ EXPERIENCE HOOKS ============

export function useCreateExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ExperienceItem) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.EXPERIENCE.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPERIENCE })
    },
  })
}

export function useUpdateExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExperienceItem }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.EXPERIENCE.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPERIENCE })
    },
  })
}

export function useExperienceList() {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIENCE,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.EXPERIENCE.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useExperienceById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXPERIENCE, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.EXPERIENCE.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.EXPERIENCE.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPERIENCE })
    },
  })
}

// ============ PROJECTS HOOKS ============

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Project) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.PROJECTS.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Project }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.PROJECTS.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS })
    },
  })
}

export function useProjectsList() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.PROJECTS.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useProjectsById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROJECTS, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.PROJECTS.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.PROJECTS.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS })
    },
  })
}

// ============ BLOG HOOKS ============

export function useCreateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BlogPost) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.BLOG.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOG })
    },
  })
}

export function useUpdateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlogPost }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.BLOG.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOG })
    },
  })
}

export function useBlogList() {
  return useQuery({
    queryKey: QUERY_KEYS.BLOG,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.BLOG.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useBlogById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BLOG, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.BLOG.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.BLOG.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOG })
    },
  })
}

// ============ RESEARCH HOOKS ============

export function useCreateResearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ResearchPaper) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.RESEARCH.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH })
    },
  })
}

export function useUpdateResearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResearchPaper }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.RESEARCH.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH })
    },
  })
}

export function useResearchList() {
  return useQuery({
    queryKey: QUERY_KEYS.RESEARCH,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.RESEARCH.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useResearchById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.RESEARCH, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.RESEARCH.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteResearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.RESEARCH.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH })
    },
  })
}

// ============ GALLERY HOOKS ============

export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: GalleryPhoto) => {
      const { data: response } = await apiClient.post(ADMIN_ENDPOINTS.GALLERY.CREATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GALLERY })
    },
  })
}

export function useUpdateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GalleryPhoto }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.GALLERY.UPDATE(id), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GALLERY })
    },
  })
}

export function useGalleryList() {
  return useQuery({
    queryKey: QUERY_KEYS.GALLERY,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.GALLERY.LIST)
      return response.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useGalleryById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.GALLERY, id],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.GALLERY.GET(id))
      return response
    },
    enabled: !!id,
  })
}

export function useDeleteGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(ADMIN_ENDPOINTS.GALLERY.DELETE(id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GALLERY })
    },
  })
}

export function useToggleGalleryFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { data } = await apiClient.patch(`/api/admin/gallery/${id}/feature`, { is_featured })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GALLERY })
    },
  })
}

// ============ SECTION METADATA HOOKS ============

export function useSectionMetadata(key: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SECTION_METADATA, key],
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.SECTION_METADATA.GET(key))
      return response.data
    },
    enabled: !!key,
  })
}

export function useUpdateSectionMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: Partial<SectionMetadata> }) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.SECTION_METADATA.UPDATE(key), data)
      return response
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.SECTION_METADATA, key] })
    },
  })
}

// ============ CONTACT SETTINGS ============

export function useContactSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.CONTACT,
    queryFn: async () => {
      const { data: response } = await apiClient.get(ADMIN_ENDPOINTS.CONTACT.GET)
      return response.data as ContactSettings
    },
  })
}

export function useUpdateContactSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<ContactSettings>) => {
      const { data: response } = await apiClient.patch(ADMIN_ENDPOINTS.CONTACT.UPDATE, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACT })
    },
  })
}
