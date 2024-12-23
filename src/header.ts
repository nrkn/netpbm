import { pamMagic, pbmAsciiMagic, pbmBinaryMagic } from './const.js'
import { isMagic, isTupleType } from './predicates.js'
import { asciiReader } from './reader.js'
import { AsciiReader, Header, PamHeader, PbmHeader } from './types.js'

const getValue = (
  reader: AsciiReader, name: string, inclMin = 1, inclMax = -1
): number => {
  const v = reader.next()
  const value = parseInt(v)

  if (isNaN(value)) {
    throw Error(`${name} not a number: "${v}"`)
  }

  if (inclMin !== -1 && value < inclMin) {
    throw Error(`${name} less than ${inclMin}: ${value}`)
  }

  if (inclMax !== -1 && value > inclMax) {
    throw Error(`${name} greater than ${inclMax}: ${value}`)
  }

  return value
}

const expectMarker = (
  reader: AsciiReader, marker: string, ...alts: string[]
): void => {
  const m = reader.next()

  if (m === marker || alts.includes(m)) return

  throw Error(`Invalid marker: "${m}"`)
}

const parsePam = (reader: AsciiReader): PamHeader => {
  // consider allowing out of order - i think the spec allows it
  expectMarker(reader, 'WIDTH')

  const width = getValue(reader, 'width')

  expectMarker(reader, 'HEIGHT')

  const height = getValue(reader, 'height')

  expectMarker(reader, 'DEPTH')

  const depth = getValue(reader, 'depth', 1)

  expectMarker(reader, 'MAXVAL')

  // nb greyscale actually has a min of 2
  // out of order reading would help with this, we could get them first and
  // then verify 
  const max = getValue(reader, 'max', 1, 65535)

  expectMarker(reader, 'TUPLTYPE', 'TUPLETYPE')

  const tupleType = reader.next()

  // consider having a strict mode, if false we allow custom tuple types
  if (!isTupleType(tupleType))
    throw Error(`Invalid tuple type: "${tupleType}"`)

  expectMarker(reader, 'ENDHDR')

  const dataOffset = reader.dataOffset()

  const pamHeader: PamHeader = {
    magic: pamMagic,
    width,
    height,
    depth,
    max,
    tupleType,
    dataOffset
  }

  return pamHeader
}

export const parseHeader = (data: Uint8Array | Uint8ClampedArray): Header => {
  const reader = asciiReader(data)

  const magic = reader.next()

  if (!isMagic(magic)) throw Error(`Invalid magic header: "${magic}"`)

  // all others are consistent except pam and pbm, handle those first
  if (magic === pamMagic) {
    return parsePam(reader)
  }

  // everyone except pam starts with width and height
  const width = getValue(reader, 'width')
  const height = getValue(reader, 'height')

  if (magic === pbmAsciiMagic || magic === pbmBinaryMagic) {
    const dataOffset = reader.dataOffset()

    const pbmHeader: PbmHeader = {
      magic,
      width,
      height,
      dataOffset
    }

    return pbmHeader
  }

  const max = getValue(reader, 'max', 1, 65535)

  const dataOffset = reader.dataOffset()

  const header: Header = {
    magic,
    width,
    height,
    max,
    dataOffset
  }

  return header
}
