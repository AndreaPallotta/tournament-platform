import { GlobalStyles } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import Footer from './components/FooterComponent';
import NavigationBar from './components/NavigationBar';

// custom variant names for our Typography components
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        bold: true;
        card: true;
        'bold-title': true;
        'bold-small': true;
        small: true;
        lora: true;
    }
}

export const globalStyleVars = {
    mustardColor: '#EDCA82',
    blue: '#0763A6',
    purple: '#7F377A',
    navBarHeight: 100,
    formPageBackgroundColor: '#F5F8FA',
    heartColor: '#ff69b4',
    inlineLinkColor: '#4c71fb',
};

const theme = createTheme({
    components: {
        MuiUseMediaQuery: {
            defaultProps: {
                // prevents server-side hydration when using 'useMediaQuery()' hook
                noSsr: true,
            },
        },
        MuiButton: {
            styleOverrides: {
                // default styles for our buttons
                root: {
                    color: '#000000',
                },
            },
            // default props on our buttons
            defaultProps: {
                disableElevation: true,
            },
            variants: [
                {
                    props: { variant: 'contained', color: 'primary' },
                    style: {
                        backgroundColor: '#0763A6',
                        fontWeight: 600,
                        textTransform: 'none',
                    },
                },
            ],
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: '#000000',
                },
            },
        },
        MuiAvatar: {
            // default props on avatars/pictures
            defaultProps: {
                variant: 'rounded',
            },
        },
        MuiTypography: {
            // create new 'bold' variant to use on Typography components
            variants: [
                {
                    props: { variant: 'bold' },
                    style: {
                        fontWeight: 600,
                        fontSize: '24px',
                    },
                },
                {
                    props: { variant: 'card' },
                    style: {
                        fontWeight: 600,
                        lineHeight: '18px',
                    },
                },
                {
                    props: { variant: 'bold-title' },
                    style: {
                        fontWeight: 600,
                        fontSize: '32px',
                    },
                },
                {
                    props: { variant: 'bold-small' },
                    style: {
                        fontWeight: 600,
                        fontSize: 16,
                    },
                },
                {
                    props: { variant: 'small' },
                    style: {
                        fontWeight: 400,
                        fontSize: 16,
                    },
                },
                {
                    props: { variant: 'lora' },
                    style: {
                        fontFamily: 'Lora',
                        fontStyle: 'italic',
                        fontWeight: 700,
                        fontSize: '32px',
                        color: globalStyleVars.blue,
                    },
                },
            ],
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#000000',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '18px',
                    lineHeight: '24px',
                    fontWeight: 600,
                    color: '#323232',
                    textAlign: 'start',
                    '.MuiFormLabel-asterisk': {
                        color: '#FF0000',
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    fieldset: {
                        border: '1px solid #9E9E9E',
                        borderRadius: '8px',
                    },
                },
            },
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
    },
    // styling for the variants of the Typography component
    typography: {
        h3: {
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: '37.5px',
        },
        h4: {
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '28px',
        },
        fontSize: 16,
        fontWeightRegular: 400,
    },
    // our default values for different screen sizes
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    '.calendar-module_topBar__RY-aT': {
                        width: '100%',
                    },
                    '#bracket > div': {
                        cursor: 'grab',
                    },
                    '.MuiBox-root .css-1j4ffhz-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root':
                        {
                            borderRadius: '8px',
                        },
                }}
            />

            <CssBaseline />
            <div
                style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                <NavigationBar />
                <div style={{ flex: 1 }}>
                    <Outlet />
                </div>
                <div
                    style={{
                        marginTop: 'auto',
                    }}
                >
                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;
