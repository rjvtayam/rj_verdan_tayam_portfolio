const SITE = 'R.J. Verdan Tayam'
const SUFFIX = `— ${SITE}`

export type PageMeta = { title: string; description: string }

export function metaFor(pathname: string): PageMeta {
  if (pathname === '/') {
    return {
      title: `${SITE} — Full-Stack Web Developer`,
      description:
        'Portfolio of R.J. Verdan Tayam, a full-stack web developer building fast, accessible products with React, FastAPI and PostgreSQL.',
    }
  }
  if (pathname.startsWith('/projects/')) {
    return {
      title: `Case Study ${SUFFIX}`,
      description:
        'Technical case study — the problem, the approach and the measured results behind the build.',
    }
  }
  if (pathname.startsWith('/projects')) {
    return {
      title: `Selected Work ${SUFFIX}`,
      description:
        'Case studies of shipped full-stack projects — JNHS Portal, Farm Connect, Enlighten ED and more.',
    }
  }
  if (pathname.startsWith('/writing/')) {
    return {
      title: `Article ${SUFFIX}`,
      description: 'Notes on engineering, design systems and shipping full-stack products.',
    }
  }
  if (pathname.startsWith('/writing')) {
    return {
      title: `Writing ${SUFFIX}`,
      description: 'Articles and build notes from R.J. Verdan Tayam.',
    }
  }
  if (pathname.startsWith('/about')) {
    return {
      title: `About ${SUFFIX}`,
      description:
        'BSIT graduate (WMAD) — skills, education, certifications and what drives the work.',
    }
  }
  if (pathname.startsWith('/contact')) {
    return {
      title: `Contact ${SUFFIX}`,
      description:
        'Project inquiries, collaborations or roles — send a message, typical reply under 24h.',
    }
  }
  return {
    title: `Page Not Found ${SUFFIX}`,
    description: 'The page you are looking for does not exist.',
  }
}
