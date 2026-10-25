import axios from 'axios'

export class ApiError extends Error {
  status: number | null
  fields: Record<string, string>

  constructor(
    message: string,
    options: { status?: number | null; fields?: Record<string, string> } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.fields = options.fields ?? {}
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item)
      if (message) return message
    }
  }
  return null
}

function extractFieldErrors(data: unknown) {
  const fields: Record<string, string> = {}
  const record = asRecord(data)
  if (!record) return fields

  for (const [key, value] of Object.entries(record)) {
    if (['detail', 'non_field_errors'].includes(key)) continue
    const message = firstMessage(value)
    if (message) fields[key] = message
  }

  const general = firstMessage(record.non_field_errors)
  if (general) fields.__all__ = general

  return fields
}

function extractDetail(data: unknown): string | null {
  const record = asRecord(data)
  if (!record) return firstMessage(data)
  return firstMessage(record.detail) ?? firstMessage(record.non_field_errors)
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        'Unable to reach the server. Check your connection and try again.',
      )
    }

    const { status, data } = error.response
    const detail = extractDetail(data)
    const fields = extractFieldErrors(data)

    let message = detail ?? fields.__all__
    if (!message) {
      if (status === 401) {
        message = 'Please sign in to continue.'
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.'
      } else if (status === 404) {
        message = 'The requested item could not be found.'
      } else if (status >= 500) {
        message =
          'The server ran into a problem. Please try again in a moment.'
      } else {
        message = 'Something went wrong. Please review the form and try again.'
      }
    }

    return new ApiError(message, { status, fields })
  }

  if (error instanceof Error && error.message) {
    return new ApiError(error.message)
  }

  return new ApiError('Something went wrong. Please try again.')
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  return normalizeApiError(error).message || fallback
}

export function getFieldError(error: unknown, field: string) {
  return normalizeApiError(error).fields[field]
}

export function isUnauthorized(error: unknown) {
  return normalizeApiError(error).status === 401
}
