/*
 * Aquí debes escribir tus tests para la API de jobs
 *
 * Recuerda:
 * - Usar node:test y node:assert (sin dependencias externas)
 * - Levantar el servidor con before() y cerrarlo con after()
 * - Testear todos los endpoints: GET, POST, PUT, PATCH, DELETE
 * - Verificar validaciones con Zod
 * - Comprobar códigos de estado HTTP correctos
 */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import app from './app.js'

let server
const PORT = 2211
const BASE_URL = `http://localhost:${PORT}`

const INVALID_ID = '00000000-0000-0000-0000-000000000000'

before(async () => {
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => resolve())
        server.on('error', reject)
    })
})

after(async () => {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) return reject(err)
            resolve()

        })
    })
})

describe('GET /jobs', () => {
    test('Debe devolver 200 y un array de trabajos', async () => {
        const response = await fetch(`${BASE_URL}/jobs`)
        assert.strictEqual(response.status, 200)

        const json = await response.json()
        assert.ok(Array.isArray(json.data), 'La respuesta debe ser un array')
    })

    test('Debe filtrar trabajos por tecnología', async () => {
        const response = await fetch(`${BASE_URL}/jobs?technology=react`)
        assert.strictEqual(response.status, 200)

        const json = await response.json()
        assert.ok(
            json.data.every((job) => job.data.technology.includes('react')),
            'La respuesta debe filtrar trabajos por tecnología'
        )
    })

    test('Debe respetar el límite de resultados', async () => {
        const response = await fetch(`${BASE_URL}/jobs?limit=2`)
        assert.strictEqual(response.status, 200)

        const json = await response.json()
        assert.strictEqual(json.limit, 2)
        assert.strictEqual(json.data.length, 2)
    })

    test('Debe aplicar offset correctamente', async () => {
        const response = await fetch(`${BASE_URL}/jobs?offset=1`)
        assert.strictEqual(response.status, 200)

        const json = await response.json()
        assert.strictEqual(json.data[0].id, 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57')
    })
})

describe('POST /jobs', () => {
    test('Debe crear un nuevo trabajo con buen formato', async () => {
        const newJob = {
            titulo: 'Desarrollador Web',
            descripcion: 'Se busca desarrollador web con experiencia en React',
            empresa: 'Tech Company',
            ubicacion: 'Remoto',
            data: {
                technology: ['react', 'javascript']
            }
        }

        const response = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJob)
        })

        assert.strictEqual(response.status, 201)

        const json = await response.json()
        assert.ok(json.id, 'El job devuelto debe tener un ID generado')
        assert.strictEqual(json.titulo, newJob.titulo)
        assert.strictEqual(json.descripcion, newJob.descripcion)
        assert.strictEqual(json.empresa, newJob.empresa)
        assert.strictEqual(json.ubicacion, newJob.ubicacion)
        assert.strictEqual(json.data.technology.length, newJob.data.technology.length)
        assert.ok(
            newJob.data.technology.every((tech) => json.data.technology.includes(tech)),
            'El job devuelto debe conservar las tecnologías enviadas'
        )
    })

    test('Debe validar correctamente la petición', async () => {
        const baseJob = {
            empresa: 'Tech Company',
            ubicacion: 'Remoto',
            descripcion: 'Descripción válida'
        }

        const invalidJobs = [
            { ...baseJob, titulo: 'ab' },
            { ...baseJob, titulo: 'a'.repeat(101) },
            { ...baseJob },
            { ...baseJob, titulo: 123 }
        ]

        for (const job of invalidJobs) {
            const response = await fetch(`${BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(job)
            })
            assert.strictEqual(response.status, 400)
        }
    })

    test('Debe crear el trabajo sin descripción porque es opcional', async () => {
        const jobWithoutDescription = {
            titulo: 'Desarrollador Backend',
            empresa: 'Tech Company',
            ubicacion: 'Remoto'
        }

        const response = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobWithoutDescription)
        })

        assert.strictEqual(response.status, 201)

        const json = await response.json()
        assert.ok(json.id, 'El job devuelto debe tener un ID generado')
        assert.strictEqual(json.titulo, jobWithoutDescription.titulo)
        assert.strictEqual(json.descripcion, undefined)
    })
})

describe('GET /jobs/:id', () => {
    const EXISTING_ID = 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57'

    test('Debe devolver el trabajo con el ID especificado', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`)
        assert.strictEqual(response.status, 200)

        const json = await response.json()
        assert.strictEqual(json.id, EXISTING_ID)
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${INVALID_ID}`)
        assert.strictEqual(response.status, 404)

        const json = await response.json()
        assert.ok(json.error, 'La respuesta debe contener un campo error')
    })
})

describe('PUT /jobs/:id', () => {
    const EXISTING_ID = 'e31f9a92-61d7-4b7a-b3a2-91e8c1f40b2d'

    const updatedJob = {
        titulo: 'Desarrollador Móvil Senior',
        empresa: 'Mobile Apps Ltd.',
        ubicacion: 'Remoto',
        descripcion: 'Puesto actualizado mediante PUT',
        data: {
            technology: ['swift', 'kotlin'],
            modalidad: 'remoto',
            nivel: 'senior'
        }
    }

    test('Debe recibir 204 y actualizar el trabajo completo', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedJob)
        })

        assert.strictEqual(response.status, 204)

        const getResponse = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`)
        assert.strictEqual(getResponse.status, 200)

        const json = await getResponse.json()
        assert.strictEqual(json.id, EXISTING_ID)
        assert.strictEqual(json.titulo, updatedJob.titulo)
        assert.strictEqual(json.ubicacion, updatedJob.ubicacion)
        assert.strictEqual(json.descripcion, updatedJob.descripcion)
        assert.strictEqual(json.data.modalidad, updatedJob.data.modalidad)
        assert.strictEqual(json.data.nivel, updatedJob.data.nivel)
        assert.strictEqual(json.data.technology.length, updatedJob.data.technology.length)
        assert.ok(
            updatedJob.data.technology.every((tech) => json.data.technology.includes(tech)),
            'Las tecnologías deben ser las enviadas en el PUT'
        )
        assert.strictEqual(json.content, undefined, 'PUT reemplaza todos los campos, content debe desaparecer')
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${INVALID_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedJob)
        })

        assert.strictEqual(response.status, 404)
    })
})

