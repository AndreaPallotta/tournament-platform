import React from 'react';
import { Navigate, PathRouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useOpenNotification } from '../hooks/useNotification';
import { doesRoleHavePermission } from '../services/utils.service';
import { Role } from '../types/enums';

type ProtectedRouteProps = PathRouteProps & {
    minRole?: Role;
    exactRoleMatch?: boolean;
    element: React.ReactElement;
};

const ProtectedRouteElement: React.FC<ProtectedRouteProps> = ({
    minRole = Role.VISITOR,
    exactRoleMatch = false,
    element,
}: ProtectedRouteProps): React.ReactElement | null => {
    const { role } = useAuth();
    const openNotification = useOpenNotification();

    React.useEffect(() => {
        if (!doesRoleHavePermission(role, minRole, exactRoleMatch)) {
            openNotification(
                'You do not have permission to access this page.',
                'error'
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!doesRoleHavePermission(role, minRole, exactRoleMatch)) {
        return <Navigate to={'/'} />;
    }

    return element;
};

export default ProtectedRouteElement;
