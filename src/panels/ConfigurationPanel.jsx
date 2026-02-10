import {Grid} from "@mui/material";
import React from "react";
import ConfigurationForm from "../components/ConfigurationForm.jsx";


function ConfigurationPanel({onInitialised}) {
    return (
        <Grid container spacing={3}>
            <ConfigurationForm onInitialised={onInitialised}/>
        </Grid>
    )
}

export default ConfigurationPanel;