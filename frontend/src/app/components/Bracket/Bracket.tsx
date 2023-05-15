import { MATCH_STATES } from '@g-loot/react-tournament-brackets';
import { Match as MatchType } from '@g-loot/react-tournament-brackets/dist/src/types';
import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get } from 'src/app/services/api.service';
import { Game } from 'src/app/types/game.types';
import { Team } from '../../types/team.types';
import Popup from '../Popup';
import BracketTeamInfo from './_BracketTeamInfo';
import MatchBox from './_MatchBox';
import MatchInfoModal from './_MatchInfoModal';

interface IBracketProps {
    tournamentId?: string;
    collegeId?: string;
}

const Bracket = ({ tournamentId, collegeId }: IBracketProps) => {
    const openNotification = useOpenNotification();

    const anchorDiv = useRef<HTMLDivElement | null>(null);

    const [matches, setMatches] = useState<MatchType[]>([]);
    const [teams, setTeams] = useState<Team[] | null | undefined>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [matchInfoOpened, setMatchInfoOpened] = useState(false);
    const [clickedMatch, setClickedMatch] = useState<MatchType | null>();

    const [clickedTeam, setClickedTeam] = useState<Team | null | undefined>(
        null
    );

    const [popupOpened, setPopupOpened] = useState(false);

    const [anchorStyle, setAnchorStyle] = useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    });

    const getGameInfo = useCallback(async () => {
        const { err, res } = await get('/api/game/bracketing', {
            tournamentId,
            collegeId,
        });

        if (err || !res) {
            openNotification(
                err ?? 'Error retrieving bracketing information',
                'error'
            );
        }

        setTeams(res?.teams);
        setMatches(res?.matches);
        setGames(res?.games);
    }, []);

    const handleHideTeam = () => {
        setPopupOpened(false);

        // using timeout here because if you don't, there is a
        // brief moment in time that you can see the contents of
        // the Popup component disappear out of the DOM. will look
        // awkward to users, so using a timeout to stop this
        setTimeout(() => {
            setClickedTeam(null);
        }, 300);
    };

    const handleClickMatch = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        gameId?: string
    ) => {
        setMatchInfoOpened(true);
        setClickedMatch(matches?.find((match) => match.id === gameId));
    };

    const handleHideMatch = () => {
        setMatchInfoOpened(false);

        setTimeout(() => {
            setIsEditing(false);
            setClickedMatch(null);
        }, 300);
    };

    useEffect(() => {
        getGameInfo().then(() => {
            setIsEditing(false);
        });
    }, []);

    return (
        <Box
            id="bracket"
            sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                'g[transform] rect': {
                    fill: '#faf7f7',
                },
            }}
        >
            {/* This box will move positions, depending on which team's info is being viewed. It's invisible and
            does not effect layout. It acts as the anchor for the "Popup" component below.*/}
            <Box
                id="helloworld"
                ref={anchorDiv}
                sx={{
                    visibility: 'hidden',
                    position: 'absolute',
                    left: `${anchorStyle.left}px`,
                    top: `${anchorStyle.top}px`,
                    width: `${anchorStyle.width}px`,
                    height: `${anchorStyle.height}px`,
                    pointerEvents: 'none',
                }}
            ></Box>

            {(matches?.length && (
                <>
                    <Popup
                        open={popupOpened}
                        anchorEl={anchorDiv.current}
                        onClose={handleHideTeam}
                        interactable
                    >
                        <BracketTeamInfo team={clickedTeam as Team} />
                    </Popup>

                    <MatchInfoModal
                        clickedMatch={clickedMatch}
                        games={games}
                        handleHideMatch={handleHideMatch}
                        isEditing={isEditing}
                        matchInfoOpened={matchInfoOpened}
                        setClickedMatch={setClickedMatch}
                        setGames={setGames}
                        setIsEditing={setIsEditing}
                        setMatches={setMatches}
                        teams={teams}
                    />

                    <MatchBox
                        matches={matches}
                        teams={teams}
                        handleClickMatch={handleClickMatch}
                        setAnchorStyle={setAnchorStyle}
                        setClickedTeam={setClickedTeam}
                        setPopupOpened={setPopupOpened}
                    />
                </>
            )) ||
                null}
        </Box>
    );
};

export default Bracket;
