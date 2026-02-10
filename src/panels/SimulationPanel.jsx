import {Grid} from "@mui/material";
import Parameters from "../components/Parameters.jsx";
import InsertionForm from "../components/InsertionForm.jsx";
import React, {useEffect, useMemo} from "react";
import PlayerQueue from "../components/PlayerQueue.jsx";
import MediaControls from "../components/MediaControls.jsx";
import GameHeap from "../components/GameHeap.jsx";
import CreatedMatches from "../components/CreatedMatches.jsx";

/**
 * Main panel for visualizing the matchmaking simulation, including:
 * - InsertionForm for adding players and creating matches.
 * - Parameters display to show current simulation parameters.
 * - PlayerQueue to visualize the state of the player queue at each step.
 * - GameHeap to visualize the state of the game heap at each step.
 * - CreatedMatches to show the matches that have been created so far.
 * - MediaControls for navigating through the simulation steps and controlling playback.
 */
function SimulationPanel(props) {
    const {
        params,
        sessionId,
        onStop,
        hasStopped,
        isTimeSensitive,
        allSteps,
        currentStepIndex,
        setCurrentStepIndex,
        isPlaying,
        setIsPlaying
    } = props;
    const previousStepCountRef = React.useRef(0);
    const totalSteps = allSteps?.length || 0;
    const isOnFinalStep = totalSteps === 0 || currentStepIndex === totalSteps - 1;

    // Resume autoplay when new steps arrive without index reset
    useEffect(() => {
        if (allSteps.length > previousStepCountRef.current && allSteps.length > 0) {
            setIsPlaying(true);
            previousStepCountRef.current = allSteps.length;
        } else if (allSteps.length > 0 && previousStepCountRef.current === 0) {
            previousStepCountRef.current = allSteps.length;
        }
    }, [allSteps.length, setIsPlaying]);

    // Dynamically construct snapshots and registries for efficient access during rendering
    const stepSnapshots = useMemo(() => {
        const snapshots = [];
        const players = {};
        const games = {};
        const matches = [];

        allSteps.forEach((step, _) => {
            // Add new players to registry and keep them after removal for match creation
            if (step.queue_snapshot && step.queue_snapshot.add) {
                const player = step.queue_snapshot.add;
                if (player && typeof player.id !== 'undefined') {
                    players[player.id] = player;
                }
            }

            // Add new games to registry and keep them after removal for match creation
            if (step.heap_snapshot && step.heap_snapshot.add) {
                const game = step.heap_snapshot.add;
                if (game && typeof game.anchor_player_id !== 'undefined') {
                    games[game.anchor_player_id] = game;
                }
            }

            if (step.heap_snapshot.action === "CREATE") {
                // Target index should be 0, but dynamically check just in case
                const target_index = step.heap_snapshot.target_index;
                if (target_index !== null && target_index >= 0 && step.heap_snapshot.order.length > target_index) {
                    const anchor_player_id = step.heap_snapshot.order[target_index];
                    const createdMatch = games[anchor_player_id];

                    if (createdMatch) {
                        const team_x = createdMatch.team_x
                            .map(id => players[id])

                        const team_y = createdMatch.team_y
                            .map(id => players[id])

                        matches.push({
                            anchor_player_id: anchor_player_id,
                            team_x: team_x,
                            team_y: team_y,
                            imbalance: createdMatch.imbalance,
                            priority: createdMatch.priority,
                        });

                    }
                }
            }

            snapshots.push({
                step: step,
                playerRegistry: {...players},
                gameRegistry: {...games},
                createdMatches: [...matches]
            });
        });

        return snapshots;
    }, [allSteps]);

    // Default snapshot structure in case no steps are available yet (initialisation)
    const currentSnapshot = stepSnapshots[currentStepIndex] || {
        step: {
            queue_snapshot: {
                order: [],
                add: null,
                window: null,
                target_index: null,
                team_x: null,
                team_y: null,
                action: "IDLE"
            },
            heap_snapshot: {
                order: [],
                add: null,
                target_index: null,
                action: "IDLE"
            }
        },
        playerRegistry: {},
        gameRegistry: {},
        createdMatches: []
    };

    // Step change handler that either accepts a direct index or callback function for step forward/backward
    const handleStepChange = (stepIndexOrCallback) => {
        if (typeof stepIndexOrCallback === 'function') {
            setCurrentStepIndex(stepIndexOrCallback);
        } else {
            setCurrentStepIndex(stepIndexOrCallback);
        }
    }

    return (
        <>
            <Grid container spacing={3} direction="row">
                <Grid container spacing={3} direction="column" size={{xs: 12, md: 4}}>
                    <InsertionForm
                        sessionId={sessionId}
                        hasStopped={hasStopped}
                        isPlaying={isPlaying}
                        isOnFinalStep={isOnFinalStep}
                    />
                    <Parameters params={params}/>

                </Grid>
                <Grid container spacing={3} direction="column" size={{xs: 12, md: 8}}>
                    <PlayerQueue
                        queueSnapshot={currentSnapshot.step.queue_snapshot}
                        playerRegistry={currentSnapshot.playerRegistry}
                        isTimeSensitive={isTimeSensitive}
                    />
                    <GameHeap
                        isOnFinalStep={isOnFinalStep}
                        heapSnapshot={currentSnapshot.step.heap_snapshot}
                        gameRegistry={currentSnapshot.gameRegistry}
                    />
                </Grid>
                <CreatedMatches matches={currentSnapshot.createdMatches} isTimeSensitive={isTimeSensitive}/>

            </Grid>
            <MediaControls
                onStop={onStop}
                hasStopped={hasStopped}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                onStepChange={handleStepChange}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
            />
        </>
    )
}

export default SimulationPanel;