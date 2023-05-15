import { Box, Stack, Typography, useTheme } from '@mui/material';
import UploadBox from './UploadBox';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

interface IPageAboutSectionProps {
    isEditing: boolean;
    imageComponent: EmotionJSX.Element;
    setPictureHandler?: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => Promise<void>;
    bio?: string | JSX.Element;
    aboutField?: JSX.Element;
}

function PageAboutSection({
    isEditing,
    imageComponent,
    setPictureHandler,
    bio,
    aboutField,
}: IPageAboutSectionProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                padding: '100px 150px 200px 150px',
                [theme.breakpoints.down('md')]: {
                    padding: '100px 100px 200px 100px',
                },
                [theme.breakpoints.down('sm')]: {
                    padding: '100px 50px 200px 50px',
                },
            }}
        >
            <Stack
                direction="row"
                spacing={{ lg: '64px' }}
                sx={{
                    alignItems: 'center',
                    [theme.breakpoints.down('lg')]: {
                        flexDirection: 'column',
                    },
                }}
            >
                <UploadBox
                    showUploadButton={isEditing}
                    inputId="upload-college-picture"
                    accept="image/*"
                    handler={setPictureHandler}
                    sx={{
                        width: '500px',
                        flexShrink: 0,
                        [theme.breakpoints.down('lg')]: {
                            width: '100%',
                            marginBottom: '30px',
                        },
                    }}
                >
                    {imageComponent}
                </UploadBox>

                <Stack
                    sx={{
                        flexGrow: 1,
                        [theme.breakpoints.down('lg')]: {
                            width: '100%',
                            marginLeft: '0',
                        },
                        [theme.breakpoints.down('sm')]: {
                            width: '100%',
                            alignItems: 'center',
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            marginBottom: `16px`,
                            [theme.breakpoints.down('lg')]: {
                                textAlign: 'center',
                            },
                        }}
                    >
                        About
                    </Typography>

                    {(!isEditing && (
                        <Box
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                [theme.breakpoints.down('lg')]: {
                                    textAlign: 'center',
                                },
                            }}
                        >
                            {bio || 'N/A'}
                        </Box>
                    )) || <>{aboutField}</>}
                </Stack>
            </Stack>
        </Box>
    );
}

export default PageAboutSection;
