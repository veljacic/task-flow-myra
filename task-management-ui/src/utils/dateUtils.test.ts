import { describe, it, expect } from 'vitest'
import { getISODate } from './dateUtils'

describe('dateUtils', () => {
  describe('getISODate', () => {
    it('should return ISO date string without time', () => {
      const date = new Date('2023-12-25T15:30:45.123Z')
      const result = getISODate(date)
      expect(result).toBe('2023-12-25')
    })

    it('should handle different dates correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const result = getISODate(date)
      expect(result).toBe('2024-01-01')
    })

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29T12:00:00.000Z')
      const result = getISODate(date)
      expect(result).toBe('2024-02-29')
    })
  })
})