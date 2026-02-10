import React, {useMemo, useState} from "react";
import {Button, CircularProgress, Grid, MenuItem, Paper, TextField} from "@mui/material";
import {createMatch, insertPlayers} from "../utils/api.js";
import ErrorDisplay from "./ErrorDisplay.jsx";

/**
 * Component for inserting players into the matchmaking session, either manually or automatically.
 * Provides form inputs for both modes and handles API interactions for player insertion and match creation.
 */
function InsertionForm({sessionId, hasStopped, isPlaying, isOnFinalStep}) {
    // State management for form inputs, submission status, and error handling
    const [insertionMode, setInsertionMode] = useState("Manual");
    const [skill, setSkill] = useState(1500);
    const [numPlayers, setNumPlayers] = useState(10);
    const [mean, setMean] = useState(1500);
    const [stdDev, setStdDev] = useState(200);
    const [isInserting, setIsInserting] = useState(false);
    const [isCreatingMatch, setIsCreatingMatch] = useState(false);
    const [error, setError] = useState(null);

    // Flag for dynamic form fields
    const isManualInsertion = insertionMode === "Manual";
    const isFormDisabled = hasStopped || !isOnFinalStep || isPlaying || isInserting || isCreatingMatch;

    /**
     * Reset form fields to default values when switching modes to prevent stale error states.
     */
    const handleModeChange = (e) => {
        setInsertionMode(e.target.value);
        setSkill(1500);
        setNumPlayers(10);
        setMean(1500);
        setStdDev(200);
    }

    /**
     * Send player insertion request to backend and handle response to update UI and display any errors, supporting:
     * - Manual mode: inserting a single player with specified skill.
     * - Automatic mode: inserting multiple players with skills generated from a normal distribution defined by mean and std dev.
     */
    const handleInsert = async () => {
        setIsInserting(true);
        setError(null);
        try {
            const data = await insertPlayers(sessionId, isManualInsertion, skill, numPlayers, mean, stdDev);
            console.log('Insertion started:', data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsInserting(false);
        }
    }

    /**
     * Send match creation request to backend and handle response to update UI and display any errors.
     */
    const handleCreateMatch = async () => {
        setIsCreatingMatch(true);
        setError(null);
        try {
            const data = await createMatch(sessionId);
            console.log('Match creation started:', data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreatingMatch(false);
        }
    }

    /**
     * Error handling to prevent form submission with invalid inputs, with real-time feedback on incorrect fields.
     */
    const errors = useMemo(() => {
        const e = {};
        if ((skill < 0 || skill > 5000) && isManualInsertion) e.skill = true;
        if ((numPlayers < 1 || numPlayers > 100) && !isManualInsertion) e.numPlayers = true;
        if ((mean < 0 || mean > 5000) && !isManualInsertion) e.mean = true;
        if ((stdDev < 0 || stdDev > 1000) && !isManualInsertion) e.stdDev = true;
        return e;
    }, [skill, numPlayers, mean, stdDev, isManualInsertion]);
    const formValid = Object.keys(errors).length === 0;

    return (
        <Grid item size={{xs: 12}}>
            <Paper style={{padding: 16, height: '30vh', display: 'flex', flexDirection: 'column'}}>
                <Grid container spacing={3} sx={{flex: 1, alignContent: 'flex-start'}}>

                    <Grid item size={{xs: 12, sm: 6}}>
                        <TextField
                            select
                            label="Insertion Mode"
                            value={insertionMode}
                            onChange={handleModeChange}
                            disabled={isFormDisabled}
                            fullWidth
                        >
                            <MenuItem value="Manual">Manual</MenuItem>
                            <MenuItem value="Automatic">Automatic</MenuItem>
                        </TextField>
                    </Grid>

                    {isManualInsertion ? (
                            <Grid item size={{xs: 12, sm: 6}}>
                                <TextField
                                    label="Player Skill"
                                    type="number"
                                    value={skill}
                                    onChange={(e) => setSkill(Number(e.target.value))}
                                    inputProps={{min: 0, max: 5000, step: 1}}
                                    fullWidth
                                    disabled={isFormDisabled}
                                    error={Boolean(errors.skill)}
                                />
                            </Grid>
                        ) :
                        (<>
                                <Grid item size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="Count"
                                        type="number"
                                        value={numPlayers}
                                        onChange={(e) => setNumPlayers(Number(e.target.value))}
                                        inputProps={{min: 1, max: 100, step: 1}}
                                        fullWidth
                                        disabled={isFormDisabled}
                                        error={Boolean(errors.numPlayers)}
                                    />
                                </Grid>
                                <Grid item size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="Mean"
                                        type="number"
                                        value={mean}
                                        onChange={(e) => setMean(Number(e.target.value))}
                                        inputProps={{min: 0, max: 5000, step: 1}}
                                        fullWidth
                                        disabled={isFormDisabled}
                                        error={Boolean(errors.mean)}
                                    />
                                </Grid>
                                <Grid item size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="Std Dev"
                                        type="number"
                                        value={stdDev}
                                        onChange={(e) => setStdDev(Number(e.target.value))}
                                        inputProps={{min: 0, max: 1000, step: 1}}
                                        fullWidth
                                        disabled={isFormDisabled}
                                        error={Boolean(errors.stdDev)}
                                    />
                                </Grid>
                            </>
                        )}

                </Grid>

                <ErrorDisplay error={error} onClose={() => setError(null)}/>

                <Grid container spacing={6}>
                    <Grid item size={{xs: 12}}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!formValid || isFormDisabled}
                            onClick={handleInsert}
                            startIcon={isInserting ? <CircularProgress size={20}/> : null}
                        >
                            {isInserting
                                ? (isManualInsertion ? "Inserting Player..." : "Inserting Players...")
                                : (isManualInsertion ? "Insert Player" : "Insert Players")
                            }
                        </Button>
                    </Grid>
                    <Grid item size={{xs: 12}}>
                        <Button
                            variant="contained"
                            fullWidth
                            color="success"
                            disabled={isFormDisabled}
                            onClick={handleCreateMatch}
                            startIcon={isCreatingMatch ? <CircularProgress size={20}/> : null}
                        >
                            {isCreatingMatch ? "Creating Match..." : "Create Match"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}

export default InsertionForm;