import {
  pbmAsciiMagic, pgmAsciiMagic, ppmAsciiMagic, pbmBinaryMagic, pgmBinaryMagic,
  ppmBinaryMagic, pfmColorMagic, pfmGrayscaleMagic, pamMagic, pamTupleTypes,
  netPbmMagics, pbmModes, pbmU8Encodings
} from './const.js'

type PbmAsciiMagic = typeof pbmAsciiMagic
type PgmAsciiMagic = typeof pgmAsciiMagic
type PpmAsciiMagic = typeof ppmAsciiMagic
type PbmBinaryMagic = typeof pbmBinaryMagic
type PgmBinaryMagic = typeof pgmBinaryMagic
type PpmBinaryMagic = typeof ppmBinaryMagic
type PfmColorMagic = typeof pfmColorMagic
type PfmGrayscaleMagic = typeof pfmGrayscaleMagic
type PamMagic = typeof pamMagic

export type NetPbmMagic = typeof netPbmMagics[number]

export type PamTupleType = typeof pamTupleTypes[number]

export type Size = {
  width: number
  height: number
}

type NetPbmHeader = Size & {
  dataOffset: number
}

type NetPbmImage<T> = Size & {
  data: T
}

type Magic<T extends NetPbmMagic> = { magic: T }
type Max = { max: number }

// pbm

export type PbmMode = typeof pbmModes[number]

// if omitted, defaults to 'ink', which is the standard
type PbmImageMode = {
  mode?: PbmMode
}

type PbmImage = NetPbmImage<boolean[]> & PbmImageMode & PbmImageEncoding

export type PbmEncoding = typeof pbmU8Encodings[number]

// defaults to packed rows, which is the standard
type PbmImageEncoding = {
  encoding?: PbmEncoding
}

type PbmU8Image = NetPbmImage<Uint8ClampedArray> & PbmImageMode & PbmImageEncoding

export type PbmHeader = Magic<PbmAsciiMagic | PbmBinaryMagic> & NetPbmHeader

export type PbmAsciiBool = Magic<PbmAsciiMagic> & PbmImage
export type PbmBinaryBool = Magic<PbmBinaryMagic> & PbmImage

export type PbmAsciiU8 = Magic<PbmAsciiMagic> & PbmU8Image
export type PbmBinaryU8 = Magic<PbmBinaryMagic> & PbmU8Image

export type PbmAscii = PbmAsciiBool | PbmAsciiU8
export type PbmBinary = PbmBinaryBool | PbmBinaryU8

export type Pbm = PbmAscii | PbmBinary

// pgm

// for max 0-255
type PgmU8Image = NetPbmImage<Uint8ClampedArray> & Max

// for max 0-65535
type PgmU16Image = NetPbmImage<Uint16Array> & Max

export type PgmHeader = Magic<PgmAsciiMagic | PgmBinaryMagic> & NetPbmHeader & Max

export type PgmAsciiU8 = Magic<PgmAsciiMagic> & PgmU8Image
export type PgmBinaryU8 = Magic<PgmBinaryMagic> & PgmU8Image

export type PgmAsciiU16 = Magic<PgmAsciiMagic> & PgmU16Image
export type PgmBinaryU16 = Magic<PgmBinaryMagic> & PgmU16Image

export type PgmAscii = PgmAsciiU8 | PgmAsciiU16
export type PgmBinary = PgmBinaryU8 | PgmBinaryU16

export type Pgm = PgmAscii | PgmBinary

// ppm

// for max 0-255
type PpmU8Image = NetPbmImage<Uint8ClampedArray[]> & Max

// for max 0-65535
type PpmU16Image = NetPbmImage<Uint16Array[]> & Max

export type PpmHeader = Magic<PpmAsciiMagic | PpmBinaryMagic> & NetPbmHeader & Max

export type PpmAsciiU8 = Magic<PpmAsciiMagic> & PpmU8Image
export type PpmBinaryU8 = Magic<PpmBinaryMagic> & PpmU8Image

export type PpmAsciiU16 = Magic<PpmAsciiMagic> & PpmU16Image
export type PpmBinaryU16 = Magic<PpmBinaryMagic> & PpmU16Image

export type PpmAscii = PpmAsciiU8 | PpmAsciiU16
export type PpmBinary = PpmBinaryU8 | PpmBinaryU16

export type Ppm = PpmAscii | PpmBinary

// pfm

// binary only
type PfmImage = NetPbmImage<Float32Array> & Max

export type PfmHeader = Magic<PfmColorMagic | PfmGrayscaleMagic> & NetPbmHeader & Max

export type PfmColor = Magic<PfmColorMagic> & PfmImage
export type PfmGrayscale = Magic<PfmGrayscaleMagic> & PfmImage

export type Pfm = PfmColor | PfmGrayscale

// pam

type PamImage = Max & {
  depth: number
  tupleType: PamTupleType
}

// for max 0-255
type PamU8Image = NetPbmImage<Uint8ClampedArray[]> & PamImage

// for max 0-65535
type PamU16Image = NetPbmImage<Uint16Array[]> & PamImage

export type PamHeader = Magic<PamMagic> & NetPbmHeader & PamImage

// only binary
export type PamU8 = Magic<PamMagic> & PamU8Image
export type PamU16 = Magic<PamMagic> & PamU16Image

export type Pam = PamU8 | PamU16

//

export type NetPbm = Pbm | Pgm | Ppm | Pfm | Pam

export type Header = PbmHeader | PgmHeader | PpmHeader | PfmHeader | PamHeader

// 

export type AsciiReader = {
  next: (maxLength?: number) => string
  dataOffset: () => number
  seek: (offset: number) => void
  peek: () => string
}

export type ImageDataLike = {
  width: number
  height: number
  data: Uint8ClampedArray
}

export type CreateImageDataLike = (
  width: number, height: number
) => ImageDataLike