describe('PATCH /jobs/:id', () => {
    const EXISTING_ID = 'f62d8a34-923a-4ac2-9b0b-14e0ac2f5405'

    test('Debe recibir 204 y actualizar solo los campos enviados', async () => {
        const originalResponse = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`)
        const originalJob = await originalResponse.json()

        const partialJob = {
            titulo: 'Ingeniero de DevOps Senior',
            ubicacion: 'Barcelona'
        }

        const response = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partialJob)
        })

        assert.strictEqual(response.status, 204)

        const getResponse = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`)
        assert.strictEqual(getResponse.status, 200)

        const json = await getResponse.json()
        assert.strictEqual(json.titulo, partialJob.titulo)
        assert.strictEqual(json.ubicacion, partialJob.ubicacion)

        assert.strictEqual(json.empresa, originalJob.empresa, 'empresa no debe cambiar')
        assert.strictEqual(json.descripcion, originalJob.descripcion, 'descripcion no debe cambiar')
        assert.strictEqual(json.data.modalidad, originalJob.data.modalidad, 'modalidad no debe cambiar')
        assert.strictEqual(json.data.nivel, originalJob.data.nivel, 'nivel no debe cambiar')
        assert.strictEqual(
            json.data.technology.length,
            originalJob.data.technology.length,
            'technology no debe cambiar'
        )
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${INVALID_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo: 'Título nuevo' })
        })

        assert.strictEqual(response.status, 404)
    })
})

describe('DELETE /jobs/:id', () => {
    const EXISTING_ID = 'a9f31a8e-ec38-4fd3-9114-88cc6d37a92b'

    test('Debe recibir 204 y eliminar el trabajo', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`, {
            method: 'DELETE'
        })

        assert.strictEqual(response.status, 204)

        const getResponse = await fetch(`${BASE_URL}/jobs/${EXISTING_ID}`)
        assert.strictEqual(getResponse.status, 404)
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        const response = await fetch(`${BASE_URL}/jobs/${INVALID_ID}`, {
            method: 'DELETE'
        })

        assert.strictEqual(response.status, 404)
    })
})
