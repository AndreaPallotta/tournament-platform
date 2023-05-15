import { Box, Stack, Typography, useTheme } from '@mui/material';
import ImageHeader from 'src/app/components/ImageHeader';

const gameRules = [
    `Registration for this tournament is limited to countries in which participation is legal.
    If there is a difference of opinion in interpretation of the law, Aardvark Games' legal counsel will have the final word on a Team's ability to register.`,
    `Each Team will have at least two, but no more than five, members.`,
    `The deadline for registration is midnight EDT on Monday, May 1, 2023, unless an extension for all is publicized on the tournament website.`,
    `Registration must be completed on the tournament website.`,
    `Each Team member must be currently enrolled at the college/university that the Team wishes to represent.
    A Team member may not play for more than one college in the 2023 tournament.
    Eligibility will be verified in advance with the college and team members will be required to present valid student IDs on the day of the on-site tournament.
    Any questions regarding IDs on the day of the tournament will be decided by the on-site Moderator representing the college.`,
    `Any Team that fails to appear in person and on time on the day of the on-campus tournament round forfeits that game.`,
    `The dates of tournament game play and all Team match ups will be selected by Aardvark Games.
    If an odd number of teams register for any site, the first team to complete registration will be awarded a bye in the first round of competition.`,
    `Game play and scoring will take place according to the printed rules shipped with the game.`,
    `Tournament play will be run consistently at each location to ensure that all players are treated equally.
    Both players and moderators are expected to cooperate to run an orderly competition.
    Players and moderators must treat each other in a fair and respectful manner, following both the rules and the spirit in which those rules were created.`,
    `Aardvark Games reserves the right to alter these rules, as well as the right to interpret, modify, clarify, or otherwise issue official changes to these rules without prior notice.`,
];

/**
 * UI component for the tournament rules listing page.
 */
export default function TournamentRulesPage() {
    const theme = useTheme();

    return (
        <Stack
            sx={{
                marginBottom: '80px',
            }}
        >
            <ImageHeader
                text="Tournament Rules"
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
                <Typography variant="bold-title">Tournament Rules</Typography>
            </Box>
            <Stack
                spacing="30px"
                sx={{
                    padding: '0 200px',
                    [theme.breakpoints.down('lg')]: {
                        padding: '100px',
                    },
                    [theme.breakpoints.down('sm')]: {
                        padding: '64px',
                    },
                }}
            >
                {gameRules.map((rule, index) => {
                    return (
                        <Stack
                            direction="row"
                            spacing="48px"
                            key={index}
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="lora">{index + 1}</Typography>
                            <Typography>{rule}</Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );
}
