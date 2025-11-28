import React, { useMemo, useState } from 'react'
import { TreeView } from './components/TreeView'
import { InfoPanel } from './components/InfoPanel'
import { ComparePanel } from './components/ComparePanel'
import { Filters, Species } from './types'
import { mockSpecies } from './data/mockSpecies'
import { buildTree } from './utils/buildTree'
import { useFavorites } from './hooks/useFavorites'
import './styles.css'

const applyFiltersAndSearch = (
    data: Species[],
    filters: Filters,
    search: string
): Species[] => {
    let result = [...data]

    if (filters.lifestyle && filters.lifestyle !== 'all') {
        result = result.filter((s) => s.lifestyle === filters.lifestyle)
    }

    if (filters.toxicity && filters.toxicity !== 'all') {
        result = result.filter((s) => s.toxicity === filters.toxicity)
    }

    const trimmedSearch = search.trim().toLowerCase()
    if (trimmedSearch) {
        result = result.filter((s) => {
            const haystack =
                (
                    s.name +
                    ' ' +
                    s.genus +
                    ' ' +
                    s.descriptionShort +
                    ' ' +
                    (s.tags ?? []).join(' ')
                ).toLowerCase()
            return haystack.includes(trimmedSearch)
        })
    }

    return result
}

export const App: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({
        lifestyle: 'all',
        toxicity: 'all',
    })
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // used to force remount of the tree when depth changes
    const [treeKey, setTreeKey] = useState(0)
    const [treeDepth, setTreeDepth] = useState<number>(1)

    const { favorites, compareIds, toggleFavorite, toggleCompare } =
        useFavorites()

    const filteredSpecies = useMemo(
        () => applyFiltersAndSearch(mockSpecies, filters, search),
        [filters, search]
    )

    const treeData = useMemo(
        () => buildTree(filteredSpecies),
        [filteredSpecies]
    )

    const selectedSpecies = useMemo(
        () => filteredSpecies.find((s) => s.id === selectedId) ?? null,
        [filteredSpecies, selectedId]
    )

    const compareSpecies = useMemo(
        () => filteredSpecies.filter((s) => compareIds.includes(s.id)),
        [filteredSpecies, compareIds]
    )

    const favoriteSpecies = useMemo(
        () => mockSpecies.filter((s) => favorites.includes(s.id)),
        [favorites]
    )

    const handleExpandAll = () => {
        setTreeDepth(10)
        setTreeKey((k) => k + 1)
    }

    const handleCollapseAll = () => {
        setTreeDepth(1)
        setTreeKey((k) => k + 1)
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Tarantula Tree</h1>

                <div className="app-toolbar">
                    <select
                        value={filters.lifestyle ?? 'all'}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                lifestyle: e.target.value as Filters['lifestyle'],
                            }))
                        }
                    >
                        <option value="all">Все типы</option>
                        <option value="terrestrial">Наземные</option>
                        <option value="arboreal">Древесные</option>
                        <option value="fossorial">Норные</option>
                    </select>

                    <select
                        value={filters.toxicity ?? 'all'}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                toxicity: e.target.value as Filters['toxicity'],
                            }))
                        }
                    >
                        <option value="all">Любая токсичность</option>
                        <option value="low">Низкая токсичность</option>
                        <option value="medium">Средняя токсичность</option>
                        <option value="high">Высокая токсичность ☣</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Поиск по названию/описанию"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button onClick={handleExpandAll}>Развернуть всё</button>
                    <button onClick={handleCollapseAll}>Свернуть всё</button>
                </div>
            </header>

            <main className="app-main">
                <section className="tree-column">
                    <div className="tree-panel">
                        <TreeView
                            key={treeKey}
                            data={treeData}
                            onSelectSpecies={setSelectedId}
                            highlightedSpeciesId={selectedId}
                            initialDepth={treeDepth}
                        />
                    </div>

                    <ComparePanel species={compareSpecies} />

                    {favoriteSpecies.length > 0 && (
                        <div className="favorites-panel">
                            <h3 className="favorites-title">Избранные виды</h3>
                            <div className="favorites-grid">
                                {favoriteSpecies.map((s) => (
                                    <button
                                        key={s.id}
                                        className={
                                            selectedId === s.id
                                                ? 'favorites-pill favorites-pill--active'
                                                : 'favorites-pill'
                                        }
                                        onClick={() => setSelectedId(s.id)}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <aside className="info-panel">
                    <InfoPanel
                        species={selectedSpecies}
                        isFavorite={selectedId ? favorites.includes(selectedId) : false}
                        onToggleFavorite={() => {
                            if (selectedId) toggleFavorite(selectedId)
                        }}
                        isInCompare={selectedId ? compareIds.includes(selectedId) : false}
                        onToggleCompare={() => {
                            if (selectedId) toggleCompare(selectedId)
                        }}
                    />
                </aside>
            </main>
        </div>
    )
}