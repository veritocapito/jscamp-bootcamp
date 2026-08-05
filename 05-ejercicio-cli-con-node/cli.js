import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))

// El primer argumento que no sea un flag es la carpeta
const folder = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? '.'

const orderAsc = args.has('--asc')
const orderDesc = args.has('--desc')
const onlyFiles = args.has('--files')
const onlyFolders = args.has('--folders')

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Comprobar permisos de lectura al inicio
if(!process.permission?.has('fs.read', folder)) {
  console.error(`No tienes permisos de lectura sobre: ${folder} Para acceder a ${folder}, debes ingresar:
  node --permission --allow-fs-read=${folder} cli.js ${folder}`)
  process.exit(1)
}

// Leer el directorio
let names
try {
  names = await readdir(folder)
} catch {
  console.error(`No se pudo leer el directorio: ${folder}`)
  process.exit(1)
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
  console.log(`${icon} ${name.padEnd(45)} ${size.padStart(10)}`)
})
