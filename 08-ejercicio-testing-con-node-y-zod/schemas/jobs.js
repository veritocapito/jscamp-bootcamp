/*
 * Aquí debes crear el schema de validación con Zod para los jobs
 *
 * Recuerda:
 * - Importar zod
 * - Crear un schema que valide la estructura de un job
 * - Exportar funciones validateJob() y validatePartialJob()
 * - Usar safeParse() para validar sin lanzar excepciones
 * - Definir reglas de validación (min, max, required, optional, etc.)
 */

import * as z from 'zod'

const jobSchema = z.object({
    titulo: z.string().min(3).max(100),
    empresa: z.string(),
    ubicacion: z.string(),
    descripcion: z.string().optional(),
    content: z.string().optional(),
    data: z.object({
        technology: z.array(z.string()),
        modalidad: z.string().optional(),
        nivel: z.string().optional()
    }).optional()
})

export function validateJob(input) {
    return jobSchema.safeParse(input)
}

export function validatePartialJob(input) {
    return jobSchema.partial().safeParse(input)
}