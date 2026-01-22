import JobCard from "./JobCard.jsx";


const JobListings = ({ jobs }) =>{
  // simplificamos la logica fuera del jsx
  if(jobs.length === 0) return  <article className="job-listing-card">
    No se han encontrado empleos que coincidan con los criterios de búsqueda.
  </article>

  return (
    <div className="jobs-listings">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

export default JobListings