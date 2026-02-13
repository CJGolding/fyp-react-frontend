import {Chip, Stack} from "@mui/material";
import React from "react";

/**
 * Simple helper component to display a legend for either the player queue or game heap.
 */
export default function Legend({items}) {
    return (
        <Stack direction="row" spacing={1} sx={{mb: 2, flexWrap: 'wrap', gap: 1}}>
            {items.map((item) => (
                <Chip
                    key={item.label}
                    label={item.label}
                    size="small"
                    sx={{
                        backgroundColor: item.fill,
                        color: item.text,
                        fontWeight: 500
                    }}
                />
            ))}
        </Stack>
    );
}
