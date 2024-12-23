import { parseHeader } from './header.js'
import { asciiReader } from './reader.js'

import {
  Pbm, PbmAsciiBool, PbmAsciiU8, PbmBinaryBool, PbmBinaryU8, PbmEncoding,
  PbmMode, Size
} from './types.js'

type PbmEncodingArg = PbmEncoding | 'bool'

export const parsePbm = (
  bytes: Uint8Array | Uint8ClampedArray,
  mode: PbmMode = 'ink',
  encoding: PbmEncodingArg = 'bool'
) => {
  const header = parseHeader(bytes)

  if (header.magic !== 'P1' && header.magic !== 'P4') {
    throw Error(`Invalid magic header: "${header.magic}"`)
  }

  const bools = Array<boolean>(header.width * header.height)

  if (header.magic === 'P1') {
    const reader = asciiReader(bytes)

    reader.seek(header.dataOffset)

    for (let y = 0; y < header.height; y++) {
      for (let x = 0; x < header.width; x++) {
        const index = y * header.width + x
        const bit = reader.next(1) === '1'

        bools[index] = mode === 'ink' ? bit : !bit
      }
    }

    if (encoding === 'bool') {
      const pbm: PbmAsciiBool = {
        magic: 'P1',
        width: header.width,
        height: header.height,
        data: bools,
        mode
      }

      return pbm
    }

    const data = encode(header, bools, encoding)

    const pbm: PbmAsciiU8 = {
      magic: 'P1',
      width: header.width,
      height: header.height,
      data,
      mode,
      encoding
    }

    return pbm
  }

  const rowBytes = Math.ceil(header.width / 8)

  for (let y = 0; y < header.height; y++) {
    for (let x = 0; x < header.width; x++) {
      const index = y * header.width + x

      const byteIndex = y * rowBytes + Math.floor(x / 8)

      const bit = (bytes[header.dataOffset + byteIndex] >> (7 - (x % 8))) & 1

      bools[index] = mode === 'ink' ? bit === 1 : bit === 0
    }
  }

  if (encoding === 'bool') {
    const pbm: PbmBinaryBool = {
      magic: 'P4',
      width: header.width,
      height: header.height,
      data: bools,
      mode
    }

    return pbm
  }

  const data = encode(header, bools, encoding)

  const pbm: PbmBinaryU8 = {
    magic: 'P4',
    width: header.width,
    height: header.height,
    data,
    mode,
    encoding
  }

  return pbm
}

const encode = (
  { width, height }: Size, bools: boolean[], encoding: PbmEncodingArg
): Uint8ClampedArray => {
  if (encoding === 'rgba') {
    const data = new Uint8ClampedArray(width * height * 4)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x
        const rgbaIndex = index * 4

        const value = bools[index] ? 0 : 255

        data[rgbaIndex + 0] = value
        data[rgbaIndex + 1] = value
        data[rgbaIndex + 2] = value
        data[rgbaIndex + 3] = 255
      }
    }

    return data
  }

  if (encoding === 'perPixel') {
    const data = new Uint8ClampedArray(bools.length)

    for (let i = 0; i < bools.length; i++) {
      data[i] = bools[i] ? 1 : 0
    }

    return data
  }

  // padding at end of each row
  if (encoding === 'packedRows') {
    const rowBytes = Math.ceil(width / 8)
    const size = rowBytes * height

    const data = new Uint8ClampedArray(size)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * rowBytes + Math.floor(x / 8)
        const bit = bools[y * width + x] ? 1 : 0

        data[index] |= bit << (7 - (x % 8))
      }
    }

    return data
  }

  //padding at end of data
  if (encoding === 'packedFile') {
    const size = Math.ceil(width * height / 8)

    const data = new Uint8ClampedArray(size)

    for (let i = 0; i < bools.length; i++) {
      const index = Math.floor(i / 8)
      const bit = bools[i] ? 1 : 0

      data[index] |= bit << (7 - (i % 8))
    }

    return data
  }

  throw Error(`Invalid encoding: "${encoding}"`)
}

const textEncoder = new TextEncoder()

export const encodePbm = (pbm: Pbm): Uint8ClampedArray => {
  const encoding = pbm.encoding || 'bool'

  let bools = Array<boolean>(pbm.width * pbm.height)

  if (encoding === 'bool') {
    bools = pbm.data as boolean[]
  } else if (encoding === 'perPixel') {
    for (let i = 0; i < pbm.data.length; i++) {
      bools[i] = (pbm.data as Uint8ClampedArray)[i] === 1
    }
  } else if (encoding === 'packedRows') {
    const rowBytes = Math.ceil(pbm.width / 8)

    for (let y = 0; y < pbm.height; y++) {
      for (let x = 0; x < pbm.width; x++) {
        const index = y * pbm.width + x
        const byteIndex = y * rowBytes + Math.floor(x / 8)

        bools[index] = ((pbm.data as Uint8ClampedArray)[byteIndex] >> (7 - (x % 8))) === 1
      }
    }
  } else if (encoding === 'packedFile') {
    for (let i = 0; i < pbm.data.length; i++) {
      const index = Math.floor(i / 8)

      bools[i] = ((pbm.data as Uint8ClampedArray)[index] >> (7 - (i % 8))) === 1
    }
  } else if (encoding === 'rgba') {
    for (let i = 0; i < bools.length; i++) {
      bools[i] = (pbm.data as Uint8ClampedArray)[i * 4] === 0
    }
  } else {
    throw Error(`Invalid encoding: "${encoding}"`)
  }

  if (pbm.mode !== 'ink') {
    bools = bools.map(bit => !bit)
  }

  const header = `${pbm.magic}\n${pbm.width} ${pbm.height}\n`

  const headerData = textEncoder.encode(header)
  let pixelData: Uint8Array | Uint8ClampedArray

  if (pbm.magic === 'P1') {
    let ascii = ''

    for (let y = 0; y < pbm.height; y++) {
      for (let x = 0; x < pbm.width; x++) {
        const index = y * pbm.width + x

        ascii += bools[index] ? '1' : '0'
      }

      ascii += '\n'
    }

    pixelData = textEncoder.encode(ascii)
  } else {
    pixelData = encode(
      { width: pbm.width, height: pbm.height }, bools, 'packedRows'
    )
  }

  const size = headerData.length + pixelData.length

  const result = new Uint8ClampedArray(size)

  result.set(headerData)
  result.set(pixelData, headerData.length)

  return result
}
