export const pbmAsciiMagic = 'P1'
export const pgmAsciiMagic = 'P2'
export const ppmAsciiMagic = 'P3'
export const pbmBinaryMagic = 'P4'
export const pgmBinaryMagic = 'P5'
export const ppmBinaryMagic = 'P6'
export const pfmColorMagic = 'PF'
export const pfmGrayscaleMagic = 'Pf'
export const pamMagic = 'P7'

export const netPbmMagics = [
  pbmAsciiMagic, pgmAsciiMagic, ppmAsciiMagic, pbmBinaryMagic, pgmBinaryMagic,
  ppmBinaryMagic, pfmColorMagic, pfmGrayscaleMagic, pamMagic
] as const

export const pamTupleTypes = [
  'BLACKANDWHITE', 'GRAYSCALE', 'RGB',
  'BLACKANDWHITE_ALPHA', 'GRAYSCALE_ALPHA', 'RGB_ALPHA'
] as const

// strategies

// pbm

// in standard pbm, 0 is white, 1 is black ("ink") - not intuitive!
// all other netpbm formats use higher values for brighter colors
// allow overriding this
export const pbmEncModeInk = 'ink' // 0 is white, 1 is black
export const pbmEncModeWhite = 'white' // 0 is black, 1 is white

export const pbmEncBitPackedRows = 'packedRows' // like pbm binary, rows are padded to nearest byte
export const pbmEncPerPixel = 'perPixel' // 0 or non-zero
export const pbmEncBitPackedFile = 'packedFile' // file is padded to nearest byte
export const pbmEncRgba = 'rgba' // 4 bytes per pixel

export const pbmModes = [pbmEncModeInk, pbmEncModeWhite] as const

export const pbmU8Encodings = [
  pbmEncPerPixel, pbmEncBitPackedRows, pbmEncBitPackedFile, pbmEncRgba
] as const
