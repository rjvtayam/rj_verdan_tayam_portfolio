import Reveal from '../components/Reveal'
import SkillRadar from '../components/SkillRadar'
import StarRating from '../components/StarRating'
import TestimonialsSection from '../components/TestimonialsSection'
import { useExperiences, useSkills } from '../lib/hooks'

const PRINCIPLES = [
  {
    n: '01',
    title: 'SHIP MEASURABLE WORK',
    body: 'Every project ships with numbers — latency, coverage, conversion. If it cannot be measured, it is a guess.',
  },
  {
    n: '02',
    title: 'TYPE EVERYTHING',
    body: 'Pydantic schemas on the server, TypeScript on the client, one API contract between them.',
  },
  {
    n: '03',
    title: 'MOBILE IS THE DEFAULT',
    body: 'Layouts start at 360px and gain structure at each breakpoint. No overflow, no pinch-zoom.',
  },
]

const EDUCATION = [
  {
    institution: 'Laguna State Polytechnic University — Siniloan Campus',
    degree: 'Bachelor of Science in Information Technology (WMAD)',
    period: '2022 — 2026',
    note: 'Web & Mobile Application Development track',
  },
]

const CERTIFICATIONS = [
  { name: 'Star Web Development & UX/UI Design Award', issuer: 'Zuitt', year: '2024', award: true },
  { name: 'Web Development Bootcamp', issuer: 'GoIT Philippines', year: '2024', award: false },
  { name: 'Machine Learning with Python', issuer: 'freeCodeCamp', year: '2025', award: false },
  { name: 'College Algebra with Python', issuer: 'freeCodeCamp', year: '2025', award: false },
  { name: 'Data Visualization', issuer: 'Zuitt', year: '2025', award: false },
]

function dateLabel(value: string | null): string {
  if (!value) return 'PRESENT'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }).toUpperCase()
}

export default function AboutPage() {
  const { data: skills = [] } = useSkills()
  const { data: experiences = [] } = useExperiences()

  const categories = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    ;(acc[skill.category] ??= []).push(skill)
    return acc
  }, {})

  return (
    <>
      <header className="grid-bg relative overflow-hidden border-b border-line">
        <div className="starfield" aria-hidden="true" />
        <div className="aurora">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <Reveal>
            <p className="label mb-3">/// ABOUT</p>
            <h1 className="section-title text-[clamp(2.2rem,1.4rem+3.4vw,3.6rem)]">
              Engineer first. <span className="text-accent">Designer</span> on purpose.
            </h1>
          </Reveal>
          <Reveal delay={0.08} className="mt-6 grid gap-6 md:grid-cols-2">
            <p className="leading-relaxed text-mute">
              I&apos;m R.J. Verdan Tayam, a full-stack web developer. I build products end to end:
              database schema and migrations, typed APIs, and the interface people actually touch.
            </p>
            <p className="leading-relaxed text-mute">
              My default stack is React + FastAPI + PostgreSQL — not because it is trendy, but
              because it makes contracts explicit and systems easy to reason about six months later.
            </p>
          </Reveal>
        </div>
      </header>

      {/* principles */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <div className="brutal h-full bg-surface p-6">
                <p className="font-mono text-xs font-bold tracking-widest text-accent">[{p.n}]</p>
                <h3 className="mt-4 font-mono text-lg font-bold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* skills */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Reveal>
            <p className="label mb-3">/// TOOLKIT</p>
            <h2 className="section-title">Skills I use to ship</h2>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
            <Reveal className="brutal-flat h-fit bg-bg p-5">
              <p className="label mb-4 border-b border-line-soft pb-2">coverage map</p>
              <SkillRadar skills={skills} />
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {Object.entries(categories).map(([category, list], ci) => (
                <Reveal key={category} delay={ci * 0.06}>
                  <div className="brutal-flat h-full bg-bg p-5">
                    <p className="label mb-4 border-b border-line-soft pb-2">{category}</p>
                    <ul className="space-y-3">
                      {list.map((skill) => (
                        <li key={skill.id} className="flex items-center justify-between gap-3">
                          <span className="font-mono text-sm">{skill.name}</span>
                          <StarRating value={skill.proficiency} size={13} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* experience */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <p className="label mb-3">/// TRAJECTORY</p>
          <h2 className="section-title">Experience</h2>
        </Reveal>

        <div className="mt-12 border-l border-line pl-6 sm:pl-10">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.08} className="relative pb-12 last:pb-0">
              <span className="absolute top-1.5 -left-[31px] h-3 w-3 border border-line bg-accent sm:-left-[47px]" />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-mono text-xl font-bold tracking-tight">{exp.role}</h3>
                <span className="font-mono text-sm text-accent">{exp.company}</span>
                <span className="label ml-auto">
                  {dateLabel(exp.start_date)} — {dateLabel(exp.end_date)}
                </span>
              </div>
              <ul className="mt-4 max-w-2xl space-y-2 text-sm leading-relaxed text-mute">
                {exp.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="text-accent">▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* education */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Reveal>
            <p className="label mb-3">/// EDUCATION</p>
            <h2 className="section-title">Where I studied</h2>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {EDUCATION.map((ed) => (
              <Reveal key={ed.institution}>
                <div className="brutal brutal-hover h-full bg-bg p-6">
                  <p className="font-mono text-xs font-bold tracking-widest text-accent">
                    {ed.period}
                  </p>
                  <h3 className="mt-4 font-mono text-lg leading-snug font-bold tracking-tight">
                    {ed.institution}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{ed.degree}</p>
                  <p className="mt-3 font-mono text-xs tracking-widest text-mute uppercase">
                    {ed.note}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.08}>
              <div className="neon-card h-full p-6" style={{ ['--card-neon' as string]: 'var(--neon-6)' }}>
                <p className="label mb-3">Also completed</p>
                <ul className="space-y-2 font-mono text-sm text-mute">
                  <li>• Senior High School — Jomalig National High School</li>
                  <li>• High School — Jomalig National High School</li>
                  <li>• Elementary — Jomalig Central Elementary School</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* certifications & awards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <Reveal>
          <p className="label mb-3">/// CERTIFICATIONS &amp; AWARDS</p>
          <h2 className="section-title">
            Certified &amp; <span className="text-accent">award-winning</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATIONS.map((cert, i) => (
            <Reveal key={cert.name} delay={i * 0.06}>
              <div
                className="neon-card flex h-full flex-col gap-2 p-5"
                style={{
                  ['--card-neon' as string]: cert.award ? 'var(--neon-3)' : 'var(--neon-2)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="label">{cert.issuer}</span>
                  <span className="font-mono text-[0.65rem] tracking-widest text-mute">
                    {cert.year}
                  </span>
                </div>
                <p
                  className={`font-mono text-sm leading-snug font-bold ${
                    cert.award ? 'neon-text' : ''
                  }`}
                >
                  {cert.award ? '★ ' : ''}
                  {cert.name}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* testimonials */}
      <TestimonialsSection />
    </>
  )
}
