/**
 * The normalised form of a URL this site will follow or render as a link,
 * or undefined if it is not one. Only `http:` and `https:` qualify.
 *
 * Returns the parsed URL's own href rather than the string passed in, so
 * callers put a value produced by the URL parser into the sink instead of
 * the original text.
 *
 * `new URL()` alone is not enough to make that decision: it parses
 * `javascript:alert(1)` happily, because that is a well-formed absolute
 * URL, and so does an `<input type='url'>`, which constrains the form but
 * not the scheme. See #515.
 */
export const toHttpUrl = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

/** Whether a value is an http(s) URL. See {@link toHttpUrl}. */
export const isHttpUrl = (value: string | undefined | null): boolean =>
  toHttpUrl(value) !== undefined
