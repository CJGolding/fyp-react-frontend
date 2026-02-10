import {useMemo, useState} from "react";
import {Button, CircularProgress, Grid, MenuItem, Paper, TextField, Typography} from "@mui/material";
import {initialiseSession} from "../utils/api.js";
import ErrorDisplay from "./ErrorDisplay.jsx";


/** Configuration form component that allows users to set parameters and initialise the visualiser. Key features include:
 * - Input validation with real-time feedback.
 * - Dynamic form fields based on selected mode.
 */
function ConfigurationForm({ onInitialised }) {
    // State management for form inputs, submission status and error handling
    const [mode, setMode] = useState("Unrestricted");
    const [teamSize, setTeamSize] = useState(2);
    const [pNorm, setPNorm] = useState(1.0);
    const [qNorm, setQNorm] = useState(1.0);
    const [fairnessWeight, setFairnessWeight] = useState(0.1);
    const [queueWeight, setQueueWeight] = useState(0.1);
    const [matchmakingApproach, setMatchmakingApproach] = useState("Exact");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Flag for dynamic form fields (only show queue weight when in Time-Sensitive mode)
    const isTimeSensitive = mode === 'Time-Sensitive';

    /**
     * Handler for mode change that resets the queue weight to prevent stale error states.
     */
    const handleModeChange = (e) => {
        setMode(e.target.value);
        setQueueWeight(0.1);
    };

    /**
     * Send configuration to backend and handle response to display parameters and start simulation.
     */
    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await initialiseSession(
                {mode, teamSize, pNorm, qNorm, fairnessWeight, queueWeight, matchmakingApproach}
            );
            onInitialised(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Error handling to prevent form submission with invalid inputs, with real-time feedback on incorrect fields.
     */
    const errors = useMemo(() => {
        const e = {};
        if (teamSize < 1 || teamSize > 5) e.teamSize = true;
        if (pNorm < 1 || pNorm > 10) e.pNorm = true;
        if (qNorm < 1 || qNorm > 10) e.qNorm = true;
        if (fairnessWeight < 0.1 || fairnessWeight > 10.0) e.fairnessWeight = true;
        if ((queueWeight < 0.1 || queueWeight > 10.0) && isTimeSensitive) e.queueWeight = true;
        return e;
    }, [teamSize, pNorm, qNorm, fairnessWeight, queueWeight]);
    const formValid = Object.keys(errors).length === 0;

    return (
        <Grid size={{xs: 12, md: 6}}>
            <Paper elevation={3} style={{padding: 24}}>
                <Grid container spacing={3}>
                    <Grid size={{xs: 12}}>
                        <Typography variant="h5" gutterBottom>Configuration</Typography>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TextField
                            select
                            label="Mode"
                            value={mode}
                            onChange={handleModeChange}
                            fullWidth
                            disabled={isLoading}
                        >
                            <MenuItem value="Unrestricted">Unrestricted</MenuItem>
                            <MenuItem value="Time-Sensitive">Time-Sensitive</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label="Team Size (k)"
                            type="number"
                            value={teamSize}
                            onChange={(e) => setTeamSize(Number(e.target.value))}
                            slotProps={{htmlInput: {min: 1, max: 5, step: 1}}}
                            fullWidth
                            error={errors.teamSize}
                            disabled={isLoading}
                        />
                    </Grid>

                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label="Fairness Norm (p)"
                            type="number"
                            value={pNorm}
                            onChange={(e) => setPNorm(Number(e.target.value))}
                            slotProps={{htmlInput: {min: 1, max: 10, step: 1}}}
                            fullWidth
                            error={errors.pNorm}
                            disabled={isLoading}
                        />
                    </Grid>

                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label="Uniformity Norm (q)"
                            type="number"
                            value={qNorm}
                            onChange={(e) => setQNorm(Number(e.target.value))}
                            slotProps={{htmlInput: {min: 1, max: 10, step: 1}}}
                            fullWidth
                            error={errors.qNorm}
                            disabled={isLoading}
                        />
                    </Grid>

                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label="Fairness Weight (α)"
                            type="number"
                            value={fairnessWeight}
                            onChange={(e) => setFairnessWeight(Number(e.target.value))}
                            slotProps={{htmlInput: {min: 0.1, max: 10, step: 0.1}}}
                            fullWidth
                            error={errors.fairnessWeight}
                            disabled={isLoading}
                        />
                    </Grid>

                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            select
                            label="Matchmaking Approach"
                            value={matchmakingApproach}
                            onChange={(e) => setMatchmakingApproach(e.target.value)}
                            fullWidth
                            disabled={isLoading}
                        >
                            <MenuItem value="Exact">Exact</MenuItem>
                            <MenuItem value="Approximate">Approximate</MenuItem>
                        </TextField>
                    </Grid>

                    {isTimeSensitive && (
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                label="Queue Weight (β)"
                                type="number"
                                value={queueWeight}
                                onChange={(e) => setQueueWeight(Number(e.target.value))}
                                slotProps={{htmlInput: {min: 0.1, max: 10, step: 0.1}}}
                                fullWidth
                                error={errors.queueWeight}
                                disabled={isLoading}
                            />
                        </Grid>
                    )}

                    <Grid size={{xs: 12}}>
                        <ErrorDisplay error={error} onClose={() => setError(null)}/>
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!formValid || isLoading}
                            onClick={handleSubmit}
                            startIcon={isLoading ? <CircularProgress size={20}/> : null}
                        >
                            {isLoading ? 'Initialising...' : 'Initialise'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}

export default ConfigurationForm;