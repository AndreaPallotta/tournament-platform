import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import React from 'react';
import { AdminPage } from '../types/admin.types';

interface IDrawer {
    open: boolean;
    toggleDrawer: () => void;
    setSelectedPage: (name: AdminPage) => void;
    selectedPage: AdminPage;
}

interface IListItem {
    primary: AdminPage;
    secondary?: string | undefined;
    icon: React.ReactNode;
}

const listItems: IListItem[] = [
    {
        primary: AdminPage.PERMISSIONS,
        secondary: 'Change user permissions',
        icon: <LockOpenRoundedIcon />,
    },
    {
        primary: AdminPage.CRUD,
        secondary: 'Execute CRUD operations',
        icon: <StorageRoundedIcon />,
    },
    {
        primary: AdminPage.LOGS,
        secondary: 'View logs and audits',
        icon: <HistoryRoundedIcon />,
    },
    {
        primary: AdminPage.ANALYTICS,
        secondary: 'View analytics',
        icon: <AnalyticsRoundedIcon />,
    },
    {
        primary: AdminPage.SERVER,
        secondary: 'View Server information',
        icon: <DevicesOtherRoundedIcon />,
    },
];

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop: PropertyKey) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: 280,
        height: '100vh',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const AdminDrawer = ({
    open,
    toggleDrawer,
    setSelectedPage,
    selectedPage,
}: IDrawer) => {
    return (
        <Drawer variant="permanent" open={open}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={toggleDrawer}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
                {listItems.map(({ primary, secondary, icon }: IListItem) => (
                    <ListItemButton
                        key={primary}
                        selected={selectedPage === primary}
                        onClick={() => {
                            setSelectedPage(primary);
                        }}
                    >
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={primary} secondary={secondary} />
                    </ListItemButton>
                ))}
                <Divider sx={{ my: 1 }} />
            </List>
        </Drawer>
    );
};

export default AdminDrawer;
