import { Box, Stack, Typography, useTheme } from '@mui/material';
import ImageHeader from 'src/app/components/ImageHeader';
import PageAboutSection from 'src/app/components/PageAboutSection';

/**
 * UI component for Aardvark Games company info page.
 */
export default function AardvarkGamesPage() {
    const theme = useTheme();

    return (
        <Stack
            sx={{
                marginBottom: '80px',
            }}
        >
            <ImageHeader
                text="Aardvark Games"
                imagePath="/box_cover_1200_cropped.jpg"
            />
            <PageAboutSection
                isEditing={false}
                imageComponent={
                    <img
                        src="/aardvark_desk.jpg"
                        alt="College Placeholder"
                        height="auto"
                        width="100%"
                        style={{
                            borderRadius: '8px',
                        }}
                    />
                }
                bio={
                    <Stack spacing="16px">
                        <Typography>
                            Aardvark Games is a tabletop game publisher
                            dedicated to entertaining game players worldwide
                            with products designed to engage and challenge. Our
                            best known games include Meeple City, Beyond the
                            Galaxy, Continental Conquest, Between the Seas and
                            now, A New World.
                        </Typography>
                        <Typography>
                            Whether you are new to gaming, an experienced game
                            player, a member of a gaming group or someone who
                            prefers to play solo, we seek to make games that
                            will delight and keep you coming back for more!
                        </Typography>
                    </Stack>
                }
            />
        </Stack>
    );
}
