import Box from '@mui/material/Box';
import React from 'react';
import AdminDrawer from '../../components/AdminDrawer';
import { AdminPage } from '../../types/admin.types';
import CrudPage from './AdminPages/CrudPage';
import LogsAuditPage from './AdminPages/LogsAuditPage';
import NetworkPage from './AdminPages/NetworkPage';
import PermissionsPage from './AdminPages/PermissionsPage';
import ServerPage from './AdminPages/ServerPage';

const AdminDashboard = () => {
    const [open, setOpen] = React.useState(true);
    const [selectedPage, setSelectedPage] = React.useState<AdminPage>(
        AdminPage.PERMISSIONS
    );

    const toggleDrawer = () => {
        setOpen((prevState: boolean) => !prevState);
    };

    const handleSelectedPage = (page: AdminPage) => {
        setSelectedPage(page);
    };

    const renderPage = () => {
        switch (selectedPage) {
            case AdminPage.PERMISSIONS:
                return <PermissionsPage />;
            case AdminPage.CRUD:
                return <CrudPage />;
            case AdminPage.LOGS:
                return <LogsAuditPage />;
            case AdminPage.ANALYTICS:
                return <NetworkPage />;
            case AdminPage.SERVER:
                return <ServerPage />;
            default:
                return <PermissionsPage />;
        }
    };

    React.useEffect(() => {
        handleSelectedPage(AdminPage.PERMISSIONS);
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminDrawer
                open={open}
                toggleDrawer={toggleDrawer}
                setSelectedPage={handleSelectedPage}
                selectedPage={selectedPage}
            />
            <Box sx={{ flexGrow: 1, p: 2, ml: { sm: 2, md: 3 } }}>
                {renderPage()}
            </Box>
        </Box>
    );
};

export default AdminDashboard;
