import { describe, it, expect } from 'vitest'
import { visDis, obsEx, Fujiobs, fujiObsEx, directionMap } from '../constants.js'

describe('constants', () => {
  it('visDis が10段階で定義されている', () => {
    expect(Object.keys(visDis)).toHaveLength(10)
    expect(visDis[0]).toBe('0~0.1km')
    expect(visDis[9]).toBe('36km~')
  })

  it('obsEx が10段階で定義されている', () => {
    expect(Object.keys(obsEx)).toHaveLength(10)
    expect(obsEx[9]).toBe('東京スカイツリーの識別が可能')
  })

  it('Fujiobs が3段階で定義されている', () => {
    expect(Fujiobs[0]).toBe('×')
    expect(Fujiobs[1]).toBe('△')
    expect(Fujiobs[2]).toBe('〇')
  })

  it('fujiObsEx が3段階で定義されている', () => {
    expect(fujiObsEx[0]).toBe('見えない')
    expect(fujiObsEx[1]).toBe('部分的に見える')
    expect(fujiObsEx[2]).toBe('見える')
  })

  it('directionMap にZenithが含まれている', () => {
    expect(directionMap['Zenith']).toBe('天頂')
    expect(directionMap['North']).toBe('北')
  })
})
