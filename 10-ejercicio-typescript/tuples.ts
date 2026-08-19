/* En este ejercicio deberás tipar las tuplas con los tipos ya creados, y usando `number` para la tupla de `SalaryRange` y `Coordinates` */

import type { Job } from './objects.ts'

// Tupla para coordenadas de ubicación
export type Coordinates = [lat: number, lon: number] // [latitud, longitud]

// Tupla para rango de salario
export type SalaryRange = [min: number, max: number] // [mínimo, máximo]

// Función que devuelve el rango de salarios
export function getSalaryRange(jobs: Job[]): SalaryRange {
  const salaries = jobs.map((job) => job.salary).filter((salary) => salary !== undefined)

  if (salaries.length === 0) {
    return [0, 0]
  }

  const min = Math.min(...salaries)
  const max = Math.max(...salaries)

  return [min, max]
}
