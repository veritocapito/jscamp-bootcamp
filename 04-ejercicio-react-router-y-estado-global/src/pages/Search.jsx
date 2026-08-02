import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Pagination } from '../components/Pagination.jsx'
import { SearchFormSection } from '../components/SearchFormSection.jsx'
import { JobListings } from '../components/JobListings.jsx'

const RESULTS_PER_PAGE = 4

const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState(() => ({
    technology: searchParams.get('technology') ?? '',
    location: searchParams.get('type') ?? '',
    experienceLevel: searchParams.get('level') ?? ''
  }))

  const [textToFilter, setTextToFilter] = useState(() => searchParams.get('text') ?? '')

  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams.get('page')) || 1
  })

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const updateFiltersInURL = ({ text, technology, location, experienceLevel, page }) => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams)

      if (text) params.set('text', text)
      else params.delete('text')
      if (technology) params.set('technology', technology)
      else params.delete('technology')
      if (location) params.set('type', location)
      else params.delete('type')
      if (experienceLevel) params.set('level', experienceLevel)
      else params.delete('level')
      if (page > 1) params.set('page', page)
      else params.delete('page')

      return params
    })
  }

  useEffect(() => {
    async function fetchJobs () {
      try {
        setLoading(true)

        const params = new URLSearchParams()

        if (textToFilter) params.set('text', textToFilter)
        if (filters.technology) params.set('technology', filters.technology)
        if (filters.location) params.set('type', filters.location)
        if (filters.experienceLevel) params.set('level', filters.experienceLevel)

        const offset = (currentPage - 1) * RESULTS_PER_PAGE
        params.set('limit', RESULTS_PER_PAGE)
        params.set('offset', offset)

        const response = await fetch(`https://jscamp-api.vercel.app/api/jobs?${params}`)
        const json = await response.json()

        setJobs(json.data)
        setTotal(json.total)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters, currentPage, textToFilter])

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE)

  const handleSearch = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateFiltersInURL({ ...newFilters, text: textToFilter, page: 1 })
  }

  const handleTextFilter = (newText) => {
    setTextToFilter(newText)
    setCurrentPage(1)
    updateFiltersInURL({ ...filters, text: newText, page: 1 })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    updateFiltersInURL({ ...filters, text: textToFilter, page })
  }

  return {
    loading,
    jobs,
    total,
    totalPages,
    currentPage,
    textToFilter,
    filters,
    handlePageChange,
    handleSearch,
    handleTextFilter
  }
}

export function SearchPage () {
  const {
    jobs,
    total,
    loading,
    totalPages,
    currentPage,
    textToFilter,
    filters,
    handlePageChange,
    handleSearch,
    handleTextFilter
  } = useFilters()

  const title = loading
    ? 'Cargando... - DevJobs'
    : `Resultados: ${total}, Página ${currentPage} - DevJobs`

  return (
    <main>
      <title>{title}</title>
      <meta name="description" content="Explora miles de oportunidades laborales en el sector tecnológico. Encuentra tu próximo empleo en DevJobs." />

      <SearchFormSection
        initialText={textToFilter}
        initialFilters={filters}
        onSearch={handleSearch}
        onTextFilter={handleTextFilter}
      />

      <section>
        <h2 style={{ textAlign: 'center' }}>Resultados de búsqueda</h2>

        {loading ? <p>Cargando empleos...</p> : <JobListings jobs={jobs} />}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </main>
  )
}