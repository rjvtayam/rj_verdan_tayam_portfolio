import { FileCode2, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const RESUMES: { href: string; label: string; hint: string; Icon: LucideIcon }[] = [
  {
    href: '/resumes/RJVT-PROFESSIONAL-IT-RESUME.pdf',
    label: 'TECH RESUME',
    hint: 'dev · design',
    Icon: FileCode2,
  },
  {
    href: '/resumes/RJVT-GENERAL-CV.pdf',
    label: 'GENERAL CV',
    hint: 'all roles',
    Icon: FileText,
  },
]
