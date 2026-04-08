/**
 * Utility Function Tests
 *
 * Tests formatting, slugification, order number generation,
 * and string manipulation utilities.
 */
import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPrice,
  formatPriceDollars,
  slugify,
  generateOrderNumber,
  truncate,
} from '@/lib/utils'

describe('cn (class name joiner)', () => {
  it('joins multiple class names', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', undefined, 'bar', null, false, 'baz')).toBe('foo bar baz')
  })

  it('returns empty string for no truthy values', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('handles empty string inputs', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })
})

describe('formatPrice (cents)', () => {
  it('formats cents to USD', () => {
    expect(formatPrice(4999)).toBe('$49.99')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats large amounts', () => {
    expect(formatPrice(100000)).toBe('$1,000.00')
  })
})

describe('formatPriceDollars', () => {
  it('formats dollars to USD', () => {
    expect(formatPriceDollars(49.99)).toBe('$49.99')
  })

  it('formats zero', () => {
    expect(formatPriceDollars(0)).toBe('$0.00')
  })

  it('formats with comma separators', () => {
    expect(formatPriceDollars(1234.56)).toBe('$1,234.56')
  })

  it('handles integer inputs', () => {
    expect(formatPriceDollars(100)).toBe('$100.00')
  })
})

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('BPC 157')).toBe('bpc-157')
  })

  it('removes special characters', () => {
    expect(slugify('CJC-1295 / Ipamorelin (Blend)')).toBe(
      'cjc-1295-ipamorelin-blend'
    )
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify(' -Hello World- ')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('generateOrderNumber', () => {
  it('starts with AZ- prefix', () => {
    const orderNum = generateOrderNumber()
    expect(orderNum).toMatch(/^AZ-/)
  })

  it('generates unique order numbers', () => {
    const numbers = new Set(
      Array.from({ length: 50 }, () => generateOrderNumber())
    )
    // With 50 generations, all should be unique
    expect(numbers.size).toBe(50)
  })

  it('contains only valid characters (uppercase alphanumeric + hyphen)', () => {
    const orderNum = generateOrderNumber()
    expect(orderNum).toMatch(/^AZ-[A-Z0-9]+$/)
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('does not truncate short strings', () => {
    expect(truncate('Hi', 10)).toBe('Hi')
  })

  it('does not truncate exact-length strings', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })
})
