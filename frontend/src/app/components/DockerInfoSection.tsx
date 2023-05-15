import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DockerInfo } from '../types/admin.types';

interface DockerInfoProps {
    dockerInfo: DockerInfo | undefined;
    isError?: boolean;
}

const parseType = (value: string | string[]): string => {
    if (Array.isArray(value)) return value.join('\n');

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date.toLocaleString();
    }

    return value;
};

const formatSx = (key: string, value: string | string[]) => {
    if (key !== 'Status' || Array.isArray(value)) {
        return {};
    }

    if (value === 'running') return { color: 'green' };

    return { color: 'red' };
};

const DockerInfoSection = ({
    dockerInfo,
    isError = false,
}: DockerInfoProps) => {
    if (!dockerInfo || isError) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="bold-title" sx={{ color: 'red' }}>
                    Error Retrieving Docker Info
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={2} p={3}>
            <Grid item xs={12}>
                <Typography variant="h5" fontWeight="bold">
                    Docker Details
                </Typography>
            </Grid>
            {Object.keys(dockerInfo).map((key: string) => (
                <Grid item xs={12} sm={6} key={key}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {key}:
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            ...formatSx(
                                key,
                                dockerInfo[key as keyof DockerInfo]
                            ),
                        }}
                    >
                        {parseType(dockerInfo[key as keyof DockerInfo])}
                    </Typography>
                </Grid>
            ))}
        </Grid>
    );
};

export default DockerInfoSection;
