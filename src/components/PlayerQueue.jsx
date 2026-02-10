import React, {useEffect, useRef} from 'react';
import {Grid, Paper, Typography} from '@mui/material';
import {
    FIXED_NODES_PER_ROW,
    NODE_HEIGHT,
    NODE_SPACING,
    NODE_WIDTH,
    PLAYER_QUEUE_LEGEND,
    ROW_SPACING,
    SimulationColours
} from "../utils/constants.js";
import Legend from "./Legend.jsx";
import {initialiseSVG, renderPlayerNode} from "../utils/svgHelpers.js";


/**
 * Helper function to determine the fill and text colour of a player node based on the current action.
 */
function getPlayerColour(idx, targetIdx, action, teamX, teamY, skillWindow) {
    if (skillWindow.has(idx)) return {fill: SimulationColours.WINDOW, text: SimulationColours.TEXT_DARK};
    if (teamX.has(idx)) return {fill: SimulationColours.TEAM_X, text: SimulationColours.TEXT_LIGHT};
    if (teamY.has(idx)) return {fill: SimulationColours.TEAM_Y, text: SimulationColours.TEXT_DARK};
    if (targetIdx === idx) {
        if (action === 'INSERT') return {fill: SimulationColours.INSERTED, text: SimulationColours.TEXT_DARK};
        if (action === 'REMOVE') return {fill: SimulationColours.REMOVED, text: SimulationColours.TEXT_DARK};
        if (action === 'ANCHOR') return {fill: SimulationColours.ANCHOR, text: SimulationColours.TEXT_LIGHT};
    }
    return {fill: SimulationColours.DEFAULT, text: SimulationColours.TEXT_DARK};
}

/**
 * Component to visualise the player queue at each step of the simulation. This component is responsible for:
 * - Rendering player nodes in a grid layout with fixed nodes per row and appropriate spacing.
 * - Colouring nodes based on their status.
 * - Displaying player information properties.
 * - Providing a legend to explain the colour coding used in the visualisation.
 */
export default function PlayerQueue({queueSnapshot, playerRegistry, isTimeSensitive}) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);


    // Main effect to render the player queue visualisation whenever the queue snapshot or player registry changes
    useEffect(() => {
        // Guard against missing data or empty queue
        if (!playerRegistry || !queueSnapshot || queueSnapshot.order.length === 0) {
            return;
        }

        // Extract player data and action context
        const players = queueSnapshot.order.map(playerId => playerRegistry[playerId]).filter(Boolean);
        const skillWindow = new Set(queueSnapshot.window || []);
        const teamX = new Set(queueSnapshot.team_x || []);
        const teamY = new Set(queueSnapshot.team_y || []);
        const target = queueSnapshot.target_index;
        const action = queueSnapshot.action;

        // Determine layout parameters based on fixed nodes per row and total players
        const nodesPerRow = FIXED_NODES_PER_ROW;
        const numRows = Math.ceil(players.length / nodesPerRow);
        const contentWidth = nodesPerRow * (NODE_WIDTH + NODE_SPACING) - NODE_SPACING + NODE_WIDTH;
        const contentHeight = numRows * (NODE_HEIGHT + ROW_SPACING);
        const containerWidth = containerRef.current?.clientWidth || contentWidth;
        const scale = containerWidth / contentWidth;
        const scaledHeight = contentHeight * scale;

        // Render player nodes with appropriate colours and labels based on layout parameters
        const svg = initialiseSVG(svgRef, contentWidth, contentHeight, scaledHeight)
        players.forEach((player, idx) => {
            const row = Math.floor(idx / nodesPerRow);
            const col = idx % nodesPerRow;
            const x = col * (NODE_WIDTH + NODE_SPACING);
            const y = row * (NODE_HEIGHT + ROW_SPACING);

            const colours = getPlayerColour(idx, target, action, teamX, teamY, skillWindow);

            renderPlayerNode(svg, x, y, NODE_WIDTH, NODE_HEIGHT, colours.fill, colours.text, player.id, player.skill, isTimeSensitive ? `t:${player.enqueue_time}` : null
            );
        });
    }, [queueSnapshot, playerRegistry, isTimeSensitive]);

    const queueLength = queueSnapshot?.order?.length || 0;

    return (
        <Grid item size={{xs: 12}}>
            <Paper style={{padding: 16}}>
                <Grid container sx={{height: '35vh', flexDirection: 'column', width: '100%', overflow: 'hidden'}}>
                    <Grid item sx={{flexShrink: 0}}>
                        <Typography variant="h6" gutterBottom>Player Queue ({queueLength})</Typography>
                    </Grid>
                    <Grid item sx={{flexShrink: 0, mb: 1}}>
                        <Legend items={PLAYER_QUEUE_LEGEND}/>
                    </Grid>
                    <Grid item ref={containerRef} sx={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}>
                        {queueLength === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                                No players in queue
                            </Typography>
                        ) : (
                            <svg ref={svgRef} style={{display: 'block'}}/>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}
