import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Ec2Info } from '../types/admin.types';

interface Ec2InfoProps {
    ec2Info: Ec2Info[] | undefined;
    isError?: boolean;
}

const parseValue = (value: string | undefined): string => {
    if (!value || value.trim().length === 0) {
        return 'Unknown';
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date.toLocaleString();
    }

    return value;
};

const formatName = (name: string) => {
    if (!name.includes('_')) return name;

    return name.split('_')[0];
};

const formatSx = (key: string, value: string | string[]) => {
    if (key !== 'Status' || Array.isArray(value)) {
        return {};
    }

    if (value === 'running') return { color: 'green' };

    return { color: 'red' };
};

const Ec2InfoSection = ({ ec2Info, isError = false }: Ec2InfoProps) => {
    if (!ec2Info || isError) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="bold-title" sx={{ color: 'red' }}>
                    Error Retrieving EC2 Info
                </Typography>
            </Box>
        );
    }
    return (
        <>
            {ec2Info.map((ec2: Ec2Info, index: number) => (
                <Grid container key={index} spacing={2} p={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="bold">
                            EC2 Details (
                            {formatName(ec2['Instance Name' as keyof Ec2Info])})
                        </Typography>
                    </Grid>
                    {Object.keys(ec2).map((key: string) => (
                        <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {key}:
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    ...formatSx(key, ec2[key as keyof Ec2Info]),
                                }}
                            >
                                {parseValue(ec2[key as keyof Ec2Info])}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            ))}
        </>
    );
};

export default Ec2InfoSection;
