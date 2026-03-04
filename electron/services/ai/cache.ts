const cache = new Map<string, string>()
const MAX_SIZE = 200

export function getCached(key: string): string | null {
  return cache.get(key) ?? null
}

export function setCache(key: string, value: string): void {
  if (cache.size >= MAX_SIZE) {
    const first = cache.keys().next().value
    if (first !== undefined) cache.delete(first)
  }
  cache.set(key, value)
}

export function makeCacheKey(text: string): string {
  return Buffer.from(text).toString('base64')
}
