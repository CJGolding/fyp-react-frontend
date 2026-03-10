import {Grid} from "@mui/material";
import React from "react";
import ConfigurationForm from "../components/ConfigurationForm.jsx";
import ProjectInfo from "../components/ProjectInfo.jsx";


export default function ConfigurationPanel({onInitialised}) {
    return (
        <Grid container spacing={3}>
            <ProjectInfo/>
            <ConfigurationForm onInitialised={onInitialised}/>
        </Grid>
    )
}
