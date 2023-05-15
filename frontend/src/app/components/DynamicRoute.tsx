import React, { useState } from 'react';
import {
    Navigate,
    PathRouteProps,
    useLocation,
    useParams,
} from 'react-router-dom';
import useDynRoutes from '../hooks/useDynRoutes';
import { useOpenNotification } from '../hooks/useNotification';
import { get } from '../services/api.service';
import LoadingPage from '../pages/LoadingPage'

type DynamicRouteProps = PathRouteProps & {
    model: string;
    element: React.ReactElement;
    errMsg?: string;
};

const DynamicRouteElement: React.FC<DynamicRouteProps> = ({
    model,
    element,
}: DynamicRouteProps): React.ReactElement | null => {
    const [isLoading, setIsLoading] = useState(true);
    const openNotification = useOpenNotification();
    const useRoutes = useDynRoutes();
    const params = useParams();
    const location = useLocation();

    const fetchToValidateRoute = async () => {
        setIsLoading(true);

        const entry = Object.entries(params)[0];
        const { err, res } = await get('/api/auth/validateDynRoute', {
            fieldName: entry[0],
            fieldValue: entry[1],
            model: model.toLowerCase(),
        });

        if (err || !res?.found) {
            openNotification(err || 'Page does not exist', 'error');
            useRoutes.setInvalidRoutes((prev: string[]) => [
                ...prev,
                location.pathname,
            ]);
        }

        setIsLoading(false);
    };

    React.useEffect(() => {
        fetchToValidateRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) return <LoadingPage />;

    if (useRoutes.invalidRoutes.includes(location.pathname)) {
        return <Navigate to="/not_found" />;
    }

    return element;
};

export default DynamicRouteElement;
