import { Box, SxProps, Typography, useTheme } from '@mui/material';

interface ImageHeaderProps {
    text: string;
    imagePath: string;
    children?: React.ReactNode;
    sx?: SxProps;
    [key: string]: any;
}

/**
 * Image header, mostly for info pages. See hi-fi wireframes:
 * (https://www.figma.com/file/TfQA6rfaAA8vpnCGHXAC0b/senior-dev?node-id=529-979&t=XBBmUIz9kMLosiiT-0)
 *
 * @param {ModalProps} {
 *     text,
 *     imagePath,
 *     children,
 *     sx,
 *     ...props
 * }
 * @return {*}
 */
function ImageHeader({
    text,
    imagePath,
    children,
    sx,
    ...props
}: ImageHeaderProps) {
    const theme = useTheme();

    return (
        <Box position="relative">
            <Box
                sx={{
                    background: `url(${imagePath}) no-repeat center`,
                    height: '580px',
                    position: 'relative',
                    [theme.breakpoints.up('lg')]: {
                        backgroundSize: '100% 100%',
                        filter: 'blur(8px)',
                    },
                    [theme.breakpoints.down('sm')]: {
                        height: '300px',
                    },
                    ...sx,
                }}
                {...props}
            />
            <Typography
                variant="h1"
                color="white"
                fontWeight="bold"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                    [theme.breakpoints.down('lg')]: {
                        fontSize: '4rem',
                    },
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '2rem',
                    },
                }}
            >
                {text}
            </Typography>
            {children}
        </Box>
    );
}

export default ImageHeader;
