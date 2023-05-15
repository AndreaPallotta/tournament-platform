/* eslint-disable @typescript-eslint/no-empty-function */
import { AlertColor, Slide, SlideProps, Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import * as React from 'react';

interface INotificationParams {
    duration?: number;
    children?: string | JSX.Element | JSX.Element[];
}

interface INotificationContext {
    openNotification: (
        message: string,
        severity?: AlertProps['severity']
    ) => void;
}

const DEFAULT_DURATION = 3000;

const SlideTransition = (props: SlideProps) => (
    <Slide {...props} direction="up" />
);

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NotificationContext = React.createContext<INotificationContext>({
    openNotification: () => {},
});

export const useNotification = ({
    duration = DEFAULT_DURATION,
}: INotificationParams) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [severity, setSeverity] = React.useState<AlertColor>('info');

    const openNotification = React.useCallback(
        (message: string, severity: AlertColor = 'info') => {
            if (message) {
                setIsOpen(true);
                setMessage(message);
                setSeverity(severity);
            }
        },
        []
    );

    const closeNotification = React.useCallback(
        (_: React.SyntheticEvent | Event, reason?: string) => {
            if (reason === 'clickaway') {
                return;
            }
            setIsOpen(false);
        },
        []
    );

    const notification = (
        <Snackbar
            open={isOpen}
            autoHideDuration={duration}
            onClose={closeNotification}
            TransitionComponent={SlideTransition}
        >
            <Alert
                onClose={closeNotification}
                severity={severity}
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );

    return {
        notification,
        openNotification,
    };
};

export const NotificationProvider: React.FC<INotificationParams> = ({
    duration,
    children,
}: INotificationParams) => {
    const { notification, openNotification } = useNotification({ duration });
    const value = React.useMemo(
        () => ({ openNotification }),
        [openNotification]
    );

    return (
        <NotificationContext.Provider value={value}>
            {notification}
            {children}
        </NotificationContext.Provider>
    );
};

export const useOpenNotification = () => {
    const { openNotification } = React.useContext(NotificationContext);
    return openNotification;
};
