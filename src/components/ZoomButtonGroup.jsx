import {Button, ButtonGroup, Grid} from "@mui/material";
import {Add as ZoomInIcon, Remove as ZoomOutIcon, RestartAlt as ResetIcon} from "@mui/icons-material";


/**
 * Helper component to render a group of buttons for controlling the zoom level of the Game Heap visualisation.
 */
export default function ZoomButtonGroup({handleZoomIn, handleZoomOut, handleZoomReset, disabled}) {
    return (
        <Grid item>
            <ButtonGroup size="small" variant="outlined">
                <Button onClick={handleZoomOut} disabled={disabled}>
                    <ZoomOutIcon fontSize="small"/>
                </Button>
                <Button onClick={handleZoomReset} disabled={disabled}>
                    <ResetIcon fontSize="small"/>
                </Button>
                <Button onClick={handleZoomIn} disabled={disabled}>
                    <ZoomInIcon fontSize="small"/>
                </Button>
            </ButtonGroup>
        </Grid>
    )
}