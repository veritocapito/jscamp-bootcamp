import * as JobModel from '../models/jobs.js'
import { DEFAULTS } from '../config.js'

export class JobController {
  static async getAll(req, res) {
    const { text, title, level, technology } = req.query

    const limit = Number(req.query.limit) || DEFAULTS.LIMIT_PAGINATION
    const offset = Number(req.query.offset) || DEFAULTS.LIMIT_OFFSET

    const { data, total } = await JobModel.getAll({
      text,
      title,
      level,
      technology,
      limit,
      offset,
    })

    return res.json({ data, total, limit, offset })
  }

  static async getId(req, res) {
    const { id } = req.params
    const job = await JobModel.getById(id)

    if (!job) return res.status(404).json({ error: 'Job not found' })

    return res.json(job)
  }

  static async create(req, res) {
    const newJob = await JobModel.create(req.body)

    return res.status(201).json(newJob)
  }

  static async update(req, res) {
    const { id } = req.params
    const updatedJob = await JobModel.update(id, req.body)

    if (!updatedJob) return res.status(404).json({ error: 'Job not found' })

    return res.json(updatedJob)
  }

  static async partialUpdate(req, res) {
    const { id } = req.params
    const updatedJob = await JobModel.partialUpdate(id, req.body)

    if (!updatedJob) return res.status(404).json({ error: 'Job not found' })

    return res.json(updatedJob)
  }

  static async delete(req, res) {
    const { id } = req.params
    const deletedJob = await JobModel.remove(id)

    if (!deletedJob) return res.status(404).json({ error: 'Job not found' })

    return res.json({ message: 'Job deleted' })
  }
}
