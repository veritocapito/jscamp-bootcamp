import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { JobSection } from "../components/JobSection.jsx";
import { Link } from "../components/Link.jsx";
import styles from "./Detail.module.css";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsApplied(false);

    fetch(`https://jscamp-api.vercel.app/api/jobs/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching job details");
        return response.json();
      })
      .then((json) => {
        setJob(json);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className={styles.status}>
        <p>Cargando empleo...</p>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className={styles.status}>
        <h2>Oferta no encontrada</h2>
        <button className={styles.applyButton} onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </main>
    );
  }

  const applyButton = (
    <button
      className={
        isApplied ? `${styles.applyButton} ${styles.isApplied}` : styles.applyButton
      }
      onClick={() => setIsApplied(true)}
    >
      {isApplied ? "Ya aplicaste" : "Aplicar ahora"}
    </button>
  );

  return (
    <main>
      <title>{`${job.titulo} en ${job.empresa} - DevJobs`}</title>
      <meta name="description" content={job.descripcion} />

      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link href="/search">Empleos</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{job.titulo}</span>
        </nav>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{job.titulo}</h1>
              <p className={styles.subtitle}>
                {job.empresa} · {job.ubicacion}
              </p>
            </div>
            {applyButton}
          </div>

          <div className={styles.sections}>
            <JobSection title="Descripción del puesto" content={job.content.description} />
            <JobSection title="Responsabilidades" content={job.content.responsibilities} />
            <JobSection title="Requisitos" content={job.content.requirements} />
            <JobSection title="Acerca de la empresa" content={job.content.about} />
          </div>

          <div className={styles.cardFooter}>{applyButton}</div>
        </div>
      </div>
    </main>
  );
}
