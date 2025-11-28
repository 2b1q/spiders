import React from 'react'
import { Species } from '../types'
import { getSpeciesImageUrl } from '../utils/imageUrl'

interface Props {
    species?: Species | null
    isFavorite: boolean
    onToggleFavorite: () => void
    isInCompare: boolean
    onToggleCompare: () => void
}

const renderExperienceLevel = (level?: Species['experienceLevel']) => {
    if (!level) return 'не указано'

    switch (level) {
        case 'beginner':
            return 'подходит новичкам'
        case 'intermediate':
            return 'для владельцев с базовым опытом'
        case 'advanced':
            return 'для опытных владельцев'
        default:
            return level
    }
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

    const placeholderImg = '/images/spider-placeholder.webp'
    const primaryImage = getSpeciesImageUrl(species)
    const [imgSrc, setImgSrc] = React.useState(primaryImage ?? placeholderImg)

    React.useEffect(() => {
        setImgSrc(primaryImage ?? placeholderImg)
    }, [primaryImage])

    const isPlaceholder = imgSrc === placeholderImg

    return (
        <div className="info-panel">
            <h2>{species.name}</h2>

            <img
                src={imgSrc}
                alt={species.name}
                className={`info-image ${isPlaceholder ? 'info-image--placeholder' : ''}`}
                onError={() => setImgSrc(placeholderImg)}
            />

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
                <strong>Размер адульта:</strong> ~{species.adultSizeCm} см DLS
            </p>
            {species.experienceLevel && (
                <p>
                    <strong>Опыт владельца:</strong> {renderExperienceLevel(species.experienceLevel)}
                </p>
            )}

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