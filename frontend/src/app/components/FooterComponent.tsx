import { Divider, Link, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

function Footer() {
    return (
        <div>
            <Divider />
            <Stack
                sx={{
                    bgcolor: '#F5F5F5',
                    p: 6,
                    width: '100vw',
                    margin: 0,
                    height: '250px',
                    justifyContent: 'center',
                }}
                component="footer"
            >
                <Typography variant="bold-small" align="center" gutterBottom>
                    Tournament Platform
                </Typography>
                <Typography
                    variant="small"
                    sx={{
                        textAlign: 'center',
                    }}
                >
                    {'Copyright © '}
                    <Link color="inherit" underline="hover" href="/">
                        Aardvark Games
                    </Link>{' '}
                    {new Date().getFullYear()}
                    {'. All Rights Reserved.'}
                </Typography>
            </Stack>
        </div>
    );
}
export default Footer;
