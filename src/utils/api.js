import {useEffect, useRef, useState} from 'react';
import {BACKEND_URL_PREFIX} from "./constants.js";

/**
 * Helper function to send a POST request to the backend API, abstracting common complex logic, including:
 * - Constructing the full URL using a predefined prefix and endpoint.
 * - Setting appropriate headers for JSON content.
 * - Handling the response by checking for HTTP errors and parsing the JSON body.
 */
async function postRequest(endpoint, data) {
    try {
        const response = await fetch(`http://${BACKEND_URL_PREFIX}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail);
        }
        return result;
    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please check that the backend is running.');
        }
        throw error;
    }
}

/**
 * Wrapper function to send a request to initialise a matchmaking session with the backend.
 */
export async function initialiseSession(requestData) {
    return await postRequest('init', requestData);
}

/**
 * Wrapper function to send a request to insert players into the matchmaking session, dynamically handling the following modes:
 * - Manual mode: inserting a single player with specified skill.
 * - Automatic mode: inserting multiple players with skills generated from a normal distribution defined by mean and std dev.
 */
export async function insertPlayers(sessionId, isManualInsertion, manualSkill, numPlayers, mean, stdDev) {
    const requestData = isManualInsertion ?
        {sessionId, mode: "Manual", skill: manualSkill} :
        {sessionId, mode: "Automatic", numPlayers, mean, stdDev};

    return await postRequest('insert', requestData)
}

/**
 * Wrapper function to send a request to create a match, which returns a status response.
 */
export async function createMatch(sessionId) {
    return await postRequest('create', {sessionId});
}

/**
 * Wrapper function to send a request to stop the matchmaking session, which returns statistics from the backend for display.
 */
export async function stopSession(sessionId) {
    return await postRequest('stop', {sessionId});
}

/**
 * Custom React hook to manage a WebSocket connection for receiving real-time updates from the backend.
 * It is required as the backend can take a long time to process and send steps, so it must be done asynchronously.
 * The hook handles the following complex logic:
 * - Establishing a connection when a session is active and the user is connected.
 * - Handling incoming messages to update the steps state or set error messages.
 * - Cleaning up the connection when the session ends or the user disconnects.
 */
export function WebSocketConnection(sessionId, isConnected) {
    // State management for steps received from the backend and any WebSocket errors
    const [steps, setSteps] = useState([]);
    const [wsError, setWsError] = useState(null);
    const wsRef = useRef(null);
    const hasDisconnectedRef = useRef(false);

    // Reset steps and error state when sessionId changes, and track disconnection status to prevent stale connections
    useEffect(() => {
        setSteps([]);
        setWsError(null);
        hasDisconnectedRef.current = false;
    }, [sessionId]);

    // Establish and manage WebSocket connection based on session and connection status, with error handling and cleanup logic
    useEffect(() => {
        // Clean up any existing but invalid connections
        if (!sessionId || !isConnected || hasDisconnectedRef.current) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (!isConnected) {
                hasDisconnectedRef.current = true;
            }
            return;
        }

        const ws = new WebSocket(`ws://${BACKEND_URL_PREFIX}/ws/${sessionId}`);
        wsRef.current = ws;

        // Reset error state on successful connection
        ws.onopen = () => {
            setWsError(null);
        };

        // Handle incoming messages, updating steps or setting error messages based on the content of the message
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.error) {
                    setWsError(data.error);
                    return;
                }

                if (data.steps && Array.isArray(data.steps)) {
                    setSteps(prevSteps => [...prevSteps, ...data.steps]);
                }
            } catch (err) {
                setWsError('Failed to process server message');
            }
        };

        // Handle WebSocket errors by setting an appropriate error message for display to the user
        ws.onerror = () => {
            setWsError('WebSocket connection error');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            wsRef.current = null;
        };
    }, [sessionId, isConnected]);


    return { steps, wsError };
}


