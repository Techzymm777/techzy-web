// Step 1 of 2: rasterises the logo SVGs into the PNGs make.py composites.
// Only needed when the logo changes. Needs sharp (npm i --no-save sharp).
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const ROOT = path.resolve(__dirname, '../..')
const out = (f) => path.join(__dirname, f)
const mark = fs.readFileSync(`${ROOT}/public/assets/favicon.svg`, 'utf8').replace(/<style>[\s\S]*?<\/style>/, '')
const word = fs.readFileSync(`${ROOT}/public/assets/techzy-logo.svg`, 'utf8').replace(/<style>[\s\S]*?<\/style>/, '')
const color = (svg, c) => svg.replace(/<svg([^>]*)>/, `<svg$1><style>rect,path,polygon{fill:${c}}</style>`)
;(async () => {
  await sharp(Buffer.from(color(word, '#fff')), { density: 600 }).resize({ width: 1400 }).png().toFile(out('wordmark-white.png'))
  await sharp(Buffer.from(color(word, '#000')), { density: 600 }).resize({ width: 1400 }).png().toFile(out('wordmark-black.png'))
  await sharp(Buffer.from(color(mark, '#fff')), { density: 600 }).resize({ width: 1024 }).png().toFile(out('mark-white.png'))

})()
