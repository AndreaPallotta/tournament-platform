import { Box, Stack, Typography, useTheme } from '@mui/material';
import { globalStyleVars } from '../app';
import RoundedButton from './RoundedButton';

interface IPageBannerProps {
    title: string;
    canEdit: boolean;
    isEditing: boolean;
    extraText?: string;
    extraEditingText?: string;
    setIsEditing?: (value: boolean) => void;
    titleField?: JSX.Element;
    saveDisabled?: boolean;
    handleSave?: () => Promise<void>;
}

function PageBanner({
    title,
    canEdit,
    isEditing,
    extraText,
    extraEditingText,
    setIsEditing,
    titleField,
    saveDisabled,
    handleSave,
}: IPageBannerProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: '420px',
                backgroundColor: globalStyleVars.mustardColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px',
                position: 'relative',
            }}
        >
            <Stack spacing="30px">
                {(!isEditing && (
                    <>
                        <Typography
                            variant="bold-title"
                            sx={{
                                [theme.breakpoints.down('md')]: {
                                    fontSize: '20px',
                                },
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography>{extraText ?? ''}</Typography>
                    </>
                )) || (
                    <>
                        {titleField}
                        {extraEditingText && (
                            <Typography>{extraEditingText}</Typography>
                        )}
                    </>
                )}
            </Stack>

            {setIsEditing && (
                <Stack
                    spacing="8px"
                    direction="row"
                    sx={{
                        position: 'absolute',
                        right: '30px',
                        top: '30px',
                        [theme.breakpoints.down('lg')]: {
                            right: 'initial',
                            top: 'initial',
                            bottom: '30px',
                        },
                    }}
                >
                    {canEdit && (
                        <>
                            {(!isEditing && (
                                <RoundedButton
                                    text="Edit"
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                />
                            )) || (
                                <>
                                    <RoundedButton
                                        text="Save"
                                        type="submit"
                                        disabled={saveDisabled}
                                        onClick={handleSave}
                                    />
                                    <RoundedButton
                                        text="Cancel"
                                        sx={{
                                            border: `1px solid ${globalStyleVars.mustardColor}`,
                                            backgroundColor:
                                                globalStyleVars.mustardColor,
                                            boxShadow: 0,
                                            ':hover': {
                                                backgroundColor:
                                                    globalStyleVars.mustardColor,
                                            },
                                        }}
                                        onClick={() => {
                                            setIsEditing(false);
                                        }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </Stack>
            )}
        </Box>
    );
}

export default PageBanner;
