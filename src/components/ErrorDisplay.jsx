import React from 'react';
import {Alert, Box} from '@mui/material';

/**
 * Simple helper component to display error messages in a consistent manner everywhere.
 */
export default function ErrorDisplay({error, onClose}) {
    if (!error) return null;

    return (
        <Box sx={{mb: 2}}>
            <Alert
                severity="error"
                onClose={onClose}
            >
                {error}
            </Alert>
        </Box>
    );
}
