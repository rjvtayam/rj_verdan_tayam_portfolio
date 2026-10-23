import { Mail } from 'lucide-react'
import { FacebookIcon, GithubIcon, LinkedinIcon } from './SocialIcons'
import LocalClock from './LocalClock'
import { Link } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const SOCIALS = [
  { href: 'https://web.facebook.com/rj.tayam', label: 'FACEBOOK', Icon: FacebookIcon },
  { href: 'https://github.com/rjvtayam', label: 'GITHUB', Icon: GithubIcon },
  { href: 'https://linkedin.com/', label: 'LINKEDIN', Icon: LinkedinIcon },
  { href: 'mailto:rickyjhon.tayam@gmail.com', label: 'EMAIL', Icon: Mail },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-mono text-2xl font-bold tracking-tight">R.J. VERDAN TAYAM</p>
          <p className="mt-3 max-w-xs text-sm text-mute">
            Full-stack web developer building fast, accessible products with React, FastAPI and
            PostgreSQL.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-widest">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse bg-accent" />
              AVAILABLE FOR WORK
            </span>
            <span className="text-mute">·</span>
            <span className="text-mute">
              LOCAL <LocalClock />
            </span>
          </p>
        </div>

        <div>
          <p className="label mb-4">// SITEMAP</p>
          <ul className="space-y-2 font-mono text-sm">
            {[
              { to: '/projects', label: '01/ WORK' },
              { to: '/writing', label: '02/ WRITING' },
              { to: '/about', label: '03/ ABOUT' },
              { to: '/contact', label: '04/ CONTACT' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-underline hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-4">// ELSEWHERE</p>
          <ul className="space-y-2 font-mono text-sm">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-2 hover:text-accent"
                >
                  <Icon size={14} /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 font-mono text-[0.7rem] tracking-widest text-mute sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {YEAR} R.J. VERDAN TAYAM — ALL RIGHTS RESERVED</span>
          <span className="flex items-center gap-4">
            <span>BUILT WITH REACT · FASTAPI · POSTGRESQL</span>
            <Link
              to="/admin"
              className="link-underline tracking-widest transition-colors hover:text-accent"
              title="Admin console"
            >
              ADMIN
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
