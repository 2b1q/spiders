import React, { useEffect, useRef, useState } from 'react'
import Tree from 'react-d3-tree'

type Props = {
    data: any
    onSelectSpecies?: (id: string) => void
    highlightedSpeciesId?: string | null
    initialDepth?: number
}

// bypass outdated type definitions
const D3Tree = Tree as any

export const TreeView: React.FC<Props> = ({
    data,
    onSelectSpecies,
    highlightedSpeciesId,
    initialDepth = 1, // by default show only top-level branches
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [showHint, setShowHint] = useState(false)

    useEffect(() => {
        if (!containerRef.current) return

        const el = containerRef.current

        const updateSize = () => {
            const rect = el.getBoundingClientRect()
            setSize({
                width: rect.width,
                height: rect.height,
            })
        }

        updateSize()

        const observer = new ResizeObserver(updateSize)
        observer.observe(el)

        return () => {
            observer.disconnect()
        }
    }, [])

    const isMobile = size.width <= 640

    // enable hint whenever we are on mobile layout
    useEffect(() => {
        if (isMobile) {
            setShowHint(true)
        } else {
            setShowHint(false)
        }
    }, [isMobile])

    // more compact layout on mobile so the whole tree fits into the panel
    const nodeSize = isMobile ? { x: 80, y: 100 } : { x: 320, y: 140 }

    const separation = isMobile
        ? { siblings: 1.0, nonSiblings: 1.1 }
        : { siblings: 0.6, nonSiblings: 0.5 }

    const translate = {
        x: size.width * (isMobile ? 0.25 : 0.08),
        y: size.height * 0.5,
    }

    const getSpeciesId = (nodeDatum: any): string | undefined => {
        if (!nodeDatum) return undefined

        const raw = nodeDatum.data ?? nodeDatum

        if (typeof raw?.speciesId === 'string') return raw.speciesId
        if (typeof raw?.attributes?.speciesId === 'string') return raw.attributes.speciesId
        if (typeof nodeDatum?.attributes?.speciesId === 'string') return nodeDatum.attributes.speciesId
        if (typeof nodeDatum?.data?.attributes?.speciesId === 'string') {
            return nodeDatum.data.attributes.speciesId
        }

        return undefined
    }

    const renderCustomNodeElement = ({
        nodeDatum,
        toggleNode,
    }: {
        nodeDatum: any
        toggleNode: () => void
    }) => {
        const id = getSpeciesId(nodeDatum)
        const isLeafNode =
            !nodeDatum.children ||
            (Array.isArray(nodeDatum.children) && nodeDatum.children.length === 0)
        const isActive = highlightedSpeciesId && id === highlightedSpeciesId

        const className = [
            'tree-node',
            isLeafNode ? 'tree-node--leaf' : 'tree-node--branch',
            isActive ? 'tree-node--active' : '',
        ]
            .filter(Boolean)
            .join(' ')

        // node metadata can live under `data` – use it as a source of truth
        const raw = nodeDatum.data ?? nodeDatum
        const isLifestyleNode = raw?.nodeType === 'lifestyle'
        const isTerrestrialLifestyle = raw?.lifestyle === 'terrestrial'

        // we show hint on mobile for one lifestyle node
        const isHintTarget = showHint && isMobile && isLifestyleNode && isTerrestrialLifestyle

        const handleClick = () => {
            // hide hint after first interaction with the tree on mobile
            if (showHint && isMobile) {
                setShowHint(false)
            }

            // leaf node - call selection handler
            if (isLeafNode && id && onSelectSpecies) {
                onSelectSpecies(id)
                return
            }

            // branch node - toggle expand/collapse
            toggleNode()
        }

        return (
            <g className={className} onClick={handleClick}>
                <circle r={15} />
                <g className="rd3t-label">
                    {isLeafNode ? (
                        // title to the right of the circle
                        <text className="rd3t-label__title" textAnchor="start" x={28} y={4}>
                            {nodeDatum.name}
                        </text>
                    ) : (
                        // title above the circle
                        <text className="rd3t-label__title" textAnchor="middle" x={0} y={-22}>
                            {nodeDatum.name}
                        </text>
                    )}

                    {isHintTarget && (
                        <g className="tree-hint-group" transform="translate(46, 10)">
                            <rect
                                className="tree-hint-bubble"
                                x={-26}
                                y={-26}
                                width={58}
                                height={22}
                                rx={11}
                                ry={11}
                            />
                            <polygon className="tree-hint-arrow" points="-4,-4 6,-4 1,5" />
                            <text className="tree-hint-text" textAnchor="middle" x={3} y={-11}>
                                тык
                            </text>
                        </g>
                    )}
                </g>
            </g>
        )
    }

    return (
        <div ref={containerRef} className="tree-container">
            {size.width > 0 && size.height > 0 && (
                <D3Tree
                    data={data}
                    orientation="horizontal"
                    pathFunc="diagonal"
                    translate={translate}
                    separation={separation}
                    nodeSize={nodeSize}
                    zoomable={true}
                    scaleExtent={{ min: 0.5, max: 1.8 }}
                    collapsible={true}
                    initialDepth={initialDepth}
                    renderCustomNodeElement={renderCustomNodeElement}
                />
            )}
        </div>
    )
}