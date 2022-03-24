// https://github.com/microsoft/TypeScript/issues/14877#issuecomment-872329108
const sw = self as ServiceWorkerGlobalScope & typeof globalThis

const Caches = {
  Api: 'api',
  Assets: 'assets',
}

self.importScripts('/sw-cache.js')

sw.addEventListener('install', handleInstallEvent)
sw.addEventListener('activate', handleActivateEvent)
sw.addEventListener('message', handleMessageEvent)
sw.addEventListener('fetch', handleFetchEvent)

function handleInstallEvent(event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys()

      for (const key of cacheKeys) {
        if (key === Caches.Assets) {
          await caches.delete(key)
        }
      }

      const cache = await caches.open(Caches.Assets)

      for (const asset of HAKU_ASSETS) {
        await cache.add(new Request(asset, { cache: 'reload' }))
      }
    })()
  )
}

function handleActivateEvent(event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in sw.registration) {
        await sw.registration.navigationPreload.enable()
      }
    })()
  )
}

function handleMessageEvent(event: ExtendableMessageEvent) {
  if (typeof event.data !== 'object' || typeof event.data.type !== 'string') {
    return
  }

  switch (event.data.type) {
    case 'UPDATE': {
      sw.skipWaiting()

      break
    }
    case 'CLEAR': {
      clearCache(Caches.Api, 50)

      break
    }
    default: {
      console.error('Unsupported service worker message type.')
    }
  }
}

function handleFetchEvent(event: FetchEvent) {
  if (event.request.method !== 'GET' || event.request.headers.has('range')) {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (requestUrl.origin === location.origin) {
    const isDev = requestUrl.searchParams.get('ts')

    if (!isDev) {
      if (/^\/(?:_next\/static|images)\/.*\.(?:js|css|png|jpg)$/i.test(requestUrl.pathname)) {
        return respondWithCacheThenNetwork(event, Caches.Assets)
      } else if (/^\/api\/.*(?<!csrf)$/i.test(requestUrl.pathname)) {
        return respondWithNetworkThenCache(event, Caches.Api)
      } else if (
        event.request.mode === 'navigate' ||
        event.request.headers.get('accept')?.startsWith('text/html') ||
        requestUrl.pathname === '/manifest.webmanifest'
      ) {
        return respondWithPage(event, requestUrl.pathname)
      } else {
        // FIXME(HiDeoo)
        console.log('NOT HANDLED', event.request.url)
      }
    } else {
      // FIXME(HiDeoo)
      console.log('IS DEV', event.request.url)
    }
  }
}

function respondWithCacheThenNetwork(event: FetchEvent, cacheName: string) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      return fetchAndCacheResponse(event, cacheName)
    })()
  )
}

function respondWithNetworkThenCache(event: FetchEvent, cacheName: string) {
  event.respondWith(
    (async () => {
      try {
        return await fetchAndCacheResponse(event, cacheName, true)
      } catch (error) {
        // Silently fallback to the cache if the network request failed.
      }

      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      return respondWithNetworkError()
    })()
  )
}

function respondWithPage(event: FetchEvent, pathName: string) {
  const isNotePage = /^\/notes\/.+$/i.test(pathName)
  const isTodoPage = /^\/todos\/.+$/i.test(pathName)

  const requestInfo = isNotePage ? '/notes/[id]' : isTodoPage ? '/todos/[id]' : event.request

  event.respondWith(
    (async () => {
      try {
        // For navigation related event, it looks like we have to consume the preload response first before even
        // querying the cache or the browser will emit an error about the preload request being cancelled before the
        // response.
        const preloadResponse = await preloadAndCacheResponse(event, Caches.Assets, requestInfo)

        if (preloadResponse) {
          return preloadResponse
        }
      } catch (error) {
        // Silently fallback to the cache if the preload request failed.
      }

      const cache = await caches.open(Caches.Assets)
      const cachedResponse = await cache.match(requestInfo)

      if (cachedResponse) {
        return cachedResponse
      }

      try {
        return await fetchAndCacheResponse(event, Caches.Assets, true, requestInfo, false)
      } catch (error) {
        return cache.match('/offline')
      }
    })()
  )
}

async function fetchAndCacheResponse(
  event: FetchEvent,
  cacheName: string,
  throwOnNetworkError = false,
  cacheRequestInfo: RequestInfo = event.request,
  usePreload = true
) {
  try {
    if (usePreload) {
      const preloadResponse = await preloadAndCacheResponse(event, cacheName, cacheRequestInfo)

      if (preloadResponse) {
        return preloadResponse
      }
    }

    const networkResponse = await fetch(event.request)

    await cacheResponse(cacheRequestInfo, networkResponse, cacheName)

    return networkResponse
  } catch (error) {
    if (!throwOnNetworkError) {
      return respondWithNetworkError()
    }

    throw error
  }
}

async function preloadAndCacheResponse(
  event: FetchEvent,
  cacheName: string,
  cacheRequestInfo: RequestInfo = event.request
) {
  const preloadResponse = await event.preloadResponse

  if (preloadResponse) {
    await cacheResponse(cacheRequestInfo, preloadResponse, cacheName)

    return preloadResponse
  }
}

async function cacheResponse(requestInfo: RequestInfo, response: Response, cacheName: string) {
  if (response && response.ok) {
    const cache = await caches.open(cacheName)

    cache.put(requestInfo, response.clone())
  }
}

function respondWithNetworkError() {
  return new Response('Network fetch error', { status: 408, headers: { 'Content-Type': 'text/plain' } })
}

async function clearCache(cacheName: string, maxEntries: number) {
  const cache = await caches.open(cacheName)
  const cacheKeys = await cache.keys()
  const firstKey = cacheKeys[0]

  // Delete a bit more entries so that we don't have to clear the cache too often.
  if (cacheKeys.length > maxEntries - Math.round(maxEntries / 5) && firstKey) {
    await cache.delete(firstKey)

    clearCache(cacheName, maxEntries)
  }
}

declare const HAKU_ASSETS: string[]
