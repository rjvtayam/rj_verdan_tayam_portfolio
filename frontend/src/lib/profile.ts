export type PersonalDetail = {
  label: string
  value: string
  href?: string
  icon:
    | 'calendar'
    | 'map-pin'
    | 'user'
    | 'heart'
    | 'flag'
    | 'church'
    | 'languages'
    | 'phone'
    | 'mail'
    | 'facebook'
    | 'globe'
}

export const PROFILE = {
  brand: 'R.J. VERDAN TAYAM',
  name: 'Ricky Jhon V. Tayam',
  title: 'BSIT GRADUATE — WMAD',
  subtitle: 'FULL-STACK WEB & MOBILE APP DEV',
  summary:
    'BSIT graduate with 3 years of freelance experience building full-stack web and mobile applications. Proficient in the MERN stack, Python-PostgreSQL, and cross-platform mobile development using Flutter and Kotlin. Brings a working background in UI/UX design alongside development, covering everything from mockups to deployment. Open to full-stack, front-end, back-end, and UI/UX design roles where real-world skills translate directly into meaningful contributions.',
  objective:
    'To contribute effectively in a dynamic and growth-oriented environment where I can apply my skills and knowledge to drive success. I seek to collaborate with a team that values innovation and excellence, allowing me to develop my professional capabilities while delivering meaningful results. My goal is to embrace new challenges and growth opportunities, ensuring that my personal and organizational objectives are met.',
  personal: [
    { label: 'Date of birth', value: 'February 16, 2000', icon: 'calendar' },
    { label: 'Place of birth', value: 'Jomalig, Quezon', icon: 'map-pin' },
    { label: 'Gender', value: 'Male', icon: 'user' },
    { label: 'Marital status', value: 'Single', icon: 'heart' },
    { label: 'Nationality', value: 'Filipino', icon: 'flag' },
    { label: 'Religion', value: 'Seventh Day Adventist', icon: 'church' },
    { label: 'Languages', value: 'Filipino · English', icon: 'languages' },
    { label: 'Address', value: 'Sitio Maligaya, Brgy. Talisoy, Jomalig, Quezon', icon: 'map-pin' },
    { label: 'Mobile', value: '+63 966 185 5866', href: 'tel:+639661855866', icon: 'phone' },
    {
      label: 'Email',
      value: 'rickyjhon.tayam@gmail.com',
      href: 'mailto:rickyjhon.tayam@gmail.com',
      icon: 'mail',
    },
    {
      label: 'Facebook',
      value: 'facebook.com/rj.tayam',
      href: 'https://web.facebook.com/rj.tayam',
      icon: 'facebook',
    },
    {
      label: 'Portfolio',
      value: 'rjvtayam.github.io/rjtayam-portfolio',
      href: 'https://rjvtayam.github.io/rjtayam-portfolio',
      icon: 'globe',
    },
  ] as PersonalDetail[],
  education: [
    {
      period: '2022 — 2026',
      school: 'Laguna State Polytechnic University — Siniloan Campus',
      degree: 'Bachelor of Science in Information Technology (WMAD)',
    },
    {
      period: '2018 — 2019',
      school: 'Divine Word College of San Jose, Occ. Mindoro',
      degree: '1st Year College — BSIT',
    },
    {
      period: '2012 — 2017',
      school: 'Jomalig National High School',
      degree: 'High School & Senior High School',
    },
    {
      period: '2006 — 2011',
      school: 'Jomalig Central Elementary School',
      degree: 'Elementary School',
    },
  ],
  experience: [
    {
      period: '2026 — Present',
      role: 'Freelance Full-Stack Developer',
      company: 'Self-Employed / Remote',
      detail: 'Custom web apps for clients — React, Python, PHP/MySQL, PostgreSQL. Mockups to deployment.',
    },
    {
      period: '2022 — Present',
      role: 'Open Source Contributor',
      company: 'Python & React ecosystems',
      detail: 'Fixes, documentation and PR reviews focused on API ergonomics and test coverage.',
    },
  ],
  certifications: [
    { name: 'Star Web Development & UX/UI Design Award', issuer: 'Zuitt', year: '2024', award: true },
    { name: 'Web Development Bootcamp', issuer: 'GoIT Philippines', year: '2024', award: false },
    { name: 'Machine Learning with Python', issuer: 'freeCodeCamp', year: '2025', award: false },
    { name: 'College Algebra with Python', issuer: 'freeCodeCamp', year: '2025', award: false },
    { name: 'Data Visualization', issuer: 'Zuitt', year: '2025', award: false },
    { name: 'Most Artistic Awards', issuer: 'JNHS', year: '2018 — 2020', award: false },
  ],
  softSkills: ['Good in Communication', 'Team Building', 'Problem-Solving', 'Decision Making'],
  modules: [
    { name: 'Professional & Social Aspects of Computing', pct: 80 },
    { name: 'Understanding Information Systems', pct: 80 },
    { name: 'Human-Computer Interaction', pct: 80 },
    { name: 'Information Security', pct: 70 },
    { name: 'Data Modeling & Database Systems', pct: 60 },
  ],
  interests: [
    'Programming',
    'Web designing',
    'Chess',
    'Painting',
    'Anime',
    'Movies',
    'Singing',
    'Dancing',
    'Social activities',
    'Parish volunteering',
  ],
  references: [
    { name: 'Reymar A. Villana', role: 'Sales Coordinator', org: 'Izumi Wellness Center Philippines' },
    { name: 'Marchie Tan', role: 'IWC Supervisor', org: 'Izumi Wellness Center — Batangas Branch' },
    { name: 'Melody Serrano Navos', role: 'DLA Cashier / Staff', org: 'Dreamland Arcade, Siniloan, Laguna' },
  ],
}

export type MediaItem = {
  src: string
  caption?: string
  /** 'video' entries render with a player + play badge; default 'image'. */
  type?: 'image' | 'video'
  poster?: string
  /** Short length label shown on video thumbnails, e.g. "0:42". */
  duration?: string
  /** Small category chip, e.g. "LSPU-BAO". */
  tag?: string
}

/** Drop images/videos into `public/media/` and list them here. */
export const PHOTOS: MediaItem[] = [
  {
    src: '/media/videos/work1.mp4',
    type: 'video',
    duration: '1:12',
    tag: 'LSPU-BAO',
    caption: 'LSPU-BAO office portal — school supplies ordering walkthrough',
  },
  {
    src: '/media/videos/work2.mp4',
    type: 'video',
    duration: '0:54',
    tag: 'CAPSTONE',
    caption: 'Full-stack capstone demo — API integration and database workflow',
  },
  {
    src: '/media/videos/work3.mp4',
    type: 'video',
    duration: '0:18',
    tag: 'UX/UI',
    caption: 'User-friendly navigation prototype',
  },
  {
    src: '/media/videos/work4.mp4',
    type: 'video',
    duration: '0:11',
    tag: 'LOGOS',
    caption: 'Tech startup logo concepts — futuristic mark studies',
  },
  {
    src: '/media/videos/work5.mp4',
    type: 'video',
    duration: '0:36',
    tag: 'BACK-END',
    caption: 'Python back-end project demo — scalable service logic',
  },
  {
    src: '/media/videos/work6.mp4',
    type: 'video',
    duration: '0:35',
    tag: 'WEB & MOBILE',
    caption: 'Web & mobile UI showcase',
  },
  {
    src: '/media/certificate.jpg',
    caption: 'Star Web Development & UX/UI Design Award — Zuitt, 2024',
    tag: 'AWARD',
  },
  {
    src: '/media/rjtayam.png',
    caption: 'R.J. Verdan Tayam — full-stack web & mobile app developer',
    tag: 'PROFILE',
  },
]
