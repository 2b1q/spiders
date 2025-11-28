import sharp from 'sharp'

async function main() {
  const WIDTH = 900
  const HEIGHT = 550

  await sharp('public/images/spider.png')
    .resize(WIDTH, HEIGHT, {
      fit: 'contain', // keep the whole spider, do not crop
      background: { r: 5, g: 7, b: 22, alpha: 1 }, // dark bg to match UI
    })
    .webp({ quality: 80 })
    .toFile('public/images/spider-placeholder.webp')

  console.log(`Placeholder saved to public/images/spider-placeholder.webp (${WIDTH}x${HEIGHT})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})