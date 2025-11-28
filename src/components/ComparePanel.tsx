import React from 'react'
import { Species } from '../types'

type Props = {
    species: Species[]
}

export const ComparePanel: React.FC<Props> = ({ species }) => {
    if (!species.length) {
        return null
    }

    return (
        <div className="compare-panel">
            <h3 className="compare-title">Сравнение видов</h3>

            <div className="compare-grid">
                {species.map((s) => (
                    <div key={s.id} className="compare-card">
                        <div className="compare-name">{s.name}</div>
                        <div className="compare-row">
                            <span className="compare-label">Род:</span>
                            <span className="compare-value">{s.genus}</span>
                        </div>
                        <div className="compare-row">
                            <span className="compare-label">Lifestyle:</span>
                            <span className="compare-value">{s.lifestyle}</span>
                        </div>
                        <div className="compare-row">
                            <span className="compare-label">Toxicity:</span>
                            <span className="compare-value">{s.toxicity}</span>
                        </div>
                        <div className="compare-row">
                            <span className="compare-label">Size (cm):</span>
                            <span className="compare-value">{s.adultSizeCm}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}