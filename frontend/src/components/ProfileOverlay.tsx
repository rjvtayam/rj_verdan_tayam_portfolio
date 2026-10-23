import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Church,
  Download,
  Flag,
  Globe,
  GraduationCap,
  Heart,
  Languages,
  Mail,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { PHOTOS, PROFILE, type PersonalDetail } from '../lib/profile'
import { RESUMES } from '../lib/resumes'
import { HBars } from './charts'
import OverlayShell from './OverlayShell'
import PhotoCarousel from './PhotoCarousel'
import { FacebookIcon } from './SocialIcons'

const ICONS: Record<
  PersonalDetail['icon'],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  calendar: Calendar,
  'map-pin': MapPin,
  user: UserRound,
  heart: Heart,
  flag: Flag,
  church: Church,
  languages: Languages,
  phone: Phone,
  mail: Mail,
  facebook: FacebookIcon,
  globe: Globe,
}

function SectionLabel({ icon: Icon, text }: { icon: typeof Award; text: string }) {
  return (
    <p className="label mb-4 flex items-center gap-2">
      <Icon size={13} className="text-accent" />
      {text}
    </p>
  )
}

export default function ProfileOverlay({ onClose }: { onClose: () => void }) {
  return (
    <OverlayShell
      onClose={onClose}
      label="/// PROFILE · BASIC INFORMATION"
      title={PROFILE.brand}
      ariaLabel="Profile of Ricky Jhon V. Tayam"
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          title="Print or save as PDF"
          className="brutal-flat hidden items-center gap-2 bg-bg px-3 py-2.5 font-mono text-[0.7rem] tracking-widest transition-colors hover:text-accent sm:flex"
        >
          <Printer size={14} /> PRINT
        </button>
      }
    >
      <div className="space-y-7 sm:space-y-8">
          {/* identity + carousel */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            <PhotoCarousel photos={PHOTOS} />
            <div className="flex flex-col justify-center gap-4">
              <div>
                <h3 className="section-title text-[clamp(1.35rem,1rem+1.8vw,1.9rem)]">
                  {PROFILE.name}
                </h3>
                <p className="mt-2 font-mono text-xs font-bold tracking-[0.2em] text-accent">
                  {PROFILE.title}
                </p>
                <p className="font-mono text-[0.7rem] tracking-[0.2em] text-mute">
                  {PROFILE.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="brutal-flat inline-flex items-center gap-1.5 bg-bg px-3 py-1.5 font-mono text-[0.65rem] tracking-widest">
                  <MapPin size={12} className="text-accent" /> JOMALIG, QUEZON
                </span>
                <a
                  href="tel:+639661855866"
                  className="brutal-flat inline-flex items-center gap-1.5 bg-bg px-3 py-1.5 font-mono text-[0.65rem] tracking-widest transition-colors hover:text-accent"
                >
                  <Phone size={12} className="text-accent" /> +63 966 185 5866
                </a>
                <a
                  href="mailto:rickyjhon.tayam@gmail.com"
                  className="brutal-flat inline-flex items-center gap-1.5 bg-bg px-3 py-1.5 font-mono text-[0.65rem] tracking-widest transition-colors hover:text-accent"
                >
                  <Mail size={12} className="text-accent" /> EMAIL
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                {RESUMES.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    download
                    className="brutal brutal-hover inline-flex items-center gap-2 bg-accent px-4 py-2.5 font-mono text-[0.7rem] font-bold tracking-widest text-accent-ink"
                  >
                    <Icon size={14} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* personal details */}
          <section>
            <SectionLabel icon={UserRound} text="// PERSONAL DETAILS" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILE.personal.map((d) => {
                const Icon = ICONS[d.icon]
                const content = (
                  <>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-accent">
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.6rem] tracking-widest text-mute uppercase">
                        {d.label}
                      </span>
                      <span className="block font-mono text-[0.78rem] leading-snug font-bold break-words">
                        {d.value}
                      </span>
                    </span>
                  </>
                )
                return d.href ? (
                  <a
                    key={d.label + d.value}
                    href={d.href}
                    {...(d.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="brutal brutal-hover flex items-start gap-3 bg-bg p-4"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={d.label + d.value} className="brutal flex items-start gap-3 bg-bg p-4">
                    {content}
                  </div>
                )
              })}
            </div>
          </section>

          {/* objective + summary */}
          <section className="grid gap-5 lg:grid-cols-2">
            <div
              className="neon-card p-6"
              style={{ ['--card-neon' as string]: 'var(--neon-2)' }}
            >
              <SectionLabel icon={Sparkles} text="// OBJECTIVE" />
              <p className="text-sm leading-relaxed text-mute">{PROFILE.objective}</p>
            </div>
            <div
              className="neon-card p-6"
              style={{ ['--card-neon' as string]: 'var(--neon-1)' }}
            >
              <SectionLabel icon={BookOpen} text="// PROFESSIONAL SUMMARY" />
              <p className="text-sm leading-relaxed text-mute">{PROFILE.summary}</p>
            </div>
          </section>

          {/* education */}
          <section>
            <SectionLabel icon={GraduationCap} text="// EDUCATION" />
            <ul className="space-y-3">
              {PROFILE.education.map((ed) => (
                <li
                  key={ed.period + ed.school}
                  className="brutal flex flex-col gap-1 bg-bg p-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-fit shrink-0 font-mono text-[0.65rem] font-bold tracking-widest text-accent sm:w-32">
                    {ed.period}
                  </span>
                  <span>
                    <b className="font-mono text-sm">{ed.school}</b>
                    <span className="block text-xs text-mute">{ed.degree}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* experience */}
          <section>
            <SectionLabel icon={Briefcase} text="// EXPERIENCE · TECH ROLES" />
            <ul className="space-y-3">
              {PROFILE.experience.map((ex) => (
                <li
                  key={ex.period + ex.role}
                  className="brutal flex flex-col gap-1 bg-bg p-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-fit shrink-0 font-mono text-[0.65rem] font-bold tracking-widest text-accent sm:w-32">
                    {ex.period}
                  </span>
                  <span>
                    <b className="font-mono text-sm">{ex.role}</b>
                    <span className="block text-xs text-mute">
                      {ex.company} — {ex.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[0.62rem] tracking-widest text-mute">
              NON-TECH ROLES (IZUMI · DREAM LAND ARCADE · JOMALIG SPES) ARE LISTED IN THE DOWNLOADABLE CV.
            </p>
          </section>

          {/* certifications */}
          <section>
            <SectionLabel icon={Award} text="// CERTIFICATIONS & AWARDS" />
            <div className="flex flex-wrap gap-3">
              {PROFILE.certifications.map((c) => (
                <span
                  key={c.name}
                  className="brutal-flat inline-flex items-center gap-2 bg-bg px-3.5 py-2 font-mono text-[0.68rem] font-bold"
                  style={
                    c.award
                      ? { color: 'var(--neon-1)', borderColor: 'var(--neon-1)' }
                      : undefined
                  }
                >
                  {c.award ? '★ ' : ''}
                  {c.name}
                  <span className="text-mute">
                    {c.issuer} · {c.year}
                  </span>
                </span>
              ))}
            </div>
          </section>

          {/* modules + soft skills */}
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="neon-card p-6" style={{ ['--card-neon' as string]: 'var(--neon-6)' }}>
              <SectionLabel icon={BookOpen} text="// RELEVANT MODULES" />
              <HBars
                data={PROFILE.modules.map((m) => ({
                  label: m.name,
                  value: m.pct,
                  display: `${m.pct}%`,
                  color: 'var(--neon-6)',
                }))}
                max={100}
              />
            </div>
            <div className="neon-card p-6" style={{ ['--card-neon' as string]: 'var(--neon-3)' }}>
              <SectionLabel icon={Users} text="// SOFT SKILLS" />
              <div className="flex flex-wrap gap-2.5">
                {PROFILE.softSkills.map((s) => (
                  <span
                    key={s}
                    className="brutal-flat bg-bg px-3 py-1.5 font-mono text-[0.68rem] font-bold tracking-wide"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <SectionLabel icon={Heart} text="// INTERESTS" />
                <div className="flex flex-wrap gap-2.5">
                  {PROFILE.interests.map((s) => (
                    <span
                      key={s}
                      className="brutal-flat bg-bg px-3 py-1.5 font-mono text-[0.68rem] text-mute"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* references */}
          <section>
            <SectionLabel icon={Users} text="// REFERENCES" />
            <div className="grid gap-4 sm:grid-cols-3">
              {PROFILE.references.map((r, i) => (
                <div
                  key={r.name}
                  className="neon-card p-5"
                  style={{
                    ['--card-neon' as string]: ['var(--neon-2)', 'var(--neon-5)', 'var(--neon-4)'][i % 3],
                  }}
                >
                  <p className="font-mono text-sm font-bold">{r.name}</p>
                  <p className="mt-1 text-xs text-mute">{r.role}</p>
                  <p className="font-mono text-[0.62rem] tracking-widest text-mute uppercase">{r.org}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="flex items-center justify-center gap-2 border-t border-line pt-5 font-mono text-[0.62rem] tracking-widest text-mute">
            <Download size={12} /> FULL CV AVAILABLE AS PDF FROM THE HUD OR ABOVE
          </p>
      </div>
    </OverlayShell>
  )
}
