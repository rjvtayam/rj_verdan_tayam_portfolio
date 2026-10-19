import type {
  AdminStats,
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
  TokenResponse,
  User,
  VoteResult,
} from './types'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'
const TOKEN_KEY = 'portfolio_token'
const VISITOR_KEY = 'portfolio_visitor'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function qs(params: Record<string, string | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 204) return undefined as T

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
    }
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed (${res.status})`
    throw new ApiError(res.status, detail)
  }
  return data as T
}

const del = <T,>(path: string) => request<T>(path, { method: 'DELETE' })
const post = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const patch = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
const put = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
const postForm = <T,>(path: string, form: FormData) =>
  request<T>(path, { method: 'POST', body: form })

export const api = {
  auth: {
    login: (email: string, password: string) =>
      post<TokenResponse>('/auth/login', { email, password }),
    me: () => request<User>('/auth/me'),
  },
  projects: {
    list: (params: { tag?: string; featured?: boolean } = {}) =>
      request<Project[]>(`/projects${qs(params)}`),
    get: (slug: string) => request<Project>(`/projects/${encodeURIComponent(slug)}`),
    vote: (projectId: number, value: number) =>
      post<VoteResult>(`/projects/${projectId}/vote`, {
        value,
        visitor_id: getVisitorId(),
      }),
  },
  posts: {
    list: () => request<Post[]>('/posts'),
    get: (slug: string) => request<Post>(`/posts/${encodeURIComponent(slug)}`),
  },
  skills: {
    list: () => request<Skill[]>('/skills'),
  },
  experiences: {
    list: () => request<Experience[]>('/experiences'),
  },
  messages: {
    create: (body: { name: string; email: string; subject: string; body: string }) =>
      post<{ status: string }>('/messages', body),
  },
  testimonials: {
    list: () => request<Testimonial[]>('/testimonials'),
    create: (form: FormData) => postForm<Testimonial>('/testimonials', form),
    submit: (input: TestimonialInput, avatar?: File | null) => {
      const form = new FormData()
      form.set('name', input.name)
      form.set('role', input.role)
      form.set('quote', input.quote)
      form.set('rating', String(input.rating))
      if (avatar) form.set('avatar', avatar)
      return postForm<Testimonial>('/testimonials', form)
    },
  },
  admin: {
    stats: () => request<AdminStats>('/admin/stats'),
    projects: {
      list: () => request<Project[]>('/admin/projects'),
      create: (body: ProjectInput) => post<Project>('/admin/projects', body),
      update: (id: number, body: ProjectInput) => patch<Project>(`/admin/projects/${id}`, body),
      remove: (id: number) => del<void>(`/admin/projects/${id}`),
    },
    posts: {
      list: () => request<Post[]>('/admin/posts'),
      create: (body: PostInput) => post<Post>('/admin/posts', body),
      update: (id: number, body: PostInput) => patch<Post>(`/admin/posts/${id}`, body),
      remove: (id: number) => del<void>(`/admin/posts/${id}`),
    },
    skills: {
      list: () => request<Skill[]>('/admin/skills'),
      create: (body: SkillInput) => post<Skill>('/admin/skills', body),
      update: (id: number, body: Partial<SkillInput>) => patch<Skill>(`/admin/skills/${id}`, body),
      remove: (id: number) => del<void>(`/admin/skills/${id}`),
    },
    experiences: {
      list: () => request<Experience[]>('/admin/experiences'),
      create: (body: ExperienceInput) => post<Experience>('/admin/experiences', body),
      update: (id: number, body: Partial<ExperienceInput>) =>
        patch<Experience>(`/admin/experiences/${id}`, body),
      remove: (id: number) => del<void>(`/admin/experiences/${id}`),
    },
    messages: {
      list: (unread?: boolean) => request<Message[]>(`/admin/messages${qs({ unread })}`),
      markRead: (id: number, is_read: boolean) => patch<Message>(`/admin/messages/${id}`, { is_read }),
      remove: (id: number) => del<void>(`/admin/messages/${id}`),
    },
    testimonials: {
      list: (status?: string) => request<Testimonial[]>(`/admin/testimonials${qs({ status })}`),
      setStatus: (id: number, status: string) =>
        patch<Testimonial>(`/admin/testimonials/${id}`, { status }),
      remove: (id: number) => del<void>(`/admin/testimonials/${id}`),
    },
    changePassword: (current_password: string, new_password: string) =>
      put<User>('/admin/password', { current_password, new_password }),
  },
}
