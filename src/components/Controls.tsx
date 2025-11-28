import React from 'react'
import { Filters, Lifestyle, ToxicityLevel } from '../types'

interface Props {
    filters: Filters
    onChangeFilters: (next: Filters) => void
    search: string
    onSearchChange: (value: string) => void
    onExpandAll: () => void
    onCollapseAll: () => void
}

const lifestyleOptions: { value: Lifestyle | 'all'; label: string }[] = [
    { value: 'all', label: 'Все типы' },
    { value: 'arboreal', label: 'Древесные' },
    { value: 'terrestrial', label: 'Наземные' },
    { value: 'fossorial', label: 'Норные' }
]

const toxicityOptions: { value: ToxicityLevel | 'all'; label: string }[] = [
    { value: 'all', label: 'Любая токсичность' },
    { value: 'low', label: 'Низкая токсичность' },
    { value: 'medium', label: '⚠ Средняя токсичность' },
    { value: 'high', label: '☣ Высокая токсичность' }
]

export const Controls: React.FC<Props> = ({
    filters,
    onChangeFilters,
    search,
    onSearchChange,
    onExpandAll,
    onCollapseAll
}) => {
    return (
        <div className="controls">
            <div className="controls-row">
                <select
                    value={filters.lifestyle ?? 'all'}
                    onChange={(e) =>
                        onChangeFilters({ ...filters, lifestyle: e.target.value as any })
                    }
                >
                    {lifestyleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.toxicity ?? 'all'}
                    onChange={(e) =>
                        onChangeFilters({ ...filters, toxicity: e.target.value as any })
                    }
                >
                    {toxicityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Поиск по названию/описанию..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />

                <button onClick={onExpandAll}>Развернуть всё</button>
                <button onClick={onCollapseAll}>Свернуть всё</button>
            </div>
        </div>
    )
}