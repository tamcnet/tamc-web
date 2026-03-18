import { describe, it, expect } from 'vitest'
import api from '../api.js'

describe('api', () => {
  it('baseURLが設定されている', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5000')
  })
})
