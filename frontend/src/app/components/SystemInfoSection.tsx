import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SystemInfo } from '../types/admin.types';

interface SystemInfoProps {
    systemInfo: SystemInfo | undefined;
    isError?: boolean;
}

const SystemInfoSection = ({ systemInfo, isError = false }: SystemInfoProps) => {

    if (!systemInfo || isError) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="bold-title" sx={{ color: 'red' }}>
                    Error Retrieving System Info
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={2} p={3}>
            <Grid item xs={12}>
                <Typography variant="h5" fontWeight="bold">
                    System Details
                </Typography>
            </Grid>
            {Object.entries(systemInfo).map(([key, value]) => {
                if (key === 'disk' || key === 'memory') {
                    return (
                        <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
                                Usage:
                            </Typography>
                            <Typography variant="body1">
                                Percentage: {value.Percentage}%
                                <br />
                                Total: {value.Total} GB
                                <br />
                                Used: {value.Used} GB
                            </Typography>
                        </Grid>
                    );
                } else if (key === 'net') {
                    return (
                        <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Network Usage:
                            </Typography>
                            <Typography variant="body1">
                                Bytes Received: {value['Bytes Received']} MB
                                <br />
                                Bytes Sent: {value['Bytes Sent']} MB
                            </Typography>
                        </Grid>
                    );
                } else if (key === 'os') {
                    return (
                        <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {key.toUpperCase()} Info:
                            </Typography>
                            <Typography variant="body1">
                                Architecture: {value.Architecture.join(', ')}
                                <br />
                                Average Load: {value['Average Load'].join(', ')}
                                <br />
                                Kernel Version: {value['Kernel Version']}
                                <br />
                                Uptime: {value.Uptime}
                            </Typography>
                        </Grid>
                    );
                } else {
                    return null;
                }
            })}
        </Grid>
    );
};

export default SystemInfoSection;
