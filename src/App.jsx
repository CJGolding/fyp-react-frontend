import React, {useState} from "react";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import SimulationPanel from "./panels/SimulationPanel.jsx";
import StatisticsPanel from "./panels/StatisticsPanel.jsx";
import ConfigurationPanel from "./panels/ConfigurationPanel.jsx";
import ErrorDisplay from "./components/ErrorDisplay.jsx";
import {DisplayTabs, MatchmakingMode} from "./utils/constants.js";
import {stopSession, WebSocketConnection} from "./utils/api.js";

/**
 * Main application component that manages the overall state and layout of the matchmaking visualiser. Key responsibilities include:
 * - Managing global state such as session information, simulation parameters, and error handling.
 * - Handling the initialisation and stopping of matchmaking sessions.
 * - Coordinating the display of different panels (Configuration, Simulation, Statistics) based on user interaction and session state.
 * - Establishing a WebSocket connection to receive real-time updates from the backend during the simulation phase.
 */
function App() {
    // Global state management for the application
    const [isInitialised, setIsInitialised] = useState(false);
    const [hasStopped, setHasStopped] = useState(false);
    const [params, setParams] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [mode, setMode] = useState(null);
    const [isTimeSensitive, setIsTimeSensitive] = useState(false);
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState(DisplayTabs.CONFIG);

    // WebSocketConnection hook to manage real-time updates from the backend during the simulation phase
    const {steps, wsError} = WebSocketConnection(sessionId, !hasStopped);

    // If the WebSocket connection encounters an error, update the global error state to display it to the user
    React.useEffect(() => {
        if (wsError) {
            setError(wsError);
        }
    }, [wsError]);

    // Client-side handler to update application state after the backend confirms system initialisation.
    const handleInitialised = (data) => {
        setCurrentStepIndex(0);
        setIsPlaying(true);
        setSessionId(data.sessionId);
        setMode(data.mode);
        setIsTimeSensitive(data.mode === MatchmakingMode.TIME_SENSITIVE);
        const {sessionId: _, mode: __, ...displayParams} = data;
        setParams(displayParams);
        setIsInitialised(true);
        setTab(DisplayTabs.SIMULATION);
    };

    /**
     * Client-side handler to manage the stopping of a matchmaking session. This function performs either one of the following:
     * - Stopping the simulator and receiving statistics from the backend.
     * - Resetting the application state after stopping to allow for a new session to be initialised.
     */
    const handleStop = async () => {
        if (!hasStopped) {
            setIsLoadingStats(true);
            setHasStopped(true);
            try {
                const statsData = await stopSession(sessionId);

                setStats({
                    queue_size: statsData.queueSize,
                    heap_size: statsData.heapSize,
                    max_wait_time: statsData.maxWaitTime,
                    min_priority: statsData.minPriority,
                    min_imbalance: statsData.minImbalance
                });

                setTab(DisplayTabs.STATS);
            } catch (err) {
                setError(err.message);
                setStats(null);
                setTab(DisplayTabs.STATS);
            } finally {
                setIsLoadingStats(false);
            }
        } else {
            setHasStopped(false);
            setIsInitialised(false);
            setStats(null);
            setSessionId(null);
            setCurrentStepIndex(0);
            setIsPlaying(false);
            setError(null);
            setTab(DisplayTabs.CONFIG);
        }
    }

    return (
        <Box sx={{width: '100%'}}>
            <Box
                sx={(theme) => ({
                    position: 'sticky',
                    top: 0,
                    zIndex: theme.zIndex.appBar,
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                })}>
                <Typography variant="h6" sx={{pl: 3, fontWeight: 'bold'}}>
                    Matchmaking Visualiser {isInitialised && `- ${mode} Mode`}
                </Typography>
                <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} aria-label="application tabs">
                    <Tab value={DisplayTabs.CONFIG} disabled={isInitialised} label="Configuration"/>
                    <Tab value={DisplayTabs.SIMULATION} disabled={!isInitialised} label="Simulation"/>
                    <Tab value={DisplayTabs.STATS} disabled={!hasStopped} label="Statistics"/>
                </Tabs>
            </Box>

            <Box sx={{p: 3}}>
                <ErrorDisplay error={error} onClose={() => setError(null)}/>
                {tab === DisplayTabs.CONFIG && (
                    <ConfigurationPanel onInitialised={handleInitialised}/>
                )}
                {tab === DisplayTabs.SIMULATION && (
                    <SimulationPanel
                        params={params}
                        sessionId={sessionId}
                        onStop={handleStop}
                        hasStopped={hasStopped}
                        isTimeSensitive={isTimeSensitive}
                        allSteps={steps}
                        currentStepIndex={currentStepIndex}
                        setCurrentStepIndex={setCurrentStepIndex}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                    />
                )}
                {tab === DisplayTabs.STATS && (
                    <StatisticsPanel isTimeSensitive={isTimeSensitive} stats={stats} isLoading={isLoadingStats}/>
                )}
            </Box>

        </Box>
    );
}

export default App;