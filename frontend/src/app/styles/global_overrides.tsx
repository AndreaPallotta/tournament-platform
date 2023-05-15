import { createTheme } from '@mui/material';

export function GlobalStyles() {
    const theme = createTheme({
        components: {
            // Name of the component
            MuiButton: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS

                        backgroundColor: '#0763A6',
                        color: 'white',
                        //color: 'white',

                        borderRadius: '300px',
                        margin: '0 auto',
                        padding: '16px 32px',
                        fontSize: '18px',
                        textTransform: 'none',
                        textAlign: 'center',
                    },
                },
            },

            MuiTypography: {
                variants: [
                    {
                        props: { variant: 'h1' },
                        style: {
                            textTransform: 'none',
                            fontSize: '96px',
                            color: 'white',
                        },
                    },
                    {
                        props: { variant: 'h2' },
                        style: {
                            textTransform: 'none',
                            fontSize: '32px',
                            fontStyle: 'bold',
                        },
                    },
                    {
                        props: { variant: 'h3' },
                        style: {
                            textTransform: 'none',
                            fontSize: '18px',
                            fontStyle: 'semibold',
                        },
                    },
                    {
                        props: { variant: 'h4' },
                        style: {
                            textTransform: 'none',
                        },
                    },
                    {
                        props: { variant: 'body1' },
                        style: {
                            textTransform: 'none',
                            fontSize: '18px',
                            color: '#222',
                        },
                    },
                ],
            },
        },
    });

    return theme;
}

export default GlobalStyles;
