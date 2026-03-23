const BASE_URL = 'https://petstore3.swagger.io/api/v3'

let getAuthState: (() => { token: string | null }) | null = null
let onSessionExpired: (() => void) | null = null

export function setAuthStoreAccessor(accessor: () => { token: string | null }) {
  getAuthState = accessor
}

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

export async function customInstance<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const authState = getAuthState?.()
  if (authState?.token) {
    headers.set('api_key', authState.token)
  }

  const fullUrl = `${BASE_URL}${url}`

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  const expiresAfter = response.headers.get('X-Expires-After')
  if (expiresAfter) {
    const expiryDate = new Date(expiresAfter)
    if (expiryDate < new Date()) {
      onSessionExpired?.()
      throw new Error('Session expired')
    }
  }

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`) as Error & {
      status: number
      data: unknown
    }
    error.status = response.status
    try {
      error.data = await response.json()
    } catch {
      error.data = null
    }
    throw error
  }

  const text = await response.text()
  let data: unknown
  try {
    const safeText = text.replace(
      /("(?:id|petId)")\s*:\s*(\d{16,})/g,
      '$1:"$2"',
    )
    data = JSON.parse(safeText)
  } catch {
    data = text
  }

  return { data, status: response.status, headers: response.headers } as T
}

export function fetchPetByStringId(petId: string, signal?: AbortSignal) {
  return customInstance<{ data: unknown; status: number; headers: Headers }>(
    `/pet/${petId}`,
    { method: 'GET', signal },
  )
}

export function deletePetByStringId(petId: string) {
  return customInstance<{ data: unknown; status: number; headers: Headers }>(
    `/pet/${petId}`,
    { method: 'DELETE' },
  )
}

export default customInstance
