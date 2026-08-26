import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './database'
import type { Job, JobContent } from '../types'

interface JobJSON extends Omit<Job, 'data'> {
  modality: Job['data']['modality']
  level: Job['data']['level']
  technologies: string[]
}

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    company     TEXT NOT NULL,
    location    TEXT NOT NULL,
    description TEXT NOT NULL,
    modality    TEXT NOT NULL CHECK (modality IN ('remote', 'onsite', 'hybrid')),
    level       TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior'))
  );

  CREATE TABLE IF NOT EXISTS job_technologies (
    job_id     TEXT NOT NULL,
    technology TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS job_content (
    id               TEXT PRIMARY KEY,
    job_id           TEXT NOT NULL,
    description      TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    requirements     TEXT NOT NULL,
    about            TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_technologies_job_id ON job_technologies (job_id);
  CREATE INDEX IF NOT EXISTS idx_content_job_id ON job_content (job_id);
`)

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const jobs: JobJSON[] = JSON.parse(fs.readFileSync(path.join(currentDir, '..', 'jobs.json'), 'utf-8'))

const deleteJobs = db.prepare('DELETE FROM jobs')

const insertJob = db.prepare(`
  INSERT INTO jobs (id, title, company, location, description, modality, level)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const insertTechnology = db.prepare(`
  INSERT INTO job_technologies (job_id, technology)
  VALUES (?, ?)
`)

const insertContent = db.prepare(`
  INSERT INTO job_content (id, job_id, description, responsibilities, requirements, about)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const seed = db.transaction((rows: JobJSON[]) => {
  deleteJobs.run()

  for (const job of rows) {
    insertJob.run(
      job.id,
      job.title,
      job.company,
      job.location,
      job.description,
      job.modality,
      job.level
    )

    for (const technology of job.technologies) {
      insertTechnology.run(job.id, technology)
    }

    if (job.content) {
      const { description, responsibilities, requirements, about }: JobContent = job.content
      insertContent.run(crypto.randomUUID(), job.id, description, responsibilities, requirements, about)
    }
  }
})

try {
  seed(jobs)

  console.log('✅ Tablas creadas: jobs, job_technologies, job_content')
  console.log(`✅ ${jobs.length} jobs insertados`)
} finally {
  db.close()
}