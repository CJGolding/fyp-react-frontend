import {Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import React from "react";

export default function SimulationParameters({params}) {
    const displayParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) =>
            key !== 'sessionId' &&
            key !== 'mode' &&
            key !== 'matchmakingApproach' &&
            value
        )
    );

    const paramCount = Object.entries(displayParams).length;

    const paramLabels = {
        teamSize: 'Team Size (k)',
        pNorm: 'Fairness Norm (p)',
        qNorm: 'Uniformity Norm (q)',
        fairnessWeight: 'Fairness Weight (α)',
        queueWeight: 'Queue Weight (β)',
        skillWindow: 'Window Size (δ)',
    }

    return (
        <Grid size={{xs: 12}}>
            <Paper style={{padding: 16, height: '35vh', display: 'flex', flexDirection: 'column'}}>
                <TableContainer sx={{flex: 1, overflow: 'hidden'}}>
                    <Table sx={{height: '100%'}}>
                        <TableBody sx={{height: '100%', display: 'table', width: '100%', tableLayout: 'fixed'}}>
                            {Object.entries(displayParams).map(([key, value]) => (
                                <TableRow key={key} sx={{height: `${100 / paramCount}%`}}>
                                    <TableCell component="th" scope="row" sx={{width: '70%', fontWeight: 'bold'}}>
                                        {paramLabels[key] || key}
                                    </TableCell>
                                    <TableCell align="right" sx={{width: '30%'}}>
                                        {value !== null && value !== undefined ? value : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
    )
}
