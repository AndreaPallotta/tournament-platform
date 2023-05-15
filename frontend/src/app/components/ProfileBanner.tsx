import { Edit } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import Base64Image from './Base64Image';
import RoundedButton from './RoundedButton';
import { User } from '../types/user.types';

interface Props {
    bgColor: string;
    canEdit: boolean;
    setEdit: (value: boolean) => void;
    image: string | undefined;
    profile: User | undefined;
}

const ProfileBanner = ({
    bgColor,
    canEdit,
    setEdit,
    image,
    profile,
}: Props) => {
    const theme = useTheme();

    const renderImage = () => {
        if (image) {
            return (
                <Base64Image
                    src={image}
                    alt="Profile"
                    height="auto"
                    width="250px"
                    style={{
                        border: '8px solid white',
                        borderRadius: '6px',
                    }}
                />
            );
        }

        return (
            <img
                src="/placeholder.jpeg"
                alt="Placeholder"
                height="auto"
                width="250px"
                style={{
                    border: '8px solid white',
                    borderRadius: '6px',
                }}
            />
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: bgColor,
                height: '17rem',
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexDirection: 'column',
                padding: '7rem 1rem 0',
                position: 'relative',
            }}
        >
            {canEdit && (
                <RoundedButton
                    text="Edit"
                    startIcon={<Edit />}
                    onClick={() => {
                        setEdit(true);
                    }}
                    sx={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                    }}
                />
            )}

            <Grid container>
                <Grid item xs={12} sm={6}>
                    <Box
                        sx={{
                            width: 'auto',
                            position: 'absolute',
                            top: '50%',
                            left: '245px',
                            [theme.breakpoints.down('lg')]: {
                                left: '50%',
                                transform: 'translateX(-50%)',
                            },
                        }}
                    >
                        {renderImage()}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfileBanner;
