/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import DataCard from '../../../components/DataCard';
import { useOpenNotification } from '../../../hooks/useNotification';
import { get } from '../../../services/api.service';
import {
    capitalizeFirst,
    formatRoleKey,
} from '../../../services/utils.service';
import { Stats } from '../../../types/admin.types';

type StatsEntry = [string, number | 'N/A'];

const NetworkPage = () => {
    const [stats, setStats] = React.useState<Stats>({
        models: {},
        roles: {},
    });

    const openNotification = useOpenNotification();

    const handleGetStats = React.useCallback(async () => {
        const { err, res } = await get('/api/admin/getStats');

        if (err || !res) {
            openNotification(err || 'Error retrieving stats', 'error');
            return;
        }

        setStats(res.stats);
    }, []);

    React.useEffect(() => {
        handleGetStats();
    }, []);

    return (
        <div>
            <Typography variant="h4" ml={4} my={5}>
                DB Model Statistics
            </Typography>

            <Grid
                container
                spacing={3}
                justifyContent="space-evenly"
                sx={{ mb: 5 }}
            >
                {Object.entries(stats.models).map(
                    ([key, value]: StatsEntry, index: number) => (
                        <Grid item xs={6} sm={4} md={2} key={index}>
                            <DataCard
                                title={`${capitalizeFirst(key)}s`}
                                value={value}
                                sx={{ width: '100%' }}
                                useAbbreviation
                            />
                        </Grid>
                    )
                )}
            </Grid>

            <Divider />

            <Typography variant="h4" ml={4} my={5}>
                User Roles Statistics
            </Typography>

            <Grid container spacing={3} justifyContent="space-evenly">
                {Object.entries(stats.roles).map(
                    ([key, value]: StatsEntry, index: number) => (
                        <Grid item xs={8} sm={6} md={4} key={index}>
                            <DataCard
                                title={`${formatRoleKey(key)}s`}
                                value={value}
                                sx={{ width: '100%' }}
                                useAbbreviation
                            />
                        </Grid>
                    )
                )}
            </Grid>
        </div>
    );
};

export default NetworkPage;
