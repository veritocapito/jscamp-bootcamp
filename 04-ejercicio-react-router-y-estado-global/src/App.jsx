import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'

import { HomePage } from './pages/Home.jsx'
import { SearchPage } from './pages/Search.jsx'
import { JobDetail } from './pages/Detail.jsx'
import { Route, Routes } from 'react-router'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
