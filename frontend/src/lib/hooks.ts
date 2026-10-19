import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, tokenStore } from './api'
import type {
  Experience,
  ExperienceInput,
  Message,
  Post,
  PostInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
  Testimonial,
  TestimonialInput,
  VoteResult,
} from './types'

export function useToken(): string | null {
  return tokenStore.get()
}

export function useProjects(params: { tag?: string; featured?: boolean } = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.projects.list(params),
  })
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.projects.get(slug as string),
    enabled: Boolean(slug),
  })
}

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: api.posts.list })
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.posts.get(slug as string),
    enabled: Boolean(slug),
  })
}

export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: api.skills.list })
}

export function useExperiences() {
  return useQuery({ queryKey: ['experiences'], queryFn: api.experiences.list })
}

export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: api.testimonials.list })
}

export function useVoteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, value }: { projectId: number; value: number }) =>
      api.projects.vote(projectId, value),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['project'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['vote', variables.projectId] })
    },
  })
}

export function useSubmitTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { data: TestimonialInput; avatar?: File | null }) =>
      api.testimonials.submit(input.data, input.avatar),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: (body: { name: string; email: string; subject: string; body: string }) =>
      api.messages.create(body),
  })
}

export function useAdminStats(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: api.admin.stats, enabled })
}

export function useAdminProjects(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'projects'], queryFn: api.admin.projects.list, enabled })
}

export function useAdminPosts(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'posts'], queryFn: api.admin.posts.list, enabled })
}

export function useAdminSkills(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'skills'], queryFn: api.admin.skills.list, enabled })
}

export function useAdminExperiences(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'experiences'],
    queryFn: api.admin.experiences.list,
    enabled,
  })
}

export function useAdminMessages(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'messages'], queryFn: () => api.admin.messages.list(), enabled })
}

export function useAdminTestimonials(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => api.admin.testimonials.list(),
    enabled,
  })
}

export function useTestimonialMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
  return {
    setStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        api.admin.testimonials.setStatus(id, status),
      onSuccess: () => {
        invalidate()
        qc.invalidateQueries({ queryKey: ['testimonials'] })
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.testimonials.remove(id),
      onSuccess: () => {
        invalidate()
        qc.invalidateQueries({ queryKey: ['testimonials'] })
        qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      },
    }),
  }
}

export function useProjectMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] })
  return {
    create: useMutation({
      mutationFn: (body: ProjectInput) => api.admin.projects.create(body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
        invalidate()
      },
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ProjectInput }) =>
        api.admin.projects.update(id, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
        invalidate()
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.projects.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
        invalidate()
      },
    }),
  }
}

export function usePostMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['posts'] })
  return {
    create: useMutation({
      mutationFn: (body: PostInput) => api.admin.posts.create(body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
        invalidate()
      },
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: PostInput }) =>
        api.admin.posts.update(id, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
        invalidate()
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.posts.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
        invalidate()
      },
    }),
  }
}

export function useSkillMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['skills'] })
  return {
    create: useMutation({
      mutationFn: (body: SkillInput) => api.admin.skills.create(body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'skills'] })
        invalidate()
      },
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Partial<SkillInput> }) =>
        api.admin.skills.update(id, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'skills'] })
        invalidate()
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.skills.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'skills'] })
        invalidate()
      },
    }),
  }
}

export function useExperienceMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['experiences'] })
  return {
    create: useMutation({
      mutationFn: (body: ExperienceInput) => api.admin.experiences.create(body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'experiences'] })
        invalidate()
      },
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Partial<ExperienceInput> }) =>
        api.admin.experiences.update(id, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'experiences'] })
        invalidate()
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.experiences.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'experiences'] })
        invalidate()
      },
    }),
  }
}

export function useMessageMutations() {
  const qc = useQueryClient()
  return {
    markRead: useMutation({
      mutationFn: ({ id, is_read }: { id: number; is_read: boolean }) =>
        api.admin.messages.markRead(id, is_read),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'messages'] }),
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.admin.messages.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'messages'] })
        qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      },
    }),
  }
}

export type { Experience, Message, Post, Project, Skill, Testimonial, VoteResult }
