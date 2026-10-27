/**
 * GitHub Linguist–style colors for tech-stack pills.
 * Values mirror the official language colors GitHub uses for repository
 * language bars (the colored dots + percentages on every repo page).
 */
const TECH_COLORS: Record<string, string> = {
  // languages
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572a5',
  'c#': '#178600',
  java: '#b07219',
  'c++': '#f34b7d',
  c: '#555555',
  php: '#4f5d95',
  ruby: '#701516',
  go: '#00add8',
  rust: '#dea584',
  swift: '#f05138',
  kotlin: '#a97bff',
  dart: '#00b4ab',
  html: '#e34f26',
  html5: '#e34f26',
  css: '#663399',
  scss: '#c6538c',
  sass: '#a63c72',
  'vue.js': '#41b883',
  vue: '#41b883',
  'svelte': '#ff3e00',
  sql: '#e38c00',
  bash: '#89e051',
  powershell: '#012456',
  'visual basic .net': '#945db7',
  // frameworks & libs
  react: '#61dafb',
  'react.js': '#61dafb',
  next: '#000000',
  'next.js': '#000000',
  node: '#5fa04e',
  'node.js': '#5fa04e',
  express: '#000000',
  fastapi: '#009688',
  flask: '#000000',
  django: '#092e20',
  tailwind: '#06b6d4',
  'tailwind css': '#06b6d4',
  'bootstrap': '#7952b3',
  'socket.io': '#010101',
  'chart.js': '#ff6384',
  'three.js': '#049ef4',
  'jquery': '#0769ad',
  'laravel': '#ff2d20',
  'flutter': '#02569b',
  'android': '#3ddc84',
  'kotlin multiplatform': '#a97bff',
  // data
  postgresql: '#4169e1',
  postgres: '#4169e1',
  mysql: '#4479a1',
  mongodb: '#47a248',
  redis: '#dc382d',
  sqlite: '#003b57',
  'supabase': '#3ecf8e',
  firebase: '#ffca28',
  // devops & tools
  docker: '#2496ed',
  'docker compose': '#2496ed',
  kubernetes: '#326ce5',
  nginx: '#009639',
  git: '#f05032',
  'git & github': '#f05032',
  github: '#f05032',
  vercel: '#000000',
  netlify: '#00c7b7',
  linux: '#fcc624',
  ubuntu: '#e95420',
  'postman': '#ff6c37',
  'insomnia': '#4000bf',
  // design & misc
  figma: '#f24e1e',
  'adobe photoshop': '#31a8ff',
  photoshop: '#31a8ff',
  'adobe illustrator': '#ff9a00',
  illustrator: '#ff9a00',
  'adobe xd': '#ff61f6',
  xd: '#ff61f6',
  'machine learning': '#ff6f00',
  'ai integration': '#ff6f00',
  'rest apis': '#009688',
  graphql: '#e10098',
  'jwt': '#000000',
  'argocd': '#ef7b4d',
}

/** Fallback palette for unknown techs — stable per-name pick. */
const FALLBACK = [
  '#3178c6',
  '#3572a5',
  '#f1e05a',
  '#663399',
  '#4169e1',
  '#009688',
  '#a97bff',
  '#f05138',
  '#00add8',
  '#ff6384',
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

/** Official GitHub color for a tech name, or a stable fallback for unknowns. */
export function techColor(name: string): string {
  const key = name.trim().toLowerCase()
  return TECH_COLORS[key] ?? FALLBACK[hashName(key) % FALLBACK.length]
}

/**
 * Foreground (text) color that stays readable on the dark surface for a given
 * tech color — GitHub's language colors include yellows/greens that wash out,
 * so those get brightened for text use.
 */
export function techInk(hex: string): string {
  return hex === '#f1e05a' || hex === '#fcc624' ? '#0a0a0c' : hex
}
