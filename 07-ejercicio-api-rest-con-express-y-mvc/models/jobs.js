import { randomUUID } from 'node:crypto'
import jobs from '../jobs.json' with { type: 'json' }

export const getAll = ({ text, title, level, technology, limit, offset }) => {
  let result = jobs

  if (title) {
    const search = title.toLowerCase().trim() // Para evitar resultados no encontrados por espacios al inicio/final
    result = result.filter((job) => job.titulo.toLowerCase().includes(search))
  }

  if (text) {
    const search = text.toLowerCase() // Podemos aplicar lo mismo que en title
    result = result.filter(
      (job) =>
        job.titulo.toLowerCase().includes(search) ||
        job.descripcion.toLowerCase().includes(search)
    )
  }

  if (level) {
    const search = level.toLowerCase()
    result = result.filter((job) => job.data?.nivel?.toLowerCase() === search)
  }

  if (technology) {
    const search = technology.toLowerCase()
    result = result.filter((job) =>
      job.data?.technology?.some((tech) => tech.toLowerCase() === search)
    )
  }

  return {
    data: result.slice(offset, offset + limit),
    total: result.length,
  }
}

export const getById = (id) => {
  return jobs.find((job) => job.id === id)
}

export const create = ({ titulo, empresa, ubicacion, descripcion, data, content }) => {
  const newJob = {
    id: randomUUID(),
    titulo,
    empresa,
    ubicacion,
    descripcion,
    data,
    content,
  }

  jobs.push(newJob)
  return newJob
}

export const update = (id, { titulo, empresa, ubicacion, descripcion, data, content }) => {
  const index = jobs.findIndex((job) => job.id === id)
  if (index === -1) return null

  const updatedJob = { titulo, empresa, ubicacion, descripcion, data, content } // El id nunca se debe modificar.

  jobs[index] = updatedJob
  return updatedJob
}

export const partialUpdate = (id, fields) => {
  const index = jobs.findIndex((job) => job.id === id)
  if (index === -1) return null

  const updatedJob = { ...jobs[index], ...fields, id }

  jobs[index] = updatedJob
  return updatedJob
}

export const remove = (id) => {
  const index = jobs.findIndex((job) => job.id === id)
  if (index === -1) return null

  const [deletedJob] = jobs.splice(index, 1)
  return deletedJob
}
