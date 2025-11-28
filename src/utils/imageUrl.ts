import type { Species } from '../types'

const IMAGE_BASE = 'https://storage.googleapis.com/spiders-2b1q.firebasestorage.app/species'

/**
 * Returns final image URL for a species.
 * - If species.imageUrl is set, it will be used.
 * - Otherwise builds URL as:
 *   `${IMAGE_BASE}/${species.id}/main.webp`
 */
export function getSpeciesImageUrl(species: Species): string {
    if (species.imageUrl && species.imageUrl.trim().length) return species.imageUrl

    return `${IMAGE_BASE}/${species.id}/main.webp`
}