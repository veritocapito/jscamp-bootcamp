import { useState } from 'react'
import { Link } from './Link.jsx'
import { useFavoritesStore } from '../store/favoritesStore.js'

function JobCardFavoriteButton({ jobId }) {
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  return (
    <button 
      onClick={() => toggleFavorite(jobId)} 
      aria-label={isFavorite(jobId) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite(jobId) ? '❤️' : '🤍'}
    </button>
  )
}



export function JobCard({ job }) {
  const [isApplied, setIsApplied] = useState(false)

  const handleApplyClick = () => {
    setIsApplied(true)
  }

  const buttonClasses = isApplied ? 'button-apply-job is-applied' : 'button-apply-job'
  const buttonText = isApplied ? 'Aplicado' : 'Aplicar'

  return (
    <article
      className="job-listing-card"
      data-modalidad={job.data.modalidad}
      data-nivel={job.data.nivel}
      data-technology={job.data.technology}
    >
      <div>
        <Link href={`/job/${job.id}`}>
          <h3>{job.titulo}</h3>
        </Link>
        <small>
          {job.empresa} | {job.ubicacion}
        </small>
        <p>{job.descripcion}</p>
      </div>
      <div className="button-container">
        <button className={buttonClasses} onClick={handleApplyClick}>
          {buttonText}
        </button>
        <JobCardFavoriteButton jobId={job.id} />
      </div>
    </article>
  )
}
