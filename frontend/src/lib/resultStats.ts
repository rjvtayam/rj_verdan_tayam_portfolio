import {
  BarChart3,
  Bot,
  Bug,
  Building2,
  CalendarDays,
  CheckCircle2,
  Code,
  Container,
  Database,
  FileText,
  Flag,
  FlaskConical,
  GitBranch,
  Layers,
  LayoutGrid,
  Package,
  Palette,
  Percent,
  Radio,
  RefreshCw,
  Route,
  Shield,
  Terminal,
  Trophy,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

/** Plain integers and "15/15"-style pairs count up; anything else renders as-is. */
const NUMERIC = /^(\d+)(?:\/(\d+))?$/

/** A countable stat: a numerator, plus an optional "/denominator" pair. */
export type CountStat = { numerator: number; denominator: number | null }

/** A stat value is either countable ("15", "15/15") or plain text ("SF9 + SF10"). */
export type ParsedStat =
  | ({ kind: 'count' } & CountStat & { startText: string })
  | { kind: 'text'; text: string }

/** Parse a raw result value into countable components, or plain text as-is. */
export function parseStat(value: string): ParsedStat {
  const m = NUMERIC.exec(value)
  if (!m) return { kind: 'text', text: value }
  const denominator = m[2] !== undefined ? Number(m[2]) : null
  return {
    kind: 'count',
    numerator: Number(m[1]),
    denominator,
    startText: denominator === null ? '0' : `0/${m[2]}`,
  }
}

/** Text for one animation frame: ease-out cubic on both counters, clamped. */
export function statFrame(stat: CountStat, progress: number): string {
  const p = Math.min(1, Math.max(0, progress))
  const eased = 1 - Math.pow(1 - p, 3)
  const n1 = Math.round(stat.numerator * eased)
  return stat.denominator === null ? String(n1) : `${n1}/${Math.round(stat.denominator * eased)}`
}

/** Keyword → icon so every result stat reads at a glance. First match wins. */
const RESULT_ICON: Array<[RegExp, LucideIcon]> = [
  [/test|qa/i, FlaskConical],
  [/error|lint/i, Bug],
  [/surface|admin|panel/i, LayoutGrid],
  [/branch/i, GitBranch],
  [/table|schema|database/i, Database],
  [/award|star/i, Trophy],
  [/report|card|pdf|sf\d/i, FileText],
  [/live|socket|dashboard/i, Radio],
  [/weight/i, Percent],
  [/quarter|semester|period/i, CalendarDays],
  [/flow|schedul/i, Workflow],
  [/office|campus/i, Building2],
  [/status|prototype/i, Flag],
  [/\bai\b|helper/i, Bot],
  [/security|csrf|auth|middleware/i, Shield],
  [/theme|interface/i, Palette],
  [/refresh|reload/i, RefreshCw],
  [/analytic|metric|view/i, BarChart3],
  [/validat/i, CheckCircle2],
  [/service layer|feature/i, Layers],
  [/order|state/i, Package],
  [/route|module/i, Route],
  [/deploy/i, Container],
  [/type safety/i, Code],
  [/language|backend/i, Terminal],
  [/role|user|student|faculty|access|trust/i, Users],
]

/** Icon for a result label, falling back to a generic bar chart. */
export function resultIcon(label: string): LucideIcon {
  return RESULT_ICON.find(([re]) => re.test(label))?.[1] ?? BarChart3
}
