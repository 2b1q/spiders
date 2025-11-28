export type Lifestyle = 'arboreal' | 'terrestrial' | 'fossorial'

export type ToxicityLevel = 'low' | 'medium' | 'high'

export type Speed = 'slow' | 'medium' | 'fast' | 'very_fast'

export type NodeType = 'root' | 'lifestyle' | 'genus' | 'species'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Species {
    id: string
    name: string                 // Poecilotheria metallica
    genus: string                // Poecilotheria
    lifestyle: Lifestyle
    region: string
    temperament: string
    speed: Speed
    toxicity: ToxicityLevel
    adultSizeCm: number          // DLS (cm)
    descriptionShort: string
    descriptionFull: string
    imageUrl?: string            // (Storage / CDN)
    tags?: string[]              // search tags
    experienceLevel: ExperienceLevel
}

export interface TreeNode {
    name: string
    nodeType: NodeType
    lifestyle?: Lifestyle
    genus?: string
    speciesId?: string
    children?: TreeNode[]
}

export interface Filters {
    lifestyle?: Lifestyle | 'all'
    toxicity?: ToxicityLevel | 'all'
    region?: string | 'all'
}