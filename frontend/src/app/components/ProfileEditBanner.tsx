import { Box, Grid, Stack, Typography } from '@mui/material';
import RoundedButton, { RoundedButtonText } from './RoundedButton';

interface Props {
    bgColor: string;
    handleOnSave: () => void;
    handleOnCancel: () => void;
    disabled: boolean;
}

const ProfileEditBanner = ({
    bgColor,
    handleOnSave,
    handleOnCancel,
    disabled,
}: Props) => {
    return (
        <Box
            sx={{
                backgroundColor: bgColor,
                height: '17rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            <Stack
                direction="row"
                position="absolute"
                top="2rem"
                right="2rem"
                spacing={1}
            >
                <RoundedButton
                    text="Save"
                    onClick={handleOnSave}
                    disabled={disabled}
                />
                <RoundedButtonText
                    text="Cancel"
                    onClick={handleOnCancel}
                    variant="text"
                />
            </Stack>

            <Grid container justifyContent="center" alignItems="center">
                <Stack spacing={2}>
                    <Typography variant="h3">Edit Profile</Typography>
                    <Typography variant="body1">
                        People visiting your profile will see the following
                        information
                    </Typography>
                </Stack>
            </Grid>
        </Box>
    );
};

export default ProfileEditBanner;
