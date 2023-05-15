import { Close, Folder } from '@mui/icons-material';
import { Box, SxProps, useTheme } from '@mui/material';
import React from 'react';
import CircleButton from './CircleButton';

interface UploadBoxProps {
    inputId: string;
    accept: string;
    handler?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    showUploadButton?: boolean;
    children?: React.ReactNode;
    sx?: SxProps;
}

const dashedOutline = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23B8B0FFFF' stroke-width='2' stroke-dasharray='20' stroke-dashoffset='26' stroke-linecap='round'/%3e%3c/svg%3e")`;

/**
 * Displays an outlined box for uploading files into.
 *
 * @param {UploadBoxProps} {
 *     inputId,
 *     accept,
 *     handler,
 *     showUploadButton = true,
 *     children,
 *     sx,
 * }
 * @return {*}
 */
function UploadBox({
    inputId,
    accept,
    handler,
    showUploadButton = true,
    children,
    sx,
}: UploadBoxProps) {
    const [isImageUploaded, setIsImageUploaded] = React.useState(false);

    const theme = useTheme();

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsImageUploaded(true);
        if (handler) {
            handler(event);
        }
    };

    const handleRemove = async () => {
        setIsImageUploaded(false);
        if (handler) {
            const event = new Event(
                'change'
            ) as unknown as React.ChangeEvent<HTMLInputElement>;
            Object.defineProperty(event, 'target', {
                value: {
                    files: [],
                },
                writable: false,
            });
            handler(event);
        }
    };

    return (
        <Box
            sx={{
                ...sx,
                padding: '10px',
                backgroundImage: showUploadButton ? dashedOutline : 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                }}
            >
                {children}

                {showUploadButton && (
                    <Box
                        onClick={() =>
                            document.getElementById(inputId)?.click()
                        }
                        sx={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            cursor: 'pointer',
                            transition: 'background-color, opacity 0.3s',
                            borderRadius: '8px',
                            top: 0,
                            opacity: 0,
                            ':hover': {
                                backgroundColor: '#c2c2c2',
                                opacity: 0.85,
                            },
                        }}
                    >
                        <Folder
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                width: '100%',
                                fontSize: '5rem',
                            }}
                        />
                    </Box>
                )}

                {isImageUploaded && (
                    <CircleButton
                        icon={<Close />}
                        onClick={handleRemove}
                        sx={{
                            position: 'absolute',
                            top: `calc((${theme.spacing(1)} + ${
                                theme.typography.fontSize
                            }px) * -1)`,
                            right: `calc((${theme.spacing(1)} + ${
                                theme.typography.fontSize
                            }px) * -1)`,
                            boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.25)',
                        }}
                    />
                )}

                <input
                    id={inputId}
                    type="file"
                    accept={accept}
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                />
            </Box>
        </Box>
    );
}

export default UploadBox;
