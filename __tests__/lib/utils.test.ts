import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4 py-2', 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', {
      'active-class': true,
      'inactive-class': false,
    })
    expect(result).toBe('base-class active-class')
  })

  it('should override conflicting classes', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['base', 'text-sm'], 'font-bold')
    expect(result).toBe('base text-sm font-bold')
  })

  it('should filter out falsy values', () => {
    const result = cn('base', null, undefined, false, '', 'valid')
    expect(result).toBe('base valid')
  })
})