/**
 * Whether a string is a URL this site will follow or render as a link.
 *
 * Only `http:` and `https:` qualify. `new URL()` alone is not enough: it
 * parses `javascript:alert(1)` happily, because that is a well-formed
 * absolute URL, and so does an `<input type='url'>`, which constrains the
 * form but not the scheme. See #515.
 */
export const isHttpUrl = (value: string | undefined | null): boolean => {
  if (!value) return false
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
