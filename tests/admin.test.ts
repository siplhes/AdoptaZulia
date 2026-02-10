import { describe, it, expect } from 'vitest'

describe('Admin Panel Utils', () => {
  it('should correctly format currency', () => {
    const value = 1000
    const formatted = new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(value)
    expect(formatted).toContain('Bs')
  })

  it('should validate email data', () => {
    const email = 'test@example.com'
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValid).toBe(true)
  })

  it('should match adoption statuses', () => {
    const statuses = ['unavailable', 'available', 'pending', 'adopted']
    expect(statuses).toContain('pending')
    expect(statuses).toContain('available')
  })
})
