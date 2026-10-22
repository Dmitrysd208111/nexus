import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { log } from 'node:console'

// GitHub Pages has no SPA rewrites. Real HTML entries let every known route
// open directly (including query strings) without depending on a 404 redirect.
const output = resolve('dist')
const routes = [
  'overview',
  'analytics',
  'orders',
  'customers',
  'products',
  'reports',
  'settings',
  'login',
]
for (const route of routes) {
  const directory = resolve(output, route)
  await mkdir(directory, { recursive: true })
  await copyFile(resolve(output, 'index.html'), resolve(directory, 'index.html'))
}
await copyFile(resolve(output, 'index.html'), resolve(output, '404.html'))
await writeFile(resolve(output, '.nojekyll'), '')
log(`Prepared ${routes.length} direct route entries and the GitHub Pages 404 fallback.`)
