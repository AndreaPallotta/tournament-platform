import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { SlotComponentProps } from '@mui/base';
import { Error, Info, WarningAmber } from '@mui/icons-material';
import {
    Backdrop,
    Box,
    Fade,
    Modal as MUIModal,
    ModalComponentsPropsOverrides,
    ModalOwnerState,
    Stack,
    SxProps,
    Typography,
    useTheme,
} from '@mui/material';
import { globalStyleVars } from '../app';

interface ModalProps {
    open: boolean;
    ariaLabelledBy: string;
    ariaDescribedBy: string;
    children?: React.ReactNode;
    onClose?: (...value: any) => void | undefined;
    keepMounted?: boolean | undefined;
    closeAfterTransition?: boolean | undefined;
    slots?:
        | {
              root?: React.ElementType<any> | undefined;
              backdrop?: React.ElementType<any> | undefined;
          }
        | undefined;
    slotProps?: {
        root?: SlotComponentProps<
            'div',
            ModalComponentsPropsOverrides,
            ModalOwnerState
        >;
        backdrop?: SlotComponentProps<
            typeof Backdrop,
            ModalComponentsPropsOverrides,
            ModalOwnerState
        >;
    };
    backgroundColor?: string;
    type?: 'info' | 'warning' | 'error';
    sx?: SxProps;
    [key: string]: any;
}

const typeColors = {
    info: 'black',
    warning: globalStyleVars.purple,
    error: 'tomato',
};

const typeText = {
    info: 'Heads Up',
    warning: 'Warning',
    error: 'Error',
};

/**
 * Modal for popups on our app.
 *
 * @param {ModalProps} {
 *     open,
 *     ariaLabelledBy,
 *     ariaDescribedBy,
 *     children,
 *     onClose,
 *     keepMounted = true,
 *     closeAfterTransition = true,
 *     slots = { backdrop: Backdrop },
 *     slotProps = {
 *         backdrop: {
 *             timeout: 500,
 *         },
 *     },
 *     backgroundColor = 'white',
 *     sx,
 *     ...props
 * }
 * @return {*}
 */
function Modal({
    open,
    ariaLabelledBy,
    ariaDescribedBy,
    children,
    onClose,
    keepMounted = true,
    closeAfterTransition = true,
    slots = { backdrop: Backdrop },
    slotProps = {
        backdrop: {
            timeout: 500,
        },
    },
    backgroundColor = 'white',
    type,
    sx,
    ...props
}: ModalProps) {
    const theme = useTheme();

    const getTypeHeader = (type: keyof typeof typeText): EmotionJSX.Element => {
        switch (type) {
            case 'info':
                return (
                    <Info
                        sx={{
                            color: typeColors[type],
                            fontSize: theme.typography.h3.fontSize,
                        }}
                    />
                );
            case 'warning':
                return (
                    <WarningAmber
                        sx={{
                            color: typeColors[type],
                            fontSize: theme.typography.h3.fontSize,
                        }}
                    />
                );
            default:
                return (
                    <Error
                        sx={{
                            color: typeColors[type],
                            fontSize: theme.typography.h3.fontSize,
                        }}
                    />
                );
        }
    };

    return (
        <MUIModal
            open={open}
            onClose={onClose}
            keepMounted={keepMounted}
            closeAfterTransition={closeAfterTransition}
            slots={slots}
            slotProps={slotProps}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            {...props}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        height: '90vh',
                        transform: 'translate(-50%, -50%)',
                        width: '35vw',
                        backgroundColor: backgroundColor,
                        padding: '80px 50px',
                        borderRadius: '8px',
                        overflowY: 'scroll',
                        ':focus-visible': {
                            outline: 'none',
                        },
                        ...sx,
                    }}
                >
                    {type && (
                        <Stack
                            direction="row"
                            spacing="16px"
                            sx={{
                                marginBottom: '30px',
                                alignItems: 'center',
                            }}
                        >
                            {getTypeHeader(type)}
                            <Typography
                                variant="h3"
                                sx={{
                                    color: typeColors[type],
                                }}
                            >
                                {typeText[type]}
                            </Typography>
                        </Stack>
                    )}
                    {children}
                </Box>
            </Fade>
        </MUIModal>
    );
}

export default Modal;
