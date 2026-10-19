import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export const inputCls =
  'w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-mute focus:border-accent'

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`brutal-flat bg-surface p-5 sm:p-6 ${className}`}>{children}</div>
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[0.65rem] text-mute">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y ${props.className ?? ''}`} />
}

export function Btn({
  variant = 'solid',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' | 'danger' }) {
  const styles = {
    solid: 'bg-accent text-accent-ink border-line',
    ghost: 'bg-surface hover:border-accent',
    danger: 'bg-surface text-accent hover:bg-accent hover:text-accent-ink',
  }[variant]
  return (
    <button
      {...props}
      className={`brutal-flat inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-xs font-bold tracking-widest transition-colors disabled:opacity-50 ${styles} ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="border border-accent bg-bg px-4 py-3 font-mono text-xs text-accent">{message}</p>
  )
}
