import fetch from 'node-fetch'
import sharp from 'sharp'
import { Storage } from '@google-cloud/storage'
import fs from 'node:fs/promises'
import path from 'node:path'
import https from 'node:https'

type ImageItem = {
    id: string
    sourceUrl: string
}

type CliOptions = {
    bucket: string
    jsonPath?: string
    prefix: string
    insecure: boolean
}

const TARGET_WIDTH = 900
const TARGET_HEIGHT = 550

function printUsage(): void {
    console.log(
        [
            'Usage:',
            '  npx tsx src/tools/upload-images.ts --bucket <bucket-name> [--json path/to/species-images.json] [--prefix species] [--insecure]',
            '',
            'Options:',
            '  --bucket    GCS bucket name (required)',
            '  --json      Path to JSON with { id, sourceUrl } list (optional, default: src/tools/species-images.json)',
            '  --prefix    Prefix inside bucket, e.g. "species" (optional, default: "species")',
            '  --insecure  Disable TLS certificate verification (NOT recommended, use only for broken sites)',
            '',
            'Positional compatibility:',
            '  If you still call: npx tsx ... <bucket-name>',
            '  it will be treated as --bucket <bucket-name>.',
        ].join('\n'),
    )
}

function parseArgs(argv: string[]): CliOptions {
    let bucket = ''
    let jsonPath: string | undefined
    let prefix = 'species'
    let insecure = false

    const maybePositionalBucket =
        argv[2] && !argv[2].startsWith('-') ? argv[2] : undefined

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i]

        if (arg === '--bucket' && argv[i + 1]) {
            bucket = argv[++i]
        } else if (arg === '--json' && argv[i + 1]) {
            jsonPath = argv[++i]
        } else if (arg === '--prefix' && argv[i + 1]) {
            prefix = argv[++i]
        } else if (arg === '--insecure') {
            insecure = true
        }
    }

    if (!bucket && maybePositionalBucket) {
        bucket = maybePositionalBucket
    }

    if (!bucket) {
        printUsage()
        process.exit(1)
    }

    return { bucket, jsonPath, prefix, insecure }
}

async function loadImages(jsonPath?: string): Promise<ImageItem[]> {
    const defaultPath = 'src/tools/species-images.json'
    const targetPath = jsonPath ?? defaultPath

    const absPath = path.isAbsolute(targetPath)
        ? targetPath
        : path.join(process.cwd(), targetPath)

    const raw = await fs.readFile(absPath, 'utf8')
    return JSON.parse(raw) as ImageItem[]
}

async function main() {
    const { bucket: bucketName, jsonPath, prefix, insecure } = parseArgs(process.argv)

    console.log('Bucket:', bucketName)
    console.log('JSON file:', jsonPath ?? 'src/tools/species-images.json (default)')
    console.log('Bucket prefix:', prefix)
    console.log('Insecure TLS:', insecure ? 'ON' : 'OFF')

    const skipped = {
        empty: [] as string[],
        failed: [] as string[]
    }
    const storage = new Storage()
    const bucket = storage.bucket(bucketName)
    const items = await loadImages(jsonPath)

    const insecureAgent = new https.Agent({ rejectUnauthorized: false })

    for (const item of items) {
        console.log(`Processing ${item.id}...`)

        if (!item.sourceUrl || !item.sourceUrl.trim()) {
            console.warn(`  Skipping ${item.id}: empty sourceUrl`)
            skipped.empty.push(item.id)
            continue
        }

        try {
            const res = await fetch(item.sourceUrl, {
                agent: insecure ? insecureAgent : undefined,
            })

            if (!res.ok) {
                console.error(`  Failed to download ${item.sourceUrl}:`, res.status, res.statusText)
                skipped.failed.push(item.id)
                continue
            }

            const contentType = res.headers.get('content-type') || ''
            if (!contentType.startsWith('image/')) {
                console.error(`  Skipping ${item.id}: URL did not return an image (content-type="${contentType}")`)
                skipped.failed.push(item.id)
                continue
            }

            const buffer = await res.arrayBuffer()

            const optimized = await sharp(Buffer.from(buffer))
                .rotate()
                .resize(TARGET_WIDTH, TARGET_HEIGHT, {
                    fit: 'cover',
                    position: 'entropy',
                })
                .webp({ quality: 80 })
                .toBuffer()

            const filePath = `${prefix}/${item.id}/main.webp`
            const file = bucket.file(filePath)

            await file.save(optimized, {
                contentType: 'image/webp',
                resumable: false,
            })

            await file.setMetadata({
                cacheControl: 'public, max-age=31536000',
                metadata: {},
            })

            await file.makePublic()

            console.log(`  Uploaded https://storage.googleapis.com/${bucketName}/${filePath}`)
        } catch (err: any) {
            console.error(`  Failed to process ${item.id}:`, err?.message || err)
            continue
        }
    }

    console.dir(skipped, { depth: null, colors: true })
    console.log('Done.')
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})