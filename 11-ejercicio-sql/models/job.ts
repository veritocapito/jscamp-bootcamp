import crypto from 'node:crypto'
import { db } from '../db/database'
import type { Job, JobContent, CreateJobDTO, UpdateJobDTO, JobFilters } from '../types'

interface JobRow {
  id: string
  title: string
  company: string
  location: string
  description: string
  modality: Job['data']['modality']
  level: Job['data']['level']
  technologies: string | null
  content_description: string | null
  content_responsibilities: string | null
  content_requirements: string | null
  content_about: string | null
}

const SELECT_JOBS = `
  SELECT
    j.id,
    j.title,
    j.company,
    j.location,
    j.description,
    j.modality,
    j.level,
    GROUP_CONCAT(DISTINCT jt.technology) AS technologies,
    jc.description      AS content_description,
    jc.responsibilities AS content_responsibilities,
    jc.requirements     AS content_requirements,
    jc.about            AS content_about
  FROM jobs j
  LEFT JOIN job_technologies jt ON jt.job_id = j.id
  LEFT JOIN job_content jc ON jc.job_id = j.id
`

function toJob(row: JobRow): Job {
  const job: Job = {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    description: row.description,
    data: {
      technology: row.technologies ? row.technologies.split(',') : [],
      modality: row.modality,
      level: row.level,
    },
  }

  if (row.content_description !== null) {
    job.content = {
      description: row.content_description,
      responsibilities: row.content_responsibilities ?? '',
      requirements: row.content_requirements ?? '',
      about: row.content_about ?? '',
    }
  }

  return job
}

const insertJob = db.prepare(`
  INSERT INTO jobs (id, title, company, location, description, modality, level)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const deleteJob = db.prepare('DELETE FROM jobs WHERE id = ?')

const insertTechnology = db.prepare('INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)')

const deleteTechnologies = db.prepare('DELETE FROM job_technologies WHERE job_id = ?')

const insertContent = db.prepare(`
  INSERT INTO job_content (id, job_id, description, responsibilities, requirements, about)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const deleteContent = db.prepare('DELETE FROM job_content WHERE job_id = ?')

function saveTechnologies(jobId: string, technologies: string[]) {
  deleteTechnologies.run(jobId)

  for (const technology of technologies) {
    insertTechnology.run(jobId, technology)
  }
}

function saveContent(jobId: string, content: JobContent) {
  deleteContent.run(jobId)
  insertContent.run(
    crypto.randomUUID(),
    jobId,
    content.description,
    content.responsibilities,
    content.requirements,
    content.about
  )
}

export class JobModel {
  static async getAll(filters: JobFilters = {}): Promise<Job[]> {
    const { tech, modality, level } = filters

    const conditions: string[] = []
    const params: string[] = []

    if (tech) {
      conditions.push(
        'j.id IN (SELECT job_id FROM job_technologies WHERE LOWER(technology) = LOWER(?))'
      )
      params.push(tech)
    }

    if (modality) {
      conditions.push('j.modality = ?')
      params.push(modality)
    }

    if (level) {
      conditions.push('j.level = ?')
      params.push(level)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = db.prepare(`${SELECT_JOBS} ${where} GROUP BY j.id`).all(...params) as JobRow[]

    return rows.map(toJob)
  }

  static async getById(id: string): Promise<Job | undefined> {
    const row = db.prepare(`${SELECT_JOBS} WHERE j.id = ? GROUP BY j.id`).get(id) as JobRow | undefined

    return row ? toJob(row) : undefined
  }

  static async create(input: CreateJobDTO): Promise<Job> {
    const newJob: Job = {
      id: crypto.randomUUID(),
      ...input,
    }

    const create = db.transaction((job: Job) => {
      insertJob.run(
        job.id,
        job.title,
        job.company,
        job.location,
        job.description,
        job.data.modality,
        job.data.level
      )

      saveTechnologies(job.id, job.data.technology)

      if (job.content) saveContent(job.id, job.content)
    })

    create(newJob)

    return newJob
  }

  static async delete(id: string): Promise<boolean> {
    return deleteJob.run(id).changes > 0
  }

  static async update(id: string, input: UpdateJobDTO): Promise<Job | null> {
    const existing = await JobModel.getById(id)
    if (!existing) return null

    const columns = {
      title: input.title,
      company: input.company,
      location: input.location,
      description: input.description,
      modality: input.data?.modality,
      level: input.data?.level,
    }

    const fields: string[] = []
    const params: string[] = []

    for (const [column, value] of Object.entries(columns)) {
      if (value !== undefined) {
        fields.push(`${column} = ?`)
        params.push(value)
      }
    }

    const update = db.transaction(() => {
      if (fields.length > 0) {
        db.prepare(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`).run(...params, id)
      }

      if (input.data?.technology) saveTechnologies(id, input.data.technology)
      if (input.content) saveContent(id, input.content)
    })

    update()

    return (await JobModel.getById(id)) ?? null
  }
}
