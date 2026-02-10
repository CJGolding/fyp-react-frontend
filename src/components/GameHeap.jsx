import React, {useEffect, useRef} from 'react';
import {Grid, Paper, Typography} from '@mui/material';
import Legend from "./Legend.jsx";
import {GAME_HEAP_LEGEND, HORIZONTAL_SPACING, NODE_SIZE, SimulationColours, VERTICAL_SPACING} from "../utils/constants.js";
import {configureZoom, createZoomHandlers, initialiseSVG, renderGameNode} from "../utils/svgHelpers.js";
import ZoomButtonGroup from "./ZoomButtonGroup.jsx";
import calculateTreeLayout from "../utils/generateGameHeap.js";


/**
 * Helper function to determine the fill and text colour of a game node based on the current action.
 */
function getNodeColour(index, targetGame, action) {
    if (targetGame !== null && targetGame === index) {
        if (action === 'REMOVE') return {fill: SimulationColours.REMOVED, text: SimulationColours.TEXT_LIGHT};
        if (action === 'INSERT') return {fill: SimulationColours.INSERTED, text: SimulationColours.TEXT_DARK};
        if (action === 'CREATE') return {fill: SimulationColours.CREATED, text: SimulationColours.TEXT_LIGHT};
    }
    if (index === 0) return {fill: SimulationColours.ANCHOR, text: SimulationColours.TEXT_LIGHT};
    return {fill: SimulationColours.DEFAULT, text: SimulationColours.TEXT_DARK};
}


export default function GameHeap({heapSnapshot, gameRegistry}) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const zoomBehaviorRef = useRef(null);

    useEffect(() => {
        if (!gameRegistry || !heapSnapshot || heapSnapshot.order.length === 0) {
            return;
        }

        const games = heapSnapshot.order.map(anchorPlayerId => gameRegistry[anchorPlayerId]).filter(Boolean);

        const targetGameIndex = heapSnapshot.target_index ?? null;
        const heapAction = heapSnapshot.action || 'IDLE';

        const positions = calculateTreeLayout(games);
        const scaledPositions = positions.map(pos => ({
            ...pos,
            x: pos.x * HORIZONTAL_SPACING,
            y: pos.y * VERTICAL_SPACING
        }));

        const scaledMinX = Math.min(...scaledPositions.map(p => p.x));
        const scaledMaxX = Math.max(...scaledPositions.map(p => p.x));
        const scaledMaxY = Math.max(...scaledPositions.map(p => p.y));
        const treeWidth = scaledMaxX - scaledMinX + NODE_SIZE * 2;
        const treeHeight = scaledMaxY + NODE_SIZE * 2;
        const xOffset = -scaledMinX + NODE_SIZE;
        const yOffset = NODE_SIZE;
        const adjustedPositions = scaledPositions.map(pos => ({
            ...pos,
            x: pos.x + xOffset,
            y: pos.y + yOffset
        }));

        const svg = initialiseSVG(svgRef, treeWidth, treeHeight, '100%');
        const {zoom, graph} = configureZoom(svg);
        zoomBehaviorRef.current = zoom;

        // Create a map for quick lookup of positions by heap index
        const positionMap = new Map();
        adjustedPositions.forEach(pos => {
            positionMap.set(pos.index, pos);
        });

        // Draw edges from children to parents
        adjustedPositions.forEach((pos) => {
            if (pos.index > 0) {
                const parentIndex = Math.floor((pos.index - 1) / 2);
                const parent = positionMap.get(parentIndex);
                if (parent) {
                    graph.append('line')
                        .attr('x1', parent.x)
                        .attr('y1', parent.y)
                        .attr('x2', pos.x)
                        .attr('y2', pos.y)
                        .attr('stroke', '#000000')
                        .attr('stroke-width', 2);
                }
            }
        });

        adjustedPositions.forEach((pos) => {
            const game = games[pos.index];
            const colours = getNodeColour(pos.index, targetGameIndex, heapAction);

            renderGameNode(graph, game, colours, pos.x, pos.y);

        });
    }, [heapSnapshot, gameRegistry]);

    const heapSize = heapSnapshot?.order.length || 0;
    const {handleZoomIn, handleZoomOut, handleZoomReset} = createZoomHandlers(svgRef, zoomBehaviorRef);


    return (
        <Grid item size={{xs: 12}}>
            <Paper style={{padding: 16}}>
                <Grid container sx={{height: '35vh', flexDirection: 'column', width: '100%', overflow: 'hidden'}}>
                    <Grid container sx={{flexShrink: 0, alignItems: 'center', mb: 1}}>
                        <Grid item sx={{flex: 1}}>
                            <Typography variant="h6">
                                Game Heap ({heapSize})
                            </Typography>
                        </Grid>
                        <ZoomButtonGroup
                            handleZoomIn={handleZoomIn}
                            handleZoomOut={handleZoomOut}
                            handleZoomReset={handleZoomReset}
                            disabled={heapSize === 0}
                        />
                    </Grid>
                    <Grid item sx={{flexShrink: 0, mb: 1}}>
                        <Legend items={GAME_HEAP_LEGEND}/>
                    </Grid>
                    <Grid item ref={containerRef} sx={{
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}>
                        {heapSize === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                                No games in heap
                            </Typography>
                        ) : (
                            <svg ref={svgRef}
                                 style={{display: 'block', width: '100%', height: '100%', cursor: 'grab'}}/>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}
