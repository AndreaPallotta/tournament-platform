import {
    LoginOutlined,
    LogoutOutlined,
    PersonAddOutlined,
    PersonOutline,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { Divider, Link, SxProps, useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import { Stack } from '@mui/system';
import Cookies from 'js-cookie';
import * as React from 'react';
import { Link as RouterLink, To, useNavigate } from 'react-router-dom';
import { globalStyleVars } from '../app';
import { useAuth } from '../contexts/authContext';
import { clearSession } from '../services/api.service';
import { Role } from '../types/enums';
import CircleButton from './CircleButton';

// styles that might change
const styles = {
    toolbarBackgroundColor: '#FFFFFF',
    toolbarBorder: '1px solid #D9D9D9',
    toolbarBoxShadow: 'none',
};

interface INavigationBarToolProps {
    text: string;
    url: string;
    onClick: () => void;
    buttonSx?: SxProps;
    iconSx?: SxProps;
    icon: JSX.Element;
}

// structure for page navigation buttons at the top (on screens larger than 'lg') or navigation
// buttons in the left-side burger menu (on screens smaller than 'lg')
interface INavigationBarPage {
    [key: string]: Array<{
        text: string;
        url: To;
    }>;
}

// structure for 'tools' (login, settings (removed for now), logout, signin, etc) on the right side of the navbar
interface INavigationBarTool {
    [key: string]: Array<INavigationBarToolProps>;
}

// the different page navigation buttons for each user role
const pages: INavigationBarPage = {
    [Role.VISITOR]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Aardvark Games', url: '/aardvark' },
    ],
    [Role.REGISTERED_USER]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Aardvark Games', url: '/aardvark' },
        { text: 'College', url: 'college' },
    ],
    [Role.PLAYER]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Aardvark Games', url: '/aardvark' },
        { text: 'College', url: 'college' },
    ],
    [Role.TEAM_CAPTAIN]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Aardvark Games', url: '/aardvark' },
        { text: 'College', url: 'college' },
    ],
    [Role.UNIVERSITY_TOURNAMENT_MOD]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Tournament', url: 'tournament' },
        { text: 'College', url: 'college' },
    ],
    [Role.UNIVERSITY_MARKETING_MOD]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'College', url: 'college' },
    ],
    [Role.AARDVARK_TOURNAMENT_MOD]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Tournament', url: 'tournament' },
    ],
    [Role.ADMIN]: [
        { text: 'A New World', url: 'about' },
        { text: 'Rules', url: 'rules' },
        { text: 'Participants', url: 'participants' },
        { text: 'Admin Dashboard', url: 'admin' },
    ],
};
function NavigationBar() {
    // get global theming styles
    const theme = useTheme();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const { user, role, setRole, setUser, setAuthToken } = useAuth();

    const navigate = useNavigate();

    // the current element selected if the burger menu is shown on the screen
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
        null
    );

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleLogout = () => {
        clearSession();
        setRole(undefined);
        setUser(undefined);
        setAuthToken(undefined);
        handleCloseNavMenu();
    };

    // logout button is used by multiple roles, so caching it here
    const logoutButton: INavigationBarToolProps = {
        text: 'Logout',
        url: '/login',
        onClick: handleLogout,
        buttonSx: {
            textDecoration: 'none',
            borderRadius: '6px',
            border: `1px solid ${styles.toolbarBackgroundColor}`,
            ':hover': {
                border: '1px solid #797979',
            },
        },
        icon: <LogoutOutlined fontSize="large" />,
    };

    const profileButton: INavigationBarToolProps = {
        text: 'Profile',
        url: `/profile/${user?.id}`,
        onClick: handleCloseNavMenu,
        buttonSx: {
            textDecoration: 'none',
            borderRadius: '6px',
            border: `1px solid ${styles.toolbarBackgroundColor}`,
            ':hover': {
                border: '1px solid #797979',
            },
        },
        icon: <PersonOutline fontSize="large" />,
    };

    const loginButton: INavigationBarToolProps = {
        text: 'Log In',
        url: '/login',
        onClick: handleCloseNavMenu,
        buttonSx: {
            textDecoration: 'none',
            borderRadius: '6px',
            border: `1px solid ${styles.toolbarBackgroundColor}`,
            ':hover': {
                border: '1px solid #797979',
            },
        },
        icon: <LoginOutlined fontSize="large" />,
    };

    const signupButton: INavigationBarToolProps = {
        text: 'Sign Up',
        url: '/signup',
        onClick: handleCloseNavMenu,
        buttonSx: {
            textDecoration: 'none',
            borderRadius: '6px',
            ':hover': {
                backgroundColor: '#797979',
                color: styles.toolbarBackgroundColor,
            },
        },
        iconSx: {
            ':hover': {
                backgroundColor: '#797979',
                color: styles.toolbarBackgroundColor,
            },
        },
        icon: <PersonAddOutlined fontSize="large" />,
    };

    // tools button properties for each user role
    const tools: INavigationBarTool = {
        [Role.VISITOR]: [loginButton, signupButton],
        [Role.REGISTERED_USER]: [profileButton, logoutButton],
        [Role.PLAYER]: [profileButton, logoutButton],
        [Role.TEAM_CAPTAIN]: [profileButton, logoutButton],
        [Role.UNIVERSITY_MARKETING_MOD]: [profileButton, logoutButton],
        [Role.UNIVERSITY_TOURNAMENT_MOD]: [profileButton, logoutButton],
        [Role.AARDVARK_TOURNAMENT_MOD]: [profileButton, logoutButton],
        [Role.ADMIN]: [profileButton, logoutButton],
    };

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: styles.toolbarBackgroundColor,
                borderBottom: styles.toolbarBorder,
                boxShadow: styles.toolbarBoxShadow,
            }}
        >
            <Container maxWidth={false} disableGutters>
                <Toolbar
                    disableGutters
                    sx={{
                        height: globalStyleVars.navBarHeight,
                    }}
                >
                    {/* this Box contains the burger menu for each of the navbar pages.
                    it only displays on screen sizes below the 'lg' size. */}
                    <Box
                        sx={{
                            display: 'none',
                            marginLeft: '2.5vw',
                            [theme.breakpoints.down('lg')]: {
                                display: 'flex',
                            },
                        }}
                    >
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: 'none',
                                [theme.breakpoints.down('lg')]: {
                                    display: 'flex',
                                },
                            }}
                        >
                            {pages[role ?? Role.VISITOR].map(
                                (pageButton: { text: string; url: To }) => {
                                    return (
                                        <MenuItem
                                            key={pageButton.text}
                                            onClick={handleCloseNavMenu}
                                        >
                                            <Link
                                                noWrap
                                                component={RouterLink}
                                                to={pageButton.url}
                                                sx={{
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {pageButton.text}
                                            </Link>
                                        </MenuItem>
                                    );
                                }
                            )}
                        </Menu>
                    </Box>

                    {/* this Avatar will display the website's logo when the screen is anything
                    below the 'sm' size. it can also be clicked to navigate to the home page. */}
                    <Avatar
                        alt="Aardvark Games"
                        src="/logo_dark_teal.jpg"
                        component={RouterLink}
                        to="/"
                        sx={{
                            display: 'none',
                            marginLeft: '4.5vw',
                            marginRight: '12vw',
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                            },
                        }}
                    />

                    {/* main text for the current page. it can also be clicked to navigate to the home page. */}
                    <Link
                        variant="bold"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            marginLeft: '4.5vw',
                            marginRight: '6vw',
                            textDecoration: 'none',
                            flexShrink: 0,
                            [theme.breakpoints.down('sm')]: {
                                display: 'none',
                            },
                            [theme.breakpoints.down('xl')]: {
                                marginRight: '2vw',
                                marginLeft: '2.5vw',
                            },
                        }}
                    >
                        Tournament Platform
                    </Link>

                    {/* pages to navigate to from the navbar. */}
                    <Stack
                        direction={'row'}
                        spacing={'2vw'}
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            [theme.breakpoints.down('lg')]: {
                                display: 'none',
                            },
                        }}
                    >
                        {pages[role ?? Role.VISITOR].map(
                            (pageButton: { text: string; url: To }) => {
                                return (
                                    <Button
                                        onClick={handleCloseNavMenu}
                                        key={pageButton.text}
                                        component={RouterLink}
                                        to={pageButton.url}
                                        sx={{
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            minWidth: 'min-content',
                                            border: `1px solid ${styles.toolbarBackgroundColor}`,
                                        }}
                                    >
                                        {pageButton.text}
                                    </Button>
                                );
                            }
                        )}
                    </Stack>

                    <Divider
                        orientation="vertical"
                        sx={{
                            height: '60px',
                            marginLeft: '1vw',
                            marginRight: '1vw',
                            [theme.breakpoints.down('lg')]: {
                                display: 'none',
                            },
                        }}
                    />

                    {/* login/signup buttons */}
                    <Stack
                        direction={'row'}
                        spacing={'1vw'}
                        sx={{
                            marginRight: '4.5vw',
                            [theme.breakpoints.down('lg')]: {
                                marginLeft: 'auto',
                            },
                            [theme.breakpoints.down('xl')]: {
                                marginRight: '2.5vw',
                            },
                        }}
                    >
                        {tools[role || Role.VISITOR].map(
                            (toolButton: INavigationBarToolProps) => {
                                if (!isSmallScreen) {
                                    return (
                                        <Button
                                            onClick={() => {
                                                toolButton.onClick();
                                                navigate(toolButton.url);
                                            }}
                                            key={toolButton.text}
                                            sx={toolButton.buttonSx}
                                        >
                                            {toolButton.text}
                                        </Button>
                                    );
                                } else {
                                    return (
                                        <CircleButton
                                            icon={toolButton.icon}
                                            onClick={() => {
                                                toolButton.onClick();
                                                navigate(toolButton.url);
                                            }}
                                            key={toolButton.text}
                                            sx={toolButton.iconSx}
                                        />
                                    );
                                }
                            }
                        )}
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default NavigationBar;
