import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'

import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'

const HomePage = lazy(() => import('./pages/Home.jsx'))
const SearchPage = lazy(() => import('./pages/Search.jsx'))
const JobDetail = lazy(() => import('./pages/Detail.jsx'))
const NotFoundPage = lazy(() => import('./pages/404.jsx'))

function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<p>Cargando...</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default App
