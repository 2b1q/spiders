import sharp from 'sharp'

async function main() {
  const WIDTH = 900
  const HEIGHT = 550

  const SOURCE_FILE = 'public/images/spider.png'
  const TARGET_FILE = 'public/images/spider-placeholder-v1.webp'

  await sharp(SOURCE_FILE)
    .resize(WIDTH, HEIGHT, {
      fit: 'contain', // keep the whole spider, do not crop
      background: { r: 5, g: 7, b: 22, alpha: 1 }, // dark bg to match UI
    })
    .webp({ quality: 80 })
    .toFile(TARGET_FILE)

  console.log(`Placeholder saved to ${TARGET_FILE} (${WIDTH}x${HEIGHT})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})