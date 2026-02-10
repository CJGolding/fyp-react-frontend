import React, {useState} from 'react';
import {
    Box,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material';
import {SimulationColours} from "../utils/constants.js";


/**
 * Helper component to render a single match row in the Created Matches table. This component is responsible for:
 * - Displaying the summary information of a match (anchor player, imbalance, priority).
 * - Providing an expandable section to show detailed information about the players in each team when the row is clicked.
 * - Conditionally rendering the priority column and wait times based on whether the simulation is time-sensitive or not.
 */
function MatchRow({match, matchIndex, isTimeSensitive}) {
    // Toggle to expand / collapse a match details row
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {matchIndex + 1}
                </TableCell>
                <TableCell align="center">P{match.anchor_player_id}</TableCell>
                <TableCell align="center">{match.imbalance}</TableCell>
                {isTimeSensitive && (
                    <TableCell align="center">{match.priority}</TableCell>
                )}
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={isTimeSensitive ? 5 : 4}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 2}}>
                            <Typography variant="h6" gutterBottom component="div">Match Details</Typography>
                            <Table size="small" aria-label="players">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Team</TableCell>
                                        <TableCell>Player ID</TableCell>
                                        <TableCell align="center">Skill</TableCell>
                                        {isTimeSensitive && (
                                            <TableCell align="center">Wait Time</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {match.team_x
                                        .filter(player => player != null)
                                        .map((player) => (
                                            <TableRow key={`x-${player.id}`}>
                                                <TableCell>
                                                    <Chip
                                                        label="Team X"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: SimulationColours.TEAM_X,
                                                            color: SimulationColours.TEXT_LIGHT,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>P{player.id}</TableCell>
                                                <TableCell align="center">{player.skill}</TableCell>
                                                {isTimeSensitive && (
                                                    <TableCell align="center">{player.wait_time}</TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    {match.team_y
                                        .filter(player => player != null)
                                        .map((player) => (
                                            <TableRow key={`y-${player.id}`}>
                                                <TableCell>
                                                    <Chip
                                                        label="Team Y"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: SimulationColours.TEAM_Y,
                                                            color: SimulationColours.TEXT_DARK,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>P{player.id}</TableCell>
                                                <TableCell align="center">{player.skill}</TableCell>
                                                {isTimeSensitive && (
                                                    <TableCell
                                                        align="center">{player.wait_time}</TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

/**
 * Component to display the list of matches created during the simulation. This component is responsible for:
 * - Displaying a summary of all created matches with key information (anchor player, imbalance, priority).
 * - Allowing users to expand each match row to see detailed information about the players in each team.
 * - Handling the case when no matches have been created yet by showing an appropriate message.
 * - Adapting the displayed information based on whether the type of simulation.
 */
export default function CreatedMatches({matches, isTimeSensitive}) {
    const matchesLength = matches?.length || 0;

    return (
        <Grid item size={{xs: 12}}>
            <Paper style={{padding: 16}}>
                <Grid container sx={{height: '35vh', flexDirection: 'column', width: '100%', overflow: 'hidden'}}>
                    <Typography variant="h6" gutterBottom sx={{flexShrink: 0}}>
                        Created Matches ({matchesLength})
                    </Typography>
                    <Grid item sx={{overflow: 'auto', flex: 1, minHeight: 0, width: '100%'}}>
                        {matchesLength === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                                No matches created yet
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table aria-label="created matches table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell/>
                                            <TableCell>Match #</TableCell>
                                            <TableCell align="center">Anchor Player</TableCell>
                                            <TableCell align="center">Imbalance</TableCell>
                                            {isTimeSensitive && (
                                                <TableCell align="center">Priority</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {matches.map((match, index) => (
                                            <MatchRow
                                                key={`match-${index}`}
                                                match={match}
                                                matchIndex={index}
                                                isTimeSensitive={isTimeSensitive}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}
