# Tarantula Tree

Interactive visual guide to popular tarantula species.

The app shows a tree of `lifestyles` → `genera` → `species` and a detail panel with region, temperament, toxicity, size and short/long descriptions.

## Stack

- React + TypeScript + Vite
- `react-d3-tree` for the tree visualization
- Firebase Hosting
- Google Cloud Storage (`@google-cloud/storage`)
- Image processing with `sharp`
- Utility scripts via `tsx`

## Prerequisites

- Node.js 18+
- `npm`
- `gcloud` CLI
- `firebase-tools` (installed globally)

Prepare:
```sh
npm install -g firebase-tools
gcloud auth application-default login
```
You also need a GCS bucket (for example: <bucket>.firebasestorage.app) and access to the Firebase project.

## Installation

```sh
git clone <repo-url>
cd spiders
npm install
```

## Development
```sh
npm run dev
```
Vite will start the dev server (usually on http://localhost:5173)

## Build

```sh
npm run build
```
Optionally:
```sh
npm run preview
```

## Deploy to Firebase Hosting

```sh
npm run build && firebase deploy --only hosting
```
This assumes Firebase Hosting is already configured for the project.

## Species images

Species images are stored in a GCS bucket and generated from external URLs listed in `src/tools/species-images.json`

The JSON file looks like:
```json
[
  {
    "id": "psalmopoeus-pulcher",
    "sourceUrl": "https://example.com/image1.png"
  },
  {
    "id": "poecilotheria-metallica",
    "sourceUrl": "https://example.com/image2.jpg"
  }
]
```

Upload / optimize all species images
```
This script:
	1.	Reads src/tools/species-images.json
	2.	Downloads each sourceUrl
	3.	Resizes and converts to WebP (900×550, fit: cover)
	4.	Uploads to the bucket as species/<id>/main.webp
	5.	Makes each file public with long cache headers
```
Run:

```sh
npx tsx src/tools/upload-images.ts \
  --bucket <bucket>.firebasestorage.app \
  --prefix species \
  --insecure
```
Flags:
```
--bucket – GCS bucket name
--prefix – prefix inside the bucket (default: species)
--json – optional custom JSON file path
--insecure – disable TLS verification (only for broken HTTPS sources)
```
If a particular image cannot be processed, the script logs an error and skips to the next item.

## Placeholder image

The info panel uses a local placeholder when a species image is missing.

`src/tools/optimize-placeholder.ts`:
- Reads `public/images/spider.png`
- Resizes to 900×550 with fit: contain
- Adds a dark background
- Writes `public/images/spider-placeholder.webp`

Run:
```sh
npx tsx src/tools/optimize-placeholder.ts
```
The app then loads it as: `/images/spider-placeholder.webp`


