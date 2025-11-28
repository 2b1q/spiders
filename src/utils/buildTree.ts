import { Species, TreeNode, Lifestyle } from '../types'

export function buildTree(species: Species[]): TreeNode {
    const root: TreeNode = {
        name: 'Пауки',
        nodeType: 'root',
        children: []
    }

    const byLifestyle: Record<Lifestyle, Species[]> = {
        arboreal: [],
        terrestrial: [],
        fossorial: []
    }

    species.forEach((s) => {
        byLifestyle[s.lifestyle].push(s)
    })

    const lifestyleLabels: Record<Lifestyle, string> = {
        arboreal: 'Древесные',
        terrestrial: 'Наземные',
        fossorial: 'Норные'
    }

    const lifestyleKeys: Lifestyle[] = ['arboreal', 'terrestrial', 'fossorial']

    lifestyleKeys.forEach((life) => {
        const list = byLifestyle[life]
        if (!list.length) return

        const lifestyleNode: TreeNode = {
            name: lifestyleLabels[life],
            nodeType: 'lifestyle',
            lifestyle: life,
            children: []
        }

        const byGenus: Record<string, Species[]> = {}

        list.forEach((s) => {
            byGenus[s.genus] ??= []
            byGenus[s.genus].push(s)
        })

        Object.entries(byGenus).forEach(([genus, speciesList]) => {
            const genusNode: TreeNode = {
                name: genus,
                nodeType: 'genus',
                lifestyle: life,
                genus,
                children: speciesList.map((s) => ({
                    name: s.name,
                    nodeType: 'species',
                    lifestyle: life,
                    genus,
                    speciesId: s.id,
                    attributes: {
                        speciesId: s.id
                    }
                }))
            }

            lifestyleNode.children!.push(genusNode)
        })

        root.children!.push(lifestyleNode)
    })

    return root
}