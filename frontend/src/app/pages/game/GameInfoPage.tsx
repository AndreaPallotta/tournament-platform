import { Avatar, Box, Stack, Typography, useTheme } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import ImageHeader from 'src/app/components/ImageHeader';

interface GameRole {
    title: string;
    description: string;
}

const styles = {
    rolesSectionBackgroundColor: '#F4F4F4',
};

const gameRoles: GameRole[] = [
    {
        title: 'Expedition Leader',
        description:
            'This team member will make decisions on when and how action cards are played. They facilitate the team’s joint strategic planning and manage the expedition budget.',
    },
    {
        title: 'Resource Specialist',
        description:
            'This team member is responsible for obtaining the resources required for survival on arrival and the establishment of a base on the new world.',
    },
    {
        title: 'Scientist',
        description:
            'This team member collects knowledge cards that allow the team an advantage in knowing how to overcome obstacles and which actions are most likely to succeed.',
    },
    {
        title: 'Technician',
        description:
            'This team member uses tool and technology cards to create the team base and repair machines and weapons as needed.',
    },
    {
        title: 'Weapons Specialist',
        description:
            'This team member leads the team defense strategies and works to gain points to raise each team member’s skill level on the weapon classes best suited to the current habitat.',
    },
];

/**
 * UI component for the game information page.
 */
export default function GameInfoPage() {
    const theme = useTheme();

    return (
        <Stack>
            <ImageHeader
                text="A New World"
                imagePath="/box_cover_1200_cropped.jpg"
            />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    padding: '64px',
                    textAlign: 'center',
                    [theme.breakpoints.down('xl')]: {
                        height: 'fit-content',
                    },
                }}
            >
                <Typography variant="bold-title">
                    Aardvark Games announced our newest board game adventure,{' '}
                    <i>A New World</i>.
                </Typography>
            </Box>
            <Stack
                direction="row"
                sx={{
                    padding: '0 64px',
                    alignItems: 'center',
                    [theme.breakpoints.down('lg')]: {
                        flexDirection: 'column',
                    },
                }}
            >
                <Avatar
                    src="/game_board_islands_w_pieces.jpg"
                    alt="Game Board Island With Game Pieces on Top"
                    sx={{
                        borderRadius: '8px',
                        width: '600px',
                        height: 'auto',
                    }}
                />
                <Stack
                    spacing="16px"
                    sx={{
                        marginLeft: '80px',
                        [theme.breakpoints.down('lg')]: {
                            marginLeft: 0,
                            marginTop: '80px',
                        },
                    }}
                >
                    <Typography variant="bold">A New World</Typography>
                    <Typography>
                        A New World requires a team of 2-5 players who will work
                        together to score as many points as possible after being
                        dropped into a new, unpopulated world. For the
                        tournament, teams will play in a head-to-head
                        competition with an opponent seeking to survive in its
                        own New World, but competing with your team for the same
                        resources.
                    </Typography>
                    <Typography>
                        Environments could be a desert planet, an underwater
                        location, a water world with scattered islands, an ice
                        covered mountain range, or a jungle full of predatory
                        animals and dangerous plant life. (Advance News!
                        Expansion Pack 1 is in the design phase with additional
                        worlds and resources!)
                    </Typography>
                    <Typography>
                        The game is best played in a head-to-head competition
                        with a second team seeking to survive in its own New
                        World, but competing for the same resources. However,
                        with the modifications described for solo team play, it
                        is possible to enjoy striving to beat your own prior
                        scores.
                    </Typography>
                </Stack>
            </Stack>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    padding: '64px',
                    textAlign: 'center',
                    [theme.breakpoints.down('xl')]: {
                        height: 'fit-content',
                    },
                }}
            >
                <Typography variant="bold">
                    This game is appropriate for ages 13 and over. Play time
                    runs 60-90 minutes.
                </Typography>
            </Box>
            <Stack
                spacing="80px"
                sx={{
                    backgroundColor: styles.rolesSectionBackgroundColor,
                    padding: '80px 64px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'end',
                        height: 'fit-content',
                        textAlign: 'center',
                    }}
                >
                    <Stack spacing="16px">
                        <Typography variant="bold-title">Roles</Typography>
                        <Typography
                            sx={{
                                width: '45vw',
                                [theme.breakpoints.down('lg')]: {
                                    width: '100%',
                                },
                            }}
                        >
                            Every team must designate the roles for each player
                            prior to beginning play. If a team has fewer than
                            five players, team members may assume more than one
                            role.
                        </Typography>
                    </Stack>
                </Box>
                <Grid2
                    container
                    columnSpacing="55px"
                    rowSpacing="40px"
                    sx={{
                        justifyContent: 'center',
                    }}
                >
                    {gameRoles.map((role: GameRole) => {
                        return (
                            <Grid2 xs={12} sm={6} md={4} key={role.title}>
                                <Stack spacing="8px">
                                    <Typography fontWeight="bold">
                                        {role.title}
                                    </Typography>
                                    <Typography>{role.description}</Typography>
                                </Stack>
                            </Grid2>
                        );
                    })}
                </Grid2>
            </Stack>
        </Stack>
    );
}
