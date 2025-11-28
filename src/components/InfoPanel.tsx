import React from 'react'
import { Species } from '../types'

interface Props {
    species?: Species | null
    isFavorite: boolean
    onToggleFavorite: () => void
    isInCompare: boolean
    onToggleCompare: () => void
}

export const InfoPanel: React.FC<Props> = ({
    species,
    isFavorite,
    onToggleFavorite,
    isInCompare,
    onToggleCompare,
}) => {
    if (!species) {
        return (
            <div className="info-panel">
                <h2>Выберите вид в дереве</h2>
                <p>Наведи или кликни по пауку, чтобы увидеть подробности.</p>
            </div>
        )
    }

    const experienceText =
        species.experienceLevel === 'beginner'
            ? 'подходит для новичков'
            : species.experienceLevel === 'intermediate'
                ? 'для владельцев с базовым опытом'
                : species.experienceLevel === 'advanced'
                    ? 'только для опытных держателей'
                    : '—'

    return (
        <div className="info-panel">
            <h2>{species.name}</h2>
            {species.imageUrl && (
                <img src={species.imageUrl} alt={species.name} className="info-image" />
            )}
            <p>
                <strong>Род:</strong> {species.genus}
            </p>
            <p>
                <strong>Регион:</strong> {species.region}
            </p>
            <p>
                <strong>Тип обитания:</strong> {species.lifestyle}
            </p>
            <p>
                <strong>Характер:</strong> {species.temperament}
            </p>
            <p>
                <strong>Скорость:</strong> {species.speed}
            </p>
            <p>
                <strong>Токсичность:</strong>{' '}
                {species.toxicity === 'low'
                    ? 'низкая токсичность'
                    : species.toxicity === 'medium'
                        ? '⚠ средняя токсичность'
                        : '☣ высокая токсичность'}
            </p>
            <p>
                <strong>Уровень опыта владельца:</strong> {experienceText}
            </p>
            <p>
                <strong>Размер адульта:</strong> ~{species.adultSizeCm} см DLS
            </p>

            <p className="info-short">{species.descriptionShort}</p>

            <details>
                <summary>Подробнее</summary>
                <p>{species.descriptionFull}</p>
            </details>

            <div className="info-actions">
                <button onClick={onToggleFavorite}>
                    {isFavorite ? 'Убрать из избранного' : 'В избранное'}
                </button>
                <button onClick={onToggleCompare}>
                    {isInCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'}
                </button>
            </div>
        </div>
    )
}