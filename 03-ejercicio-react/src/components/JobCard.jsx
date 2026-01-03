import { useState } from "react";

const JobCard = ({ job }) => {
  const [isApplied, setIsApplied] = useState(false);

  const handleApplyClick = () => {
    setIsApplied(!isApplied);
  };

  const buttonText = isApplied ? "Aplicado" : "Aplicar";
  const buttonClasses = isApplied ? "button-apply-job  is-applied" : "button-apply-job";

  return (
    <article
      className="job-listing-card"
      data-modalidad={job.data.modalidad}
      data-nivel={job.data.nivel}
      data-technology={job.data.technology}
    >
      <div>
        <h3>{job.titulo}</h3>
        <small>
          {job.empresa} | {job.modalidad}
        </small>
        <p>{job.descripcion}</p>
      </div>
      <button
        disabled={isApplied}
        className={buttonClasses}
        onClick={handleApplyClick}
      >
        {buttonText}
      </button>
    </article>
  );
};

export default JobCard;
