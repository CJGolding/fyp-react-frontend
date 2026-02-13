import React, {useEffect} from "react";
import {Box, Chip, IconButton, Paper, Slider, Typography} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import ReplayIcon from "@mui/icons-material/Replay";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import {ANIMATION_DELAY_MS} from "../utils/constants.js";

export default function MediaControls({onStop, hasStopped, currentStepIndex, totalSteps, onStepChange, isPlaying, setIsPlaying, stepLabel}) {

    const isAtLastStep = currentStepIndex === totalSteps - 1;

    const clamp = (v) => Math.min(Math.max(v, 0), totalSteps - 1);

    useEffect(() => {
        if (!isPlaying) return;

        const intervalId = setInterval(() => {
            onStepChange((prevIndex) => {
                const nextIndex = prevIndex + 1;
                if (nextIndex >= totalSteps - 1) {
                    setIsPlaying(false);
                    return totalSteps - 1;
                }
                return nextIndex;
            });
        }, ANIMATION_DELAY_MS);

        return () => clearInterval(intervalId);
    }, [isPlaying, totalSteps, onStepChange]);

    return (
        <Paper
            sx={(theme) => ({
                position: "sticky",
                bottom: 0,
                zIndex: theme.zIndex.appBar,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                mt: 3,
            })}
        >
            <Box sx={{px: 2, py: 1}}>
                <Slider
                    value={currentStepIndex}
                    min={0}
                    max={totalSteps - 1}
                    step={1}
                    onChange={(_, v) => onStepChange(v)}
                />

                <Box
                    flexDirection="column"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                >
                    <Typography
                        sx={{ color: stepLabel.colour }}
                    >
                        {stepLabel.message}
                    </Typography>
                    <Chip
                        label={`${currentStepIndex + 1} / ${totalSteps}`}
                        size="small"
                    />
                </Box>


                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1
                    }}
                >
                    <IconButton onClick={() => onStepChange(0)} disabled={hasStopped}>
                        <SkipPreviousIcon/>
                    </IconButton>

                    <IconButton onClick={() => onStepChange(clamp(currentStepIndex - 1))}
                                disabled={isPlaying || hasStopped || currentStepIndex === 0}>
                        <FastRewindIcon/>
                    </IconButton>

                    <IconButton
                        onClick={() => setIsPlaying(p => !p)}
                        disabled={isAtLastStep || hasStopped}
                    >
                        {isPlaying ? <PauseIcon/> : <PlayArrowIcon/>}
                    </IconButton>

                    <IconButton
                        onClick={() => {
                            if (!hasStopped) {
                                setIsPlaying(false);
                                onStepChange(totalSteps - 1);
                            }
                            onStop();
                        }}
                    >
                        {hasStopped ? <ReplayIcon/> : <StopIcon/>}
                    </IconButton>

                    <IconButton onClick={() => onStepChange(clamp(currentStepIndex + 1))}
                                disabled={isPlaying || hasStopped || isAtLastStep}>
                        <FastForwardIcon/>
                    </IconButton>

                    <IconButton onClick={() => onStepChange(totalSteps - 1)} disabled={hasStopped || isAtLastStep}>
                        <SkipNextIcon/>
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
}
