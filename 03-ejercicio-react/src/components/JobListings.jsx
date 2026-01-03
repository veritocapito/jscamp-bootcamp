import JobCard from "./JobCard.jsx";


const JobListings = ({ jobs }) =>{
  return (
    <div className="jobs-listings">
      {jobs.length === 0 && (
        <article className="job-listing-card">
          No se han encontrado empleos que coincidan con los criterios de búsqueda.
        </article>
      )}

      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

export default JobListings