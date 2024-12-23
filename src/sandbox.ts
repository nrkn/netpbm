import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { parseHeader } from './header.js'
import { encodePbm, parsePbm } from './pbm.js'
import { toPng } from '@rgba-image/png'

const start = async () => {
  const fixtureNames = await readdir('./data/fixtures')

  for (const fn of fixtureNames) {
    console.log(fn)

    const path = join('./data/fixtures', fn)
    const bytes = await readFile(path)

    const header = parseHeader(bytes)

    console.log(JSON.stringify(header, null, 2))

    // only ones we support for now
    if (header.magic === 'P1' || header.magic === 'P4') {
      const pbm = parsePbm(bytes)

      const outPath = join('./data/out', fn + '-' + header.magic + '.json')

      await writeFile(outPath, JSON.stringify(pbm, null, 2))

      const roundPbm = encodePbm(pbm)

      const roundPbmOutPath = join('./data/out', fn + '-' + header.magic + '-round.pbm')

      await writeFile(roundPbmOutPath, roundPbm)

      const imageDataLike = parsePbm(bytes, 'ink', 'rgba')

      const imageDataLikeOutPath = join('./data/out', fn + '-' + header.magic + '-rgba.json')

      await writeFile(imageDataLikeOutPath, JSON.stringify(imageDataLike, null, 2))

      const idRoundPbm = encodePbm(imageDataLike)

      const idRoundPbmOutPath = join('./data/out', fn + '-' + header.magic + '-round-rgba.pbm')

      await writeFile(idRoundPbmOutPath, idRoundPbm)

      // toPng is structurally typed at runtime, doesn't have to be an instance 
      // of ImageData, however the type definitions use ImageData so we have 
      // to cast
      const png = toPng(imageDataLike as any)

      const pngOutPath = join('./data/out', fn + '-' + header.magic + '.png')

      await writeFile(pngOutPath, png)
    }
  }
}

start().catch(console.error)
