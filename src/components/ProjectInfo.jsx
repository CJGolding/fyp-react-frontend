import {Alert, Grid, Link, Paper, Typography} from "@mui/material";

export default function ProjectInfo () {
    return (
        <Grid size={{xs: 12, md: 6}}>
            <Paper elevation={3} style={{padding: 24}}>
                <Typography variant="h5" gutterBottom>Project Information</Typography>
                <Typography variant="body1" align="justify">
                    This is a Final Year Computer Science Project that implements a visualisation and simulation
                    tool based on the theoretical matchmaking system proposed by J. Alman and D. McKay in{" "}
                    <Link href="https://ifaamas.org/Proceedings/aamas2017/pdfs/p1073.pdf">
                        Theoretical Foundations of Team Matchmaking
                    </Link>
                    .{" "}
                    This codebase implements the Unrestricted and Time-Sensitive variants of the system,
                    including the option of using a greedy heuristic to accelerate computation, while still
                    guaranteeing optimality within a given margin. The following configuration options are available:
                </Typography>
                <Typography component="ul" align="justify" variant="body1" sx={{ mt: 2 }}>
                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Mode:</Typography> Unrestricted or Time-Sensitive (where waiting times are factored in).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Team Size (k):</Typography> Number of players per team (1–5).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Fairness Norm (p):</Typography> Norm used to measure fairness of skills between teams (1 ≤ p ≤ 10).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Uniformity Norm (q):</Typography> Norm used to measure uniformity of how evenly distributed player skills are on each team (1 ≤ q ≤ 10).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Fairness Weight (α):</Typography> Weight given to determine how important fairness is relative to uniformity (0 &lt; α ≤ 10).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Queue Weight (β):</Typography> Weight given to determine how important it is that players don't wait too long in the Time-Sensitive mode (0 &lt; β ≤ 10).
                    </Typography>

                    <Typography component="li">
                        <Typography component="span" fontWeight="bold">Matchmaking Approach:</Typography> Option to use the greedy partitioning heuristic from Lemma 5 for faster matchmaking.
                    </Typography>
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body1" align="justify">
                        Using the greedy partitioning heuristic is highly recommended for simulations containing 100+ players or when team size k &gt; 3.
                    </Typography>
                </Alert>
                <Typography variant="body1" align="justify" sx={{ mt: 2 }}>
                    The source code for the frontend can be found{" "}
                    <Link href="https://github.com/CJGolding/fyp-react-frontend">
                        here
                    </Link>,
                    and the backend{" "}
                    <Link href="https://github.com/CJGolding/fyp-python-backend">
                        here
                    </Link>.
                </Typography>

            </Paper>
        </Grid>
    )
}