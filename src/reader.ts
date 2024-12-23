import { AsciiReader } from './types.js'

const SP = 32 // Space
const NL = 10 // New Line
const CR = 13 // Carriage Return
const COMMENT = 35 // #

export const asciiReader = (
  data: Uint8Array | Uint8ClampedArray, strict = false
): AsciiReader => {
  let i = 0

  // allow reading 1 character at a time for eg pbm ascii
  const next = ( maxLength?: number ): string => {
    let current = ''

    while (i < data.length) {
      const byte = data[i]

      if (byte === SP || byte === NL) {
        i++

        if (current !== '') break

        continue
      }

      if (byte === CR) {
        if (strict) throw Error('Unexpected carriage return')

        i++

        continue
      }

      if (byte === COMMENT) {
        i++

        while (i < data.length && data[i] !== NL) i++

        continue
      }

      current += String.fromCharCode(byte)
      i++

      if( maxLength !== undefined && current.length === maxLength ) break
    }

    return current
  }

  const dataOffset = () => i

  const seek = (offset: number) => {
    i = offset
  }

  const peek = (): string => {
    const before = i

    const value = next()

    i = before

    return value
  }

  return { next, dataOffset, seek, peek }
}
