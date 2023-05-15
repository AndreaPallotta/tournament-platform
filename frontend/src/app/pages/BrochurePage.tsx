import { Avatar, Box, Stack, Typography, useTheme } from '@mui/material';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useNavigate } from 'react-router-dom';
import { globalStyleVars } from '../app';
import ImageHeader from '../components/ImageHeader';
import RoundedButton from '../components/RoundedButton';

interface School {
    name: string;
    logo: string;
    height?: string | undefined;
}

const schools: School[] = [
    {
        name: 'Cornell University',
        logo: '/cornell_logo.svg',
        height: '210px',
    },
    {
        name: 'University College of Dublin',
        logo: '/UC_Dublin_logo.jpg',
    },
    {
        name: 'Indian Institute of Technology Delhi',
        logo: '/IIT_Delhi_Logo.jpg',
    },
    {
        name: 'Kyoto University',
        logo: '/Kyoto_University_logo.png',
    },
    {
        name: 'Pontificia Universidad Catolica de Chile',
        logo: '/Pontificia_UCC_logo.jpg',
    },
    {
        name: 'Rochester Institute of Technology',
        logo: '/RIT_seal.jpg',
    },
];

/**
 * UI component for the product brochure page.
 */
export default function BrochurePage() {
    /*
        To-do:
            - link buttons to pages
            - add starburst for registration deadline
            - insert colleges programmatically
    */

    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Stack>
            <ImageHeader
                text="Aardvark Tournament"
                imagePath="/game_board_desert_planet.jpg"
                sx={{
                    position: 'relative',
                }}
            >
                <Avatar
                    src="/green_registration_deadline_burst.png"
                    alt="Registration Deadline May 1st"
                    sx={{
                        width: '320px',
                        height: 'auto',
                        position: 'absolute',
                        bottom: '-160px',
                        right: '60px',
                        [theme.breakpoints.down('sm')]: {
                            width: '160px',
                            bottom: '-80px',
                        },
                    }}
                />
            </ImageHeader>
            <Box
                sx={{
                    height: '200px',
                }}
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
                    Introducing Aardvark's newest board game, A New World, with
                    a global collegiate competition! Can your University's team
                    bring home the prize?
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    padding: '0 64px 40px 64px',
                    textAlign: 'center',
                    [theme.breakpoints.down('xl')]: {
                        height: 'fit-content',
                    },
                }}
            >
                <Typography>
                    Gather a team and sign up to play, first for the honor of
                    being your University's championship team and then for the
                    chance to represent your school in continued rounds of
                    global competition.
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
                <img
                    src="/game_board_desert_planet_w_pieces.jpg"
                    alt="Game Board Desert Planet With Game Pieces on Top"
                    width="600px"
                    height="auto"
                    style={{
                        borderRadius: '8px',
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
                    <Box>
                        <RoundedButton
                            text="Learn More"
                            backgroundColor={globalStyleVars.blue}
                            borderColor={globalStyleVars.blue}
                            color="white"
                            sx={{
                                marginTop: '16px',
                            }}
                            onClick={() => {
                                navigate('/about');
                            }}
                        />
                    </Box>
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
                <Typography variant="bold-title">
                    Join us for some great gaming fun! Join us for some awesome
                    tournament prizes!
                </Typography>
            </Box>
            <Stack
                direction="row"
                sx={{
                    padding: '64px',
                    [theme.breakpoints.down('sm')]: {
                        flexDirection: 'column',
                    },
                }}
            >
                <Typography>
                    All players who complete at least one round of tournament
                    play will receive a complimentary copy of A New World.
                </Typography>
                <Typography
                    sx={{
                        marginLeft: '55px',
                        [theme.breakpoints.down('sm')]: {
                            marginLeft: 0,
                            marginTop: '55px',
                        },
                    }}
                >
                    Each university's final round teams will go home with some
                    awesome Aardvark Games swag.
                </Typography>
                <Typography
                    sx={{
                        marginLeft: '55px',
                        [theme.breakpoints.down('sm')]: {
                            marginLeft: 0,
                            marginTop: '55px',
                        },
                    }}
                >
                    The First Place team for each university will receive a cash
                    prize of $1,000 and each individual team member will get a
                    $100 gift certificate for the Aardvark Games online store.
                </Typography>
            </Stack>
            <Stack padding="64px" spacing="40px">
                <Typography variant="bold-title">Who's Playing?</Typography>
                <Grid2
                    container
                    columnSpacing="55px"
                    rowSpacing="40px"
                    sx={{
                        justifyContent: 'center',
                    }}
                >
                    {schools.map((school: School) => {
                        return (
                            <Grid2 sm={12} md={6} xl={4} key={school.name}>
                                <Stack
                                    spacing="24px"
                                    sx={{
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src={school.logo}
                                        alt={`${school.name} School Logo`}
                                        width="210px"
                                        height={school.height ?? 'auto'}
                                    />
                                    <Typography variant="bold-small">
                                        {school.name}
                                    </Typography>
                                </Stack>
                            </Grid2>
                        );
                    })}
                </Grid2>
            </Stack>
            <Stack padding="0 64px 64px 64px" spacing="40px">
                <Typography variant="bold-title">
                    A Closer Look at <i>A New World</i>
                </Typography>
                <Stack
                    direction={{ sm: 'column', md: 'row' }}
                    spacing="25px"
                    sx={{
                        justifyContent: 'space-between',
                        [theme.breakpoints.down('lg')]: {
                            alignItems: 'center',
                        },
                    }}
                >
                    <Avatar
                        src="/game_board_islands_w_pieces.jpg"
                        alt="Game Board Island With Game Pieces on Top"
                        sx={{
                            width: '860px',
                            height: '525px',
                            [theme.breakpoints.down('xl')]: {
                                width: '430px',
                                height: '262.5',
                                flexDirection: 'column',
                            },
                            [theme.breakpoints.down('lg')]: {
                                width: '420px',
                                height: '250px',
                            },
                            [theme.breakpoints.down('sm')]: {
                                width: '210px',
                                height: '125px',
                                marginBottom: '25px',
                            },
                        }}
                    />
                    <Stack spacing="25px">
                        <Avatar
                            src="/game_board_jungle_w_pieces.jpg"
                            alt="Game Board Jungle With Pieces on Top"
                            sx={{
                                width: '420px',
                                height: '250px',
                                [theme.breakpoints.down('lg')]: {
                                    width: '210px',
                                    height: '125px',
                                },
                            }}
                        />
                        <Avatar
                            src="/game_board_undersea.jpg"
                            alt="Game Board Under the Sea"
                            sx={{
                                width: '420px',
                                height: '250px',
                                [theme.breakpoints.down('lg')]: {
                                    width: '210px',
                                    height: '125px',
                                },
                            }}
                        />
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
}
