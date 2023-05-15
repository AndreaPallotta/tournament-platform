import {
    Alert,
    AlertTitle,
    Box,
    Stack,
    SxProps,
    Typography,
    useTheme,
} from '@mui/material';
import { globalStyleVars } from '../app';
import RoundedButton, { RoundedButtonProps } from './RoundedButton';

interface InputFormProps {
    title: string;
    inputs: JSX.Element[];
    buttons: RoundedButtonProps[];
    description?: string;
    bottomHelper?: React.ReactNode;
    children?: React.ReactNode;
    spacing?: boolean;
    sx?: SxProps;
    [key: string]: any;
}

/**
 * Creates an input form for entering varying information.
 *
 * @param {InputFormProps} {
 *     title,
 *     inputs,
 *     buttons,
 *     bottomHelper,
 *     children,
 *     spacing = true,
 *     sx,
 *     ...props
 * }
 * @return {*}
 */
function InputForm({
    title,
    inputs,
    buttons,
    description,
    bottomHelper,
    children,
    spacing = true,
    sx,
    ...props
}: InputFormProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: `calc(100vh - ${globalStyleVars.navBarHeight}px)`,
                backgroundColor: globalStyleVars.formPageBackgroundColor,
                width: '100vw',
                padding: '140px 0',
                [theme.breakpoints.down('sm')]: {
                    padding: 0,
                },
            }}
        >
            <Stack
                sx={{
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.25)',
                    borderRadius: '8px',
                    padding: '48px',
                    textAlign: 'center',
                    width: '500px',
                    margin: '0 auto',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    ...sx,
                    [theme.breakpoints.down('sm')]: {
                        width: '100vw',
                        margin: 0,
                        boxShadow: 'none',
                        backgroundColor:
                            globalStyleVars.formPageBackgroundColor,
                    },
                }}
                {...props}
            >
                <Typography
                    variant="h3"
                    sx={{
                        marginBottom: '60px',
                    }}
                >
                    {title}
                </Typography>

                {description && (
                    <Alert
                        severity="info"
                        sx={{
                            marginBottom: '60px',
                            textAlign: 'start',
                            width: '100%',
                        }}
                    >
                        <AlertTitle>Note</AlertTitle>
                        {description}
                    </Alert>
                )}

                <Stack
                    spacing="45px"
                    sx={{
                        marginBottom: spacing ? '60px' : 0,
                        width: '100%',
                    }}
                >
                    {inputs.map((input: JSX.Element, index: number) => {
                        return <Box key={index}>{input}</Box>;
                    })}
                </Stack>

                {children || null}

                {buttons.map((props: RoundedButtonProps, index: number) => {
                    return (
                        <RoundedButton
                            key={index}
                            sx={{
                                width: '100%',
                                marginTop:
                                    index == 0 && spacing ? '60px' : '32px',
                                height: '55px',
                            }}
                            {...props}
                        />
                    );
                })}

                {bottomHelper || null}
            </Stack>
        </Box>
    );
}

export default InputForm;
