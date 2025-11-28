import { useEffect, useState } from 'react'

const FAVORITES_KEY = 'tarantula_favorites'
const COMPARE_KEY = 'tarantula_compare'

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([])
    const [compareIds, setCompareIds] = useState<string[]>([])

    useEffect(() => {
        const favRaw = localStorage.getItem(FAVORITES_KEY)
        const cmpRaw = localStorage.getItem(COMPARE_KEY)

        if (favRaw) {
            try {
                setFavorites(JSON.parse(favRaw))
            } catch {
                setFavorites([])
            }
        }

        if (cmpRaw) {
            try {
                setCompareIds(JSON.parse(cmpRaw))
            } catch {
                setCompareIds([])
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds))
    }, [compareIds])

    const toggleFavorite = (id: string) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const toggleCompare = (id: string) => {
        setCompareIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id)
            if (prev.length >= 5) return [prev[1], id] // keep max 5 items
            return [...prev, id]
        })
    }

    return { favorites, compareIds, toggleFavorite, toggleCompare }
}