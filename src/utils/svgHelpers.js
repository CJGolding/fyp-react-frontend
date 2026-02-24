import * as d3 from 'd3';
import {NODE_SIZE} from "./constants.js";

/**
 * Helper function to render a single player node in the queue visualisation. It displays the following information:
 * - Player ID
 * - Player skill level
 * - Enqueue time (time-sensitive mode only)
 */
export function renderPlayerNode(parent, x, y, nodeWidth, nodeHeight, fillColor, textColor, playerId, playerSkill, time) {
    // Create the bounding box for the player node
    const nodeGroup = parent.append('g')
        .attr('transform', `translate(${x}, ${y})`);

    nodeGroup.append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', fillColor)
        .attr('stroke', '#000000')
        .attr('stroke-width', 1);

    // Add text elements for player information
    const text = nodeGroup.append('text')
        .attr('x', nodeWidth / 2)
        .attr('y', nodeHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', textColor)
        .attr('font-family', 'Arial')
        .attr('font-size', '9px');

    text.append('tspan')
        .attr('x', nodeWidth / 2)
        .attr('dy', '-0.6em')
        .attr('font-weight', 'bold')
        .text(`P${playerId}`);

    text.append('tspan')
        .attr('x', nodeWidth / 2)
        .attr('dy', '1.2em')
        .text(`s:${playerSkill}`);

    // Optionally add enqueue time for time-sensitive mode
    if (time) {
        text.append('tspan')
            .attr('x', nodeWidth / 2)
            .attr('dy', '1.2em')
            .attr('font-size', '8px')
            .text(time);
    }
}

/**
 * Helper function to render a single game node in the game heap visualisation. It displays the following information:
 * - Anchor player ID
 * - Imbalance or priority metric (depending on the simulation mode)
 * - Team composition tooltip on hover
 */
export function renderGameNode(graph, game, colours, posX, posY) {
    const nodeGroup = graph.append('g')
        .attr('transform', `translate(${posX}, ${posY})`);
    nodeGroup.append('circle')
        .attr('r', NODE_SIZE / 2)
        .attr('fill', colours.fill)
        .attr('stroke', '#000000')
        .attr('stroke-width', 2);

    const text = nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colours.text)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '10px');

    text.append('tspan')
        .attr('x', 0)
        .attr('dy', '-0.5em')
        .attr('font-weight', 'bold')
        .text(`P${game.anchor_player_id}`);

    const metricValue = game.priority !== null ? game.priority : game.imbalance;
    const metricLabel = game.priority !== null ? 'g' : 'f';

    text.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .attr('font-size', '9px')
        .text(`${metricLabel}:${metricValue.toFixed(1)}`);

    const tooltip = nodeGroup.append('g')
        .attr('transform', `translate(${NODE_SIZE / 2 + 8}, ${-NODE_SIZE / 2})`)
        .style('display', 'none');

    const maxLen = game.team_x.length;
    const rowHeight = 12;
    const colWidth = 36;
    const padding = 6;

    const width = colWidth * 2;
    const height = rowHeight * (maxLen + 1) + padding * 2;

    // background
    tooltip.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white')
        .attr('stroke', '#000')
        .attr('rx', 4);

    // column headers
    tooltip.append('text')
        .attr('x', width / 4)
        .attr('y', padding + rowHeight - 3)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Team X');

    tooltip.append('text')
        .attr('x', colWidth + width / 4)
        .attr('y', padding + rowHeight - 3)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Team Y');

    // team rows
    for (let i = 0; i < maxLen; i++) {
        const y = padding + rowHeight * (i + 2) - 3;

        tooltip.append('text')
            .attr('x', width / 4)
            .attr('y', y)
            .attr('font-family', 'Arial, sans-serif')
            .attr('font-size', '9px')
            .attr('text-anchor', 'middle')
            .text(`P${game.team_x[i]}`);

        tooltip.append('text')
            .attr('x', colWidth + width / 4)
            .attr('y', y)
            .attr('font-family', 'Arial, sans-serif')
            .attr('font-size', '9px')
            .attr('text-anchor', 'middle')
            .text(`P${game.team_y[i]}`);
    }

    nodeGroup
        .on('mouseover', function () {
            // bring to front
            d3.select(this).raise();
            tooltip.style('display', null);
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        });
}


/**
 * Helper function to initialise an SVG to be used for visualisation (both player queue and game heap).
 */
export function initialiseSVG(svgRef, width, height, scaledHeight) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
        .attr('width', '100%')
        .attr('height', scaledHeight)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMin meet')
        .style('background', 'transparent')

    return svg;
}

export function configureZoom(svg) {
    const g = svg.append('g');

    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        })
        .on('start', () => {
            svg.style('cursor', 'grabbing');
        })
        .on('end', () => {
            svg.style('cursor', 'grab');
        });

    svg.call(zoom);
    return {zoom, graph: g};
}

/**
 * Helper function to create handlers for zooming in, zooming out, and resetting the zoom level on the game heap visualisation.
 */
export function createZoomHandlers(svgRef, zoomBehaviorRef) {
    const handleZoomIn = () => {
        if (svgRef.current && zoomBehaviorRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomBehaviorRef.current.scaleBy, 1.3);
        }
    };

    const handleZoomOut = () => {
        if (svgRef.current && zoomBehaviorRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomBehaviorRef.current.scaleBy, 0.7);
        }
    };

    const handleZoomReset = () => {
        if (svgRef.current && zoomBehaviorRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
        }
    };

    return {handleZoomIn, handleZoomOut, handleZoomReset};
}