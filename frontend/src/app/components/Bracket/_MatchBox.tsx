import {
    SVGViewer,
    SingleEliminationBracket,
    createTheme,
} from '@g-loot/react-tournament-brackets';
import {
    Match as MatchType,
    Participant,
} from '@g-loot/react-tournament-brackets/dist/src/types';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { globalStyleVars } from 'src/app/app';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { GameStatus } from 'src/app/types/enums';
import { Team } from 'src/app/types/team.types';

interface IMatchBoxProps {
    matches: MatchType[];
    teams: Team[] | null | undefined;
    handleClickMatch: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        gameId?: string
    ) => void;
    setAnchorStyle: React.Dispatch<
        React.SetStateAction<{
            left: number;
            top: number;
            width: number;
            height: number;
        }>
    >;
    setClickedTeam: React.Dispatch<
        React.SetStateAction<Team | null | undefined>
    >;
    setPopupOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

const bracketTheme = createTheme({
    fontFamily: '"Roboto", "Arial", "Helvetica", "sans-serif"',
    transitionTimingFunction: 'cubic-bezier(0, 0.92, 0.77, 0.99)',
    disabledColor: '#5D6371',
    matchBackground: {
        wonColor: globalStyleVars.mustardColor,
        lostColor: 'white',
    },
    border: { color: '#9E9E9E', highlightedColor: '#707582' },
    textColor: {
        highlighted: 'black',
        main: 'black',
        dark: 'black',
        disabled: '#5D6371',
    },
    score: {
        text: {
            highlightedWonColor: '#118ADE',
            highlightedLostColor: '#FF9505',
        },
        background: {
            wonColor: globalStyleVars.mustardColor,
            lostColor: 'white',
        },
    },
    canvasBackground: '#0b0d14',
});

const MatchBox = ({
    matches,
    teams,
    handleClickMatch,
    setAnchorStyle,
    setClickedTeam,
    setPopupOpened,
}: IMatchBoxProps) => {
    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const showNotification = useOpenNotification();

    const handleClickTeam = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        teamName?: string
    ) => {
        event.stopPropagation();

        if (teamName) {
            const target = event.target as HTMLDivElement;
            const { left, top, height, width } = target.getBoundingClientRect();
            const { scrollX, scrollY } = window;

            // have to set the position and size of the invisible "Box" div here,
            // because @g-loot/react-tournament-brackets displays Match components
            // inside of a svg, and so react MUI's "Popover" component thinks it is
            // not located in the DOM (it isn't) and errors out in the console. instead,
            // we can move a temporary div to the Match component's position, size it
            // the same, and have it act as the Popover's anchor element
            setAnchorStyle({
                left: left + scrollX,
                top: top + scrollY,
                width,
                height,
            });

            setClickedTeam(teams?.find((team) => team.name === teamName));
            setPopupOpened(true);
        }
    };

    return (
        <SingleEliminationBracket
            matches={matches}
            matchComponent={({
                match,
                onMatchClick,
                onPartyClick,
                onMouseEnter,
                onMouseLeave,
                topParty,
                bottomParty,
                topWon,
                bottomWon,
                topHovered,
                bottomHovered,
                topText,
                bottomText,
                connectorColor,
                computedStyles,
                teamNameFallback,
                resultFallback,
            }) => {
                const displayTeamBox = (party: Participant) => (
                    <Box
                        onClick={(
                            event: React.MouseEvent<HTMLDivElement, MouseEvent>
                        ) => {
                            handleClickTeam(event, party.name);
                        }}
                        sx={{
                            display: 'flex',
                            backgroundColor: party.isWinner
                                ? globalStyleVars.mustardColor
                                : 'white',
                            width: '350px',
                            height: '72px',
                            borderRadius: '8px',
                            alignItems: 'center',
                            padding: '24px',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing="16px"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '40px',
                                    width: '40px',
                                }}
                            >
                                <img
                                    src={(() => {
                                        if (party.isWinner) {
                                            return '/crown.png';
                                        } else if (
                                            match.state === 'IN_PROGRESS'
                                        ) {
                                            return '/sword_in_progress.png';
                                        } else if (
                                            match.state === 'UNSTARTED'
                                        ) {
                                            return '/clock_unstarted.png';
                                        }

                                        return match.state === 'DRAW'
                                            ? '/draw.png'
                                            : '/empty.png';
                                    })()}
                                    alt="Game Status Logo"
                                    height="40px"
                                    width="40px"
                                    style={{
                                        borderRadius: '6px',
                                    }}
                                />
                            </Box>
                            <Typography variant="card">
                                {party.name || teamNameFallback}
                            </Typography>
                        </Stack>
                        <Typography>
                            {party.resultText ?? resultFallback(party)}
                        </Typography>
                    </Box>
                );

                return (
                    <Stack
                        direction="row"
                        onClick={(event) => {
                            if (match.state === GameStatus.IN_PROGRESS) {
                                handleClickMatch(event, match.id as string);
                            } else if (match.state === GameStatus.UNSTARTED) {
                                showNotification('Cannot edit. Game has not started yet', 'warning');
                            } else {
                                showNotification('Cannot edit. Game has already ended', 'warning');
                            }
                            
                        }
                            
                        }
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            height: '100%',
                            border: '1px solid #dedede',
                            borderRadius: '8px',
                            padding: '16px',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src="/swords.jpg"
                            alt="Swords"
                            height="32px"
                            width="auto"
                            style={{
                                marginLeft: '16px',
                            }}
                        />
                        <Stack spacing="8px">
                            {displayTeamBox(topParty)}
                            {displayTeamBox(bottomParty)}
                        </Stack>
                    </Stack>
                );
            }}
            theme={bracketTheme}
            options={{
                style: {
                    canvasPadding: 100,
                    roundHeader: {
                        backgroundColor: 'white',
                        fontColor: 'black',
                        fontSize: 24,
                        roundTextGenerator: (current, total) => {
                            return `Round ${current}`;
                        },
                    },
                    connectorColor: 'black',
                    boxHeight: 180,
                    connectorColorHighlight: 'black',
                    lineInfo: {
                        homeVisitorSpread: 0,
                    },
                    spaceBetweenColumns: 90,
                    roundSeparatorWidth: 100,
                    spaceBetweenRows: 16,
                    width: 470,
                },
            }}
            svgWrapper={({ children, ...props }) => (
                <SVGViewer
                    width={isMediumScreen ? 600 : isSmallScreen ? 300 : 1200}
                    height={800}
                    {...props}
                >
                    {children}
                </SVGViewer>
            )}
        />
    );
};

export default MatchBox;
