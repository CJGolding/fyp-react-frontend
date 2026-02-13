import {Box, CircularProgress, Grid, Typography} from "@mui/material";
import LineChart from "../components/LineChart.jsx";
import {STATISTIC_COLOURS} from "../utils/constants.js";


/**
 * Component responsible for rendering the statistics panel of charts that visualise key simulation metrics over time.
 */
export default function StatisticsPanel({isTimeSensitive, stats, isLoading}) {
    // Helper function to assign unique colours to each dataset in the charts based on the index
    const getLineColour = (index) => {
        return STATISTIC_COLOURS[index % STATISTIC_COLOURS.length];
    };

    // Indicate to the user that statistics are still loading
    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                gap: 2
            }}
            >
                <CircularProgress size={60}/>
                <Typography variant="h6" color="text.secondary">Loading statistics...</Typography>
            </Box>
        );
    }

    // Handle when no statistics are available (shouldn't occur under normal circumstances)
    if (!stats) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
                <Typography variant="h6" color="text.secondary">No statistics available</Typography>
            </Box>
        );
    }

    // Default rendering case
    return (
        <Grid container spacing={3}>
            <Grid size={{xs: 12, md: 6}}>
                <LineChart
                    title="Queue & Heap Size Over Time"
                    datasets={[
                        {label: 'Queue Size', data: stats.queue_size, borderColour: getLineColour(0)},
                        {label: 'Heap Size', data: stats.heap_size, borderColour: getLineColour(1)}
                    ]}
                    yAxisLabel="Size"
                />
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
                <LineChart
                    title={isTimeSensitive ? "Min Imbalance & Min Priority Over Time" : "Min Imbalance Over Time"}
                    datasets={isTimeSensitive ? [
                        {label: 'Min Imbalance', data: stats.min_imbalance, borderColour: getLineColour(2)},
                        {label: 'Min Priority', data: stats.min_priority, borderColour: getLineColour(3)}
                    ] : [
                        {label: 'Min Imbalance', data: stats.min_imbalance, borderColour: getLineColour(2)}
                    ]
                    }
                    yAxisLabel="Value"
                />
            </Grid>

            {isTimeSensitive && (
                <Grid size={{xs: 12, md: 6}}>
                    <LineChart
                        title="Max Waiting Time Over Time"
                        datasets={[
                            {label: 'Max Wait Time', data: stats.max_wait_time, borderColour: getLineColour(4)}
                        ]}
                        yAxisLabel="Wait Time"
                    />
                </Grid>
            )}
        </Grid>
    );
}
