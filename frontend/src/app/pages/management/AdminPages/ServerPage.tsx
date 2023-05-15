import React from 'react';
import CustomTabs from 'src/app/components/CustomTabs';
import Ec2InfoSection from 'src/app/components/Ec2InfoSection';
import ServerPageSkeleton from 'src/app/components/ServerPageSkeleton';
import DockerInfoSection from '../../../components/DockerInfoSection';
import SystemInfoSection from '../../../components/SystemInfoSection';
import { useOpenNotification } from '../../../hooks/useNotification';
import { get } from '../../../services/api.service';
import { ServerInfo } from '../../../types/admin.types';

const ServerPage = () => {
    const [serverInfo, setServerInfo] = React.useState<ServerInfo>();
    const [isError, setIsError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const openNotification = useOpenNotification();

    const content = [
        {
            label: 'Docker',
            content: (
                <DockerInfoSection
                    dockerInfo={serverInfo?.docker}
                    isError={isError}
                />
            ),
        },
        {
            label: 'EC2',
            content: (
                <Ec2InfoSection ec2Info={serverInfo?.ec2} isError={isError} />
            ),
        },
        {
            label: 'System',
            content: (
                <SystemInfoSection
                    systemInfo={serverInfo?.system_info}
                    isError={isError}
                />
            ),
        },
    ];

    const handleGetInfo = React.useCallback(async () => {
        setIsLoading(true);
        const { res, err } = await get('/flask/admin_info');

        if (err || !res) {
            openNotification(err || 'Error retrieving logs', 'error');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        setServerInfo(res as ServerInfo);
        setIsError(false);
        setIsLoading(false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        handleGetInfo();
    }, [handleGetInfo]);

    if (isLoading) {
        return <ServerPageSkeleton />;
    }

    return (
        <div>
            <CustomTabs ariaLabel="server-status-tabs" props={content} />
        </div>
    );
};

export default ServerPage;
