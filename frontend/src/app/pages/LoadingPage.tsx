import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { Box, Container, List, ListItem, ListItemButton, ListItemText } from '@mui/material'

export const LoadingPage = () => {
    return (
        <Container>
            <Skeleton animation="wave" height={50} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex'}}>
                <Card sx={{ maxWidth: 350, m: 2, flex: 1 }}>
                <CardHeader
                avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
                title={
                <Skeleton
                    animation="wave"
                    height={10}
                    width="80%"
                    style={{ marginBottom: 6 }}
                    />}
                    subheader={<Skeleton animation="wave" height={10} width="40%" />}
                />
                <Skeleton sx={{ height: 190 }} animation="wave" variant="rectangular" />
                <CardContent>
                    <Skeleton animation="wave" height={10} sx={{ mb: 6 }} />
                    <Skeleton animation="wave" height={10} width="80%" />
                </CardContent>
            </Card>

            <List sx={{ flex: 0.5 }}>
                {[...Array(6).keys()].map((i: number) => (
                    <ListItem key={i}>
                        <Skeleton animation="wave" height={10} width="40%" style={{ marginRight: 8 }} />
                        <ListItemText primary={<Skeleton animation="wave" height={10} width="60%" />} />
                    </ListItem>
                ))}
                <ListItemButton>
                    <Skeleton animation="wave" height={50} width="40%" />
                    <Skeleton animation="wave" height={50} width="35%" sx={{ ml: 1 }} />
                </ListItemButton>
            </List>
            </Box>
        </Container>
    )
};

export default LoadingPage;
