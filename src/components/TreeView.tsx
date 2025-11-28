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

    // more compact layout on mobile so the whole tree fits into the panel
    const nodeSize = isMobile
        ? { x: 80, y: 100 }        // phones: compress horizontal spacing
        : { x: 320, y: 140 }       // desktop / tablets

    const separation = isMobile
        ? { siblings: 1.0, nonSiblings: 1.1 }
        : { siblings: 0.6, nonSiblings: 0.5 }

    const translate = {
        // on mobile push root a bit to the right so branches fit on screen
        x: size.width * (isMobile ? 0.25 : 0.08),
        y: size.height * 0.5,
    }

    // get speciesId from various possible node structures
    const getSpeciesId = (nodeDatum: any): string | undefined => {
        if (!nodeDatum) return undefined

        const raw = nodeDatum.data ?? nodeDatum

        if (typeof raw?.speciesId === 'string') return raw.speciesId
        if (typeof raw?.attributes?.speciesId === 'string') return raw.attributes.speciesId
        if (typeof nodeDatum?.attributes?.speciesId === 'string') return nodeDatum.attributes.speciesId
        if (typeof nodeDatum?.data?.attributes?.speciesId === 'string') return nodeDatum.data.attributes.speciesId

        return undefined
    }

    // custom rendering of nodes to handle clicks and styling
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

        const handleClick = () => {
            // leaf node - get species ID and call onSelectSpecies
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
                    scaleExtent={{ min: 0.5, max: 1.8 }} // allow pinch-zoom on phones
                    collapsible={true}
                    initialDepth={initialDepth}
                    renderCustomNodeElement={renderCustomNodeElement}
                />
            )}
        </div>
    )
}