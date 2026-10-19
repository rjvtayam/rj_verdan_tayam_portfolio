import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RootLayout from './components/RootLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const WritingPage = lazy(() => import('./pages/WritingPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('./admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminProjects = lazy(() => import('./admin/AdminProjects'))
const AdminPosts = lazy(() => import('./admin/AdminPosts'))
const AdminMessages = lazy(() => import('./admin/AdminMessages'))
const AdminContent = lazy(() => import('./admin/AdminContent'))

function Fallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mono text-xs tracking-[0.2em] text-mute">
      LOADING…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="writing" element={<WritingPage />} />
            <Route path="writing/:slug" element={<PostPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="content" element={<AdminContent />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
