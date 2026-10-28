import { describe, it, expect } from 'vitest'
import { isHttpUrl } from '../isHttpUrl'

describe('isHttpUrl', () => {
  it('should accept http and https', () => {
    expect(isHttpUrl('http://example.com/feed')).toBe(true)
    expect(isHttpUrl('https://example.com/feed')).toBe(true)
  })

  it('should reject schemes that can execute, however they are cased', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('JavaScript:alert(1)')).toBe(false)
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(isHttpUrl('vbscript:msgbox(1)')).toBe(false)
  })

  it('should reject other schemes a feed URL has no reason to use', () => {
    expect(isHttpUrl('file:///etc/passwd')).toBe(false)
    expect(isHttpUrl('ftp://example.com/feed')).toBe(false)
  })

  it('should reject values new URL cannot parse', () => {
    expect(isHttpUrl('example.com/feed')).toBe(false)
    expect(isHttpUrl('not a url')).toBe(false)
  })

  it('should reject empty and absent values', () => {
    expect(isHttpUrl('')).toBe(false)
    expect(isHttpUrl(null)).toBe(false)
    expect(isHttpUrl(undefined)).toBe(false)
  })
})
