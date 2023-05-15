import { Container, Grid, Skeleton, Typography } from '@mui/material';

const ServerPageSkeleton = () => {
    return (
        <Container>
            <Skeleton variant="rectangular" height={48} />
            <Grid container spacing={2} p={3}>
                <Grid item xs={12}>
                    <Skeleton variant="text" width="300px" height="70px" />
                </Grid>
                {[...Array(8)].map((_: unknown, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Typography variant="subtitle1">
                            <Skeleton
                                variant="text"
                                width="200px"
                                height="30px"
                            />
                        </Typography>
                        <Typography variant="body1">
                            <Skeleton
                                variant="text"
                                width="250px"
                                height="20px"
                            />
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ServerPageSkeleton;
