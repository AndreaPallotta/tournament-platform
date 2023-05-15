import { Button } from '@mui/material';
import React, { useEffect } from 'react';
import CustomTabs from '../../../components/CustomTabs';
import TerminalBox from '../../../components/TerminalBox';
import { useOpenNotification } from '../../../hooks/useNotification';
import { get } from '../../../services/api.service';

const LogsAuditPage = () => {
    const [dockerLogs, setDockerLogs] = React.useState('');
    const [ec2Logs, setEc2Logs] = React.useState('');
    const [isError, setIsError] = React.useState(false);

    const openNotification = useOpenNotification();

    const content = [
        {
            label: 'Express API',
            content: <TerminalBox content={dockerLogs} isError={isError} />,
        },
        {
            label: 'EC2 Auth',
            content: <TerminalBox content={ec2Logs} isError={isError} />,
        },
    ];

    const handleGetLogs = React.useCallback(async () => {
        const { res, err } = await get('/flask/logs');

        if (err || !res) {
            setIsError(true);
            openNotification(err || 'Error retrieving logs', 'error');
            setDockerLogs(
                'Error retrieving docker logs. Check the error.log file on the EC2'
            );
            setEc2Logs(
                'Error retrieving ec2 logs. Check the error.log file on the EC2'
            );

            return;
        }

        setDockerLogs(res?.docker || 'No docker logs found');
        setEc2Logs(res?.ec2 || 'No ec2 logs found');
        setIsError(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        handleGetLogs();
    }, [handleGetLogs]);

    return (
        <div>
            <CustomTabs ariaLabel="admin-logs-tabs" props={content} />
            <Button variant="outlined" onChange={handleGetLogs}>
                Refresh
            </Button>
        </div>
    );
};

export default LogsAuditPage;
