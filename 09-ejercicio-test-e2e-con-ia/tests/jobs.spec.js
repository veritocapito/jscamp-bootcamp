import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'
const JOB_CARD = '.job-listing-card'

const SECCIONES_DETALLE = [
  'Descripción del puesto',
  'Responsabilidades',
  'Requisitos',
  'Acerca de la empresa'
]

async function esperarResultados(page) {
  const jobCards = page.locator(JOB_CARD)
  await expect(jobCards.first()).toBeVisible()

  return jobCards
}

async function abrirBusqueda(page) {
  await page.goto(`${BASE_URL}/search`)

  return esperarResultados(page)
}

async function buscarDesdeLaHome(page, texto) {
  await page.goto(BASE_URL)
  await page.getByRole('searchbox').fill(texto)
  await page.getByRole('button', { name: 'Buscar' }).click()

  return esperarResultados(page)
}

async function abrirPrimerEmpleo(page) {
  const enlace = page.locator(JOB_CARD).first().getByRole('link')
  const titulo = await enlace.innerText()

  await enlace.click()
  await expect(page).toHaveURL(/\/job\//)

  return titulo
}

async function todasLasCardsTienen(jobCards, atributo, valor) {
  const total = await jobCards.count()

  for (let i = 0; i < total; i++) {
    await expect(jobCards.nth(i)).toHaveAttribute(atributo, valor)
  }
}

//Segundo ejercicio: Test de navegación básica
test.describe('Navegación básica', () => {
  test('La página principal carga y muestra el buscador', async ({ page }) => {
    await page.goto(BASE_URL)

    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toBeVisible()
  })
})

//Tercer ejercicio: Test de búsqueda de empleos
test.describe('Búsqueda de empleos', () => {
  test('Buscar "React" muestra resultados', async ({ page }) => {
    const jobCards = await buscarDesdeLaHome(page, 'React')

    const titulo = jobCards.first().getByRole('heading', { level: 3 })
    await expect(titulo).toBeVisible()
  })
})

//Cuarto ejercicio: Test de flujo completo de aplicación
test.describe('Flujo completo de aplicación', () => {
  test('Buscar, ver el detalle, iniciar sesión y aplicar', async ({ page }) => {
    await buscarDesdeLaHome(page, 'JavaScript')

    const tituloEsperado = await abrirPrimerEmpleo(page)
    await expect(page.getByRole('heading', { level: 1, name: tituloEsperado })).toBeVisible()

    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()

    const botonAplicar = page.getByRole('button', { name: 'Aplicar ahora' }).first()
    await botonAplicar.click()

    await expect(page.getByRole('button', { name: 'Ya aplicaste' }).first()).toBeVisible()
  })
})

//Quinto ejercicio: Test de filtros
test.describe('Filtros', () => {
  test('Filtrar por ubicación devuelve solo empleos remotos', async ({ page }) => {
    const jobCards = await abrirBusqueda(page)

    await page.getByRole('combobox', { name: 'Ubicación' }).selectOption('remoto')
    await expect(page).toHaveURL(/type=remoto/)
    await expect(jobCards.first()).toBeVisible()

    await todasLasCardsTienen(jobCards, 'data-modalidad', 'remoto')
  })

  test('Filtrar por nivel devuelve solo empleos senior', async ({ page }) => {
    const jobCards = await abrirBusqueda(page)

    await page.getByRole('combobox', { name: 'Nivel de experiencia' }).selectOption('senior')
    await expect(page).toHaveURL(/level=senior/)
    await expect(jobCards.first()).toBeVisible()

    await todasLasCardsTienen(jobCards, 'data-nivel', 'senior')
  })
})

//Sexto ejercicio: Test de paginación
test.describe('Paginación', () => {
  test('Aparece la paginación cuando hay más resultados de los que entran en una página', async ({ page }) => {
    await abrirBusqueda(page)

    await expect(page.getByRole('link', { name: '2', exact: true })).toBeVisible()
  })

  test('Ir a la página siguiente cambia los resultados', async ({ page }) => {
    const jobCards = await abrirBusqueda(page)

    const primerTitulo = jobCards.first().getByRole('heading', { level: 3 })
    const tituloPaginaUno = await primerTitulo.innerText()

    await page.getByRole('link', { name: 'Siguiente' }).click()
    await expect(page).toHaveURL(/page=2/)

    await expect(primerTitulo).not.toHaveText(tituloPaginaUno)
  })
})

//Séptimo ejercicio: Test de detalle de empleo
test.describe('Detalle de empleo', () => {
  test('Al hacer clic en un resultado se muestra el detalle del empleo', async ({ page }) => {
    await abrirBusqueda(page)

    const tituloEsperado = await abrirPrimerEmpleo(page)
    await expect(page.getByRole('heading', { level: 1, name: tituloEsperado })).toBeVisible()

    for (const seccion of SECCIONES_DETALLE) {
      await expect(page.getByRole('heading', { level: 2, name: seccion })).toBeVisible()
    }
  })

  test('Se puede aplicar al empleo desde el detalle', async ({ page }) => {
    await abrirBusqueda(page)
    await abrirPrimerEmpleo(page)

    const botonAplicar = page.getByRole('button', { name: 'Aplicar ahora' }).first()
    await expect(botonAplicar).toBeVisible()

    await botonAplicar.click()

    await expect(page.getByRole('button', { name: 'Ya aplicaste' }).first()).toBeVisible()
  })
})
