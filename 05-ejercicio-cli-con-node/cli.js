import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const args = process.argv.slice(2)

// El primer argumento que no sea un flag es la carpeta
const folder = args.find((arg) => !arg.startsWith('--')) ?? '.'

const orderAsc = args.includes('--asc')
const orderDesc = args.includes('--desc')
const onlyFiles = args.includes('--files')
const onlyFolders = args.includes('--folders')

function formatSize (bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Comprobar permisos de lectura al inicio
if (!process.permission) {
  console.error('El modelo de permisos no está activado.')
}

if (!process.permission.has('fs.read', folder)) {
  console.error(`No tienes permisos de lectura sobre: ${folder}`)
}

// Leer el directorio
let names
try {
  names = await readdir(folder)
} catch {
  console.error(`No se pudo leer el directorio: ${folder}`)
}

// Obtener info de cada archivo/carpeta
let items = await Promise.all(
  names.map(async (name) => {
    const stats = await stat(join(folder, name))
    const isDirectory = stats.isDirectory()
    return {
      name,
      isDirectory,
      size: isDirectory ? '-' : formatSize(stats.size)
    }
  })
)

// Filtrar
if (onlyFiles) items = items.filter((item) => !item.isDirectory)
if (onlyFolders) items = items.filter((item) => item.isDirectory)

// Ordenar por nombre
if (orderAsc) items.sort((a, b) => a.name.localeCompare(b.name))
if (orderDesc) items.sort((a, b) => b.name.localeCompare(a.name))

// Mostrar el resultado
items.forEach(({ name, isDirectory, size }) => {
  const icon = isDirectory ? '📁' : '📄'
  console.log(`${icon} ${name.padEnd(25)} ${size.padStart(10)}`)
})
