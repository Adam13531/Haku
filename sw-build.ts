import fs from 'fs/promises'

import * as swc from '@swc/core'
import { type BuildManifest } from 'next/dist/server/get-page-files'

import pkg from './package.json'

import { SW_CACHES } from 'constants/sw'
import { CLOUDINARY_BASE_DELIVERY_URL } from 'libs/cloudinary'

const buildManifestPath = '.next/build-manifest.json'
const pageToIgnore = ['/_app', '/_error']
const pathPrefix = '/_next/'

const [, , ...args] = process.argv
const isProd = args.includes('--prod')

const swcOptions: swc.Options = { minify: isProd, jsc: { target: 'es2015' } }

async function build() {
  try {
    await buildServiceWorker()
    await buildServiceWorkerConfig()
  } catch (error) {
    console.error('Unable to build service worker:', error)

    process.exit(1)
  }
}

async function buildServiceWorker() {
  const { code } = await swc.transformFile('src/sw/sw.ts', swcOptions)

  return fs.writeFile('./public/sw.js', code)
}

async function buildServiceWorkerConfig() {
  let buildManifest: BuildManifest

  if (isProd) {
    try {
      const rawBuildManifest = await fs.readFile(buildManifestPath, 'utf8')
      buildManifest = JSON.parse(rawBuildManifest)
    } catch (error) {
      throw new Error(`Unable to open build manifest at '${buildManifestPath}'.`)
    }
  } else {
    buildManifest = { lowPriorityFiles: [], pages: {}, polyfillFiles: [] } as unknown as BuildManifest
  }

  const assets = new Set<string>(isProd ? ['/offline', '/manifest.webmanifest'] : [])

  Object.entries(buildManifest.pages).forEach(([page, files]) => {
    if (!pageToIgnore.includes(page)) {
      assets.add(page)
    }

    files.forEach((file) => assets.add(getAssetPath(file)))
  })

  buildManifest.lowPriorityFiles.forEach((file) => assets.add(getAssetPath(file)))
  buildManifest.polyfillFiles.forEach((file) => assets.add(getAssetPath(file)))

  const { code } = await swc.transform(
    `const VERSION = '${pkg.version}';

const IS_PROD = ${isProd};

const IMAGE_DELIVERY_URL = '${CLOUDINARY_BASE_DELIVERY_URL}';

const ASSETS = ${JSON.stringify(Array.from(assets))};

const CACHES = ${JSON.stringify(SW_CACHES)};`,
    swcOptions
  )

  return fs.writeFile('./public/sw-config.js', code)
}

function getAssetPath(file: string) {
  return `${pathPrefix}${file}`
}

build()
