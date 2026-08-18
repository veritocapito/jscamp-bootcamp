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

function buildUrl(path = '/jobs') {
    const normalizedPath = path.startsWith('/')
        ? path
        : `/${path}`

    return `${BASE_URL}${normalizedPath}`
}

// Esto es opcional, lo hacemos para seguir con la dinámica de abstraes responsabilidades, y no saber como se hacen dentro de cada método. Pero tranquilamente lo podemos usar como `assert.strictEqual(response.status, expectedStatus)` en cada handler
function assertExpectedStatus(response, expectedStatus) {
    assert.strictEqual(response.status, expectedStatus)
}

// Las peticiones y el verificar el status se repite mucho, podemos simplificarlo en funciones
async function getAndAssertJson(path = '/jobs', expectedStatus = 200) {
    const response = await fetch(buildUrl(path))

    assertExpectedStatus(response, expectedStatus)

    return response.json()
}

async function postAndAssertJson(path = '/jobs', expectedStatus = 201, body) {
    const response = await fetch(buildUrl(path), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    assertExpectedStatus(response, expectedStatus)

    return response.json()
}

async function putAndAssertStatus(path, expectedStatus = 204, body) {
    const response = await fetch(buildUrl(path), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    assertExpectedStatus(response, expectedStatus)
}

async function patchAndAssertStatus(path, expectedStatus = 204, body) {
    const response = await fetch(buildUrl(path), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    assertExpectedStatus(response, expectedStatus)
}

async function deleteAndAssertStatus(path, expectedStatus = 204) {
    const response = await fetch(buildUrl(path), {
        method: 'DELETE'
    })

    assertExpectedStatus(response, expectedStatus)
}


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
        const json = await getAndAssertJson('/jobs')
        assert.ok(Array.isArray(json.data), 'La respuesta debe ser un array')
    })

    test('Debe filtrar trabajos por tecnología', async () => {
        const json = await getAndAssertJson('/jobs?technology=react')
        assert.ok(
            json.data.every((job) => job.data.technology.includes('react')),
            'La respuesta debe filtrar trabajos por tecnología'
        )
    })

    test('Debe respetar el límite de resultados', async () => {
        const json = await getAndAssertJson('/jobs?limit=2')

        assert.strictEqual(json.limit, 2)
        assert.strictEqual(json.data.length, 2)
    })

    test('Debe aplicar offset correctamente', async () => {
        const json = await getAndAssertJson('/jobs?offset=1')
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
        const json = await postAndAssertJson('/jobs', 201, newJob)

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
            await postAndAssertJson('/jobs', 400, job)
        }
    })

    test('Debe crear el trabajo sin descripción porque es opcional', async () => {
        const jobWithoutDescription = {
            titulo: 'Desarrollador Backend',
            empresa: 'Tech Company',
            ubicacion: 'Remoto'
        }

        const json = await postAndAssertJson('/jobs', 201, jobWithoutDescription)
        assert.ok(json.id, 'El job devuelto debe tener un ID generado')
        assert.strictEqual(json.titulo, jobWithoutDescription.titulo)
        assert.strictEqual(json.descripcion, undefined)
    })
})

describe('GET /jobs/:id', () => {
    const EXISTING_ID = 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57'

    test('Debe devolver el trabajo con el ID especificado', async () => {
        const json = await getAndAssertJson(`/jobs/${EXISTING_ID}`)
        assert.strictEqual(json.id, EXISTING_ID)
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        const json = await getAndAssertJson(`/jobs/${INVALID_ID}`, 404)
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
        await putAndAssertStatus(`/jobs/${EXISTING_ID}`, 204, updatedJob)

        const json = await getAndAssertJson(`/jobs/${EXISTING_ID}`)
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
        await putAndAssertStatus(`/jobs/${INVALID_ID}`, 404, updatedJob)
    })
})

describe('PATCH /jobs/:id', () => {
    const EXISTING_ID = 'f62d8a34-923a-4ac2-9b0b-14e0ac2f5405'

    test('Debe recibir 204 y actualizar solo los campos enviados', async () => {
        const originalJob = await getAndAssertJson(`/jobs/${EXISTING_ID}`)

        const partialJob = {
            titulo: 'Ingeniero de DevOps Senior',
            ubicacion: 'Barcelona'
        }

        await patchAndAssertStatus(`/jobs/${EXISTING_ID}`, 204, partialJob)

        const json = await getAndAssertJson(`/jobs/${EXISTING_ID}`)
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
        await patchAndAssertStatus(`/jobs/${INVALID_ID}`, 404, { titulo: 'Título nuevo' })
    })
})

describe('DELETE /jobs/:id', () => {
    const EXISTING_ID = 'a9f31a8e-ec38-4fd3-9114-88cc6d37a92b'

    test('Debe recibir 204 y eliminar el trabajo', async () => {
        await deleteAndAssertStatus(`/jobs/${EXISTING_ID}`)

        await getAndAssertJson(`/jobs/${EXISTING_ID}`, 404)
    })

    test('Debe devolver 404 cuando el ID no existe', async () => {
        await deleteAndAssertStatus(`/jobs/${INVALID_ID}`, 404)
    })
})
