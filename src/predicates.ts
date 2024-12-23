import { netPbmMagics, pamTupleTypes } from './const.js'
import { NetPbmMagic, PamTupleType } from './types.js'

const magicLookup: Record<NetPbmMagic, boolean> = netPbmMagics.reduce(
  (acc, magic) => {
    acc[magic] = true

    return acc
  },
  {} as Record<NetPbmMagic, boolean>
)

export const isMagic = (value: string): value is NetPbmMagic =>
  magicLookup[value as NetPbmMagic]

const tupleLookup: Record<PamTupleType, boolean> = pamTupleTypes.reduce(
  (acc, tuple) => {
    acc[tuple] = true

    return acc
  },
  {} as Record<PamTupleType, boolean>
)

export const isTupleType = (value: string): value is PamTupleType =>
  tupleLookup[value as PamTupleType]
