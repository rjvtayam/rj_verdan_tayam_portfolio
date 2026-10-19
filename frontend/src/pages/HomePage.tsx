import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import CountUp from '../components/CountUp'
import Reveal from '../components/Reveal'
import SectionHeader from '../components/SectionHeader'
import Terminal from '../components/Terminal'
import ProjectCard from '../components/ProjectCard'
import PostCard from '../components/PostCard'
import TestimonialsSection from '../components/TestimonialsSection'
import { usePosts, useProjects, useSkills } from '../lib/hooks'

const TICKER = [
  'REACT',
  'TYPESCRIPT',
  'FASTAPI',
  'POSTGRESQL',
  'TAILWIND CSS',
  'DOCKER',
  'ALEMBIC',
  'TANSTACK QUERY',
  'PYDANTIC',
  'GIT',
  'REST APIS',
  'JWT AUTH',
]

const TERMINAL_LINES = [
  { cmd: 'whoami', out: 'R.J. Verdan Tayam' },
  { cmd: 'cat role.txt', out: 'Full-Stack Web Developer' },
  { cmd: 'cat stack.txt', out: 'React · FastAPI · PostgreSQL' },
  { cmd: 'status --now', out: 'AVAILABLE FOR WORK' },
]

export default function HomePage() {
  const { data: projects = [] } = useProjects()
  const { data: posts = [] } = usePosts()
  const { data: skills = [] } = useSkills()

  const featured = projects.filter((p) => p.featured).slice(0, 3)
  const latest = posts.slice(0, 3)

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="grid-bg relative overflow-hidden border-b border-line">
        <div className="starfield" aria-hidden="true" />
        <span className="scan-line" aria-hidden="true" />
        <div className="aurora">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 md:pt-20 md:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="label mb-6"
              >
                /// FULL-STACK WEB &amp; MOBILE DEVELOPER
              </motion.p>

              <h1 className="display">
                {['R.J. VERDAN', 'TAYAM'].map((line, i) => (
                  <motion.span
                    key={line}
                    className="block"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {i === 1 ? (
                      <>
                        <span className="text-accent">[</span>
                        {line}
                        <span className="text-accent">]</span>
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 }}
                className="mt-6 max-w-lg text-base leading-relaxed text-mute sm:text-lg"
              >
                I&apos;m a BSIT graduate building full-stack web &amp; mobile products — React,
                Python, PostgreSQL and Flutter — from mockups and typed APIs all the way to
                deployment.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.45 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/projects"
                  className="brutal brutal-hover inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-sm font-bold tracking-widest text-accent-ink"
                >
                  VIEW WORK <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="brutal brutal-hover inline-flex items-center gap-2 bg-surface px-6 py-3.5 font-mono text-sm font-bold tracking-widest"
                >
                  GET IN TOUCH
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Terminal lines={TERMINAL_LINES} className="w-full max-w-[440px]" />
            </motion.div>
          </div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 grid grid-cols-2 border-t border-l border-line md:grid-cols-4"
          >
            {[
              { k: 'PROJECTS SHIPPED', value: projects.length },
              { k: 'ARTICLES WRITTEN', value: posts.length },
              { k: 'CORE SKILLS', value: skills.length },
              { k: 'STACK DEPTH', text: 'FULL' },
            ].map((stat) => (
              <div key={stat.k} className="border-r border-b border-line bg-bg px-5 py-5">
                <p className="font-mono text-3xl font-bold">
                  {stat.text ?? (stat.value ? <CountUp value={stat.value} /> : '—')}
                </p>
                <p className="label mt-1">{stat.k}</p>
              </div>
            ))}
          </motion.div>

          {/* scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1 text-mute"
            >
              <span className="label">scroll</span>
              <ChevronDown size={14} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------- ticker ---------- */}
      <div className="overflow-hidden border-b border-line bg-accent py-3 text-accent-ink">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="mx-6 font-mono text-xs font-bold tracking-[0.25em]">
              {item} <span className="opacity-60">//</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- featured work ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <SectionHeader
          label="SELECTED WORK"
          title={
            <>
              Projects with <span className="text-accent">measurable</span> outcomes
            </>
          }
          action={
            <Link
              to="/projects"
              className="link-underline inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest hover:text-accent"
            >
              ALL PROJECTS <ArrowUpRight size={15} />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(featured.length ? featured : projects.slice(0, 3)).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* ---------- about snippet ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24">
          <Reveal>
            <p className="label mb-3">/// ABOUT</p>
            <h2 className="section-title">
              Engineer first. <span className="text-accent">Designer</span> on purpose.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5">
            <p className="leading-relaxed text-mute">
              I treat a portfolio like any other product: a typed API, real migrations, an admin
              surface for content, tests that fail loudly, and a design system that survives a
              360px screen. The stack is React + FastAPI + PostgreSQL — chosen for clarity, not
              hype.
            </p>
            <p className="leading-relaxed text-mute">
              Every case study on this site documents the problem, the approach and the numbers
              behind it.
            </p>
            <Link
              to="/about"
              className="brutal brutal-hover inline-flex items-center gap-2 bg-bg px-5 py-3 font-mono text-sm font-bold tracking-widest"
            >
              MORE ABOUT ME <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- latest writing ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <SectionHeader
          label="WRITING"
          title="Notes from the build"
          action={
            <Link
              to="/writing"
              className="link-underline inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest hover:text-accent"
            >
              ALL WRITING <ArrowUpRight size={15} />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </section>

      {/* ---------- testimonials ---------- */}
      <TestimonialsSection />

      {/* ---------- cta ---------- */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-24">
          <Reveal>
            <p className="label mb-4">/// NEXT</p>
            <h2 className="section-title mx-auto max-w-2xl">
              Have a product to ship? <span className="text-accent">Let&apos;s talk.</span>
            </h2>
            <Link
              to="/contact"
              className="brutal brutal-hover mt-8 inline-flex items-center gap-2 bg-accent px-7 py-4 font-mono text-sm font-bold tracking-widest text-accent-ink"
            >
              START A CONVERSATION <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
