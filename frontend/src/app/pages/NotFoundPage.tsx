import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoBack = (event: React.SyntheticEvent) => {
        event.preventDefault();
        navigate(-1);
    };

    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                my: '1rem',
                flexGrow: 1,
            }}
        >
            <img
                src="/error_404.jpg"
                alt="404 Error"
                style={{ maxWidth: '45%', height: 'auto' }}
            />
            <Typography variant="h4" sx={{ mt: 4 }}>
                Oops! Page not found.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                The page you are looking for does not exist or has been moved.
            </Typography>
            <Container
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 4,
                }}
            >
                <Button variant="contained" component={Link} to="/">
                    Go to Home
                </Button>
                {location.pathname !== '/not_found' && (
                    <Button variant="outlined" onClick={handleGoBack}>
                        Go Back
                    </Button>
                )}
            </Container>
        </Container>
    );
};

export default NotFoundPage;
