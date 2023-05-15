import { Match, Match as MatchType } from '@g-loot/react-tournament-brackets/dist/src/types';
import {
    Box,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { globalStyleVars } from 'src/app/app';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { post } from 'src/app/services/api.service';
import { Game } from 'src/app/types/game.types';
import { Team } from 'src/app/types/team.types';
import {
    gameScoreValidation,
    isFormInvalid,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';
import Modal from '../Modal';
import RoundedButton from '../RoundedButton';
import BracketTeamInfo from './_BracketTeamInfo';
import { useAuth } from 'src/app/contexts/authContext';
import { doesRoleHavePermission } from 'src/app/services/utils.service';
import { Role } from 'src/app/types/enums';

interface IMatchInfoModalProps {
    matchInfoOpened: boolean;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    clickedMatch: MatchType | null | undefined;
    games: Game[];
    setGames: React.Dispatch<React.SetStateAction<Game[]>>;
    teams: Team[] | null | undefined;
    setMatches: React.Dispatch<React.SetStateAction<MatchType[]>>;
    setClickedMatch: React.Dispatch<
        React.SetStateAction<MatchType | null | undefined>
    >;
    handleHideMatch: () => void;
}

interface UpdatedInfo {
    firstScore: number;
    secondScore: number;
}

type UpdatedInfoErrors = Record<keyof UpdatedInfo, string>;
type UpdatedInfoTouched = Record<keyof UpdatedInfo, boolean>;

const schema = yup.object().shape({
    firstScore: gameScoreValidation,
    secondScore: gameScoreValidation,
});

const fieldsNotRequired: Partial<Record<keyof UpdatedInfo, boolean>> = {
    firstScore: true,
    secondScore: true,
};

const gameStates: { [key: string]: string } = {
    UNSTARTED: 'Unstarted',
    IN_PROGRESS: 'In Progress',
    PLAYED: 'Played',
    DRAW: 'Draw',
};

const scoreStyle = {
    fontFamily: 'Lora',
    fontWeight: 700,
    fontSize: '64px',
    lineHeight: '81.92px',
};

const MatchInfoModal = ({
    matchInfoOpened,
    isEditing,
    setIsEditing,
    clickedMatch,
    games,
    setGames,
    teams,
    setMatches,
    setClickedMatch,
    handleHideMatch,
}: IMatchInfoModalProps) => {
    const theme = useTheme();
    const openNotification = useOpenNotification();

    const [updatedInfo, setUpdatedInfo] = useState<UpdatedInfo>({
        firstScore: 0,
        secondScore: 0,
    });

    const [isFieldTouched, setIsFieldTouched] = useState<UpdatedInfoTouched>({
        firstScore: false,
        secondScore: false,
    });

    const [errors, setErrors] = useState<UpdatedInfoErrors>({
        firstScore: '',
        secondScore: '',
    });

    const { role } = useAuth();

    const handleFieldsChange = async (
        event:
            | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>
    ) => {
        const { name, value } = event.target;

        setUpdatedInfo((prev: UpdatedInfo) => ({
            ...prev,
            [name]: value,
        }));

        setIsFieldTouched((prev: Record<keyof UpdatedInfo, boolean>) => ({
            ...prev,
            [name]: true,
        }));

        try {
            await schema.validateAt(name, { ...updatedInfo, [name]: value });

            setErrors((prev: Record<keyof UpdatedInfo, string>) => ({
                ...prev,
                [name]: '',
            }));
        } catch (err: any) {
            setErrors((prev: Record<keyof UpdatedInfo, string>) => ({
                ...prev,
                [name]: err.message,
            }));
        }
    };

    const handleEditScores = async () => {
        if (!isEditing) {
            setIsEditing(true);
        } else {
            const touchedInfo = Object.keys(isFieldTouched).filter(
                (key) => isFieldTouched[key as keyof UpdatedInfoTouched]
            );
            const { err, res } = await post(`/api/game/bracketing/match`, {
                match: clickedMatch,
                ...Object.fromEntries(
                    Object.entries(updatedInfo).filter(([key]) =>
                        touchedInfo.includes(key)
                    )
                ),
            });

            setIsEditing(false);

            if (!res || err) {
                openNotification(err ?? 'Error updating scores', 'error');
                return;
            }

            setMatches((matches) => {
                const updatedMatches = [...matches];

                const index = matches.findIndex(({ id }) => id === res?.match.id);
                const nextIndex = matches.findIndex(({ id }) => id === res?.nextMatch?.id);

                if (index !== -1) {
                    updatedMatches[index] = res?.match;
                }

                if (nextIndex !== -1) {
                    updatedMatches[nextIndex] = res?.nextMatch;
                }

                return updatedMatches;
            });

            setGames((games) => {
                const index = games.findIndex(
                    (searchGame) => searchGame.id === res?.game.id
                );

                if (index !== -1) {
                    const newGames = [...games];

                    newGames[index] = res?.game;

                    return newGames;
                }

                return games;
            });
            
            setClickedMatch(res?.match);

            openNotification('Scores updated!', 'success');
        }
    };

    const resetPageEditing = () => {
        setUpdatedInfo({
            firstScore: 0,
            secondScore: 0,
        });

        setIsFieldTouched({
            firstScore: false,
            secondScore: false,
        });

        setErrors({
            firstScore: '',
            secondScore: '',
        });
    };

    useEffect(() => {
        if (!isEditing) {
            resetPageEditing();
        }
    }, [isEditing]);

    return (
        <Modal
            open={matchInfoOpened}
            onClose={handleHideMatch}
            ariaDescribedBy="modal-description"
            ariaLabelledBy="modal-label"
            sx={{
                width: '1024px',
                textAlign: 'center',
                [theme.breakpoints.down('lg')]: {
                    width: '800px',
                },
                [theme.breakpoints.down('md')]: {
                    width: '600px',
                },
                [theme.breakpoints.down('sm')]: {
                    width: '400px',
                },
            }}
        >
            <Stack
                spacing="20px"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h3">Match Details</Typography>
                <Typography variant="bold">
                    ({gameStates[clickedMatch?.state || 'UNSTARTED']})
                </Typography>
            </Stack>
            <Stack
                spacing="32px"
                sx={{
                    marginTop: '32px',
                }}
            >
                <Stack>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            height: '115px',
                            display: 'flex',
                        }}
                    >
                        {(!isEditing && (
                            <>
                                <Typography
                                    sx={{
                                        ...scoreStyle,
                                        flex: 1,
                                        textAlign: 'end',
                                    }}
                                >
                                    {clickedMatch?.participants[0].resultText?.toString()}
                                </Typography>
                                <Typography
                                    sx={{
                                        ...scoreStyle,
                                        marginRight: '32px',
                                        marginLeft: '32px',
                                    }}
                                >
                                    -
                                </Typography>
                                <Typography
                                    sx={{
                                        ...scoreStyle,
                                        flex: 1,
                                        textAlign: 'start',
                                    }}
                                >
                                    {clickedMatch?.participants[1].resultText?.toString()}
                                </Typography>
                            </>
                        )) || (
                            <>
                                <TextField
                                    name="firstScore"
                                    type="number"
                                    defaultValue={
                                        clickedMatch?.participants[0].resultText
                                    }
                                    onChange={handleFieldsChange}
                                    autoFocus
                                    error={!!errors.firstScore}
                                    helperText={errors.firstScore}
                                />
                                <Typography
                                    sx={{
                                        ...scoreStyle,
                                        marginRight: '32px',
                                        marginLeft: '32px',
                                    }}
                                >
                                    -
                                </Typography>
                                <TextField
                                    name="secondScore"
                                    type="number"
                                    defaultValue={
                                        clickedMatch?.participants[1].resultText
                                    }
                                    onChange={handleFieldsChange}
                                    autoFocus
                                    error={!!errors.secondScore}
                                    helperText={errors.secondScore}
                                    inputProps={{
                                        max: 1000,
                                        min: 0,
                                    }}
                                />
                            </>
                        )}
                    </Stack>
                    <Typography variant="small">
                        {clickedMatch?.state !== 'PLAYED'
                            ? 'Current Score'
                            : 'Final Score'}
                    </Typography>
                </Stack>
                <Box
                    sx={{
                        minHeight: '46px',
                    }}
                >
                    {doesRoleHavePermission(role, Role.UNIVERSITY_TOURNAMENT_MOD, false) && (
                        <RoundedButton
                        text={!isEditing ? 'Edit Scores' : 'Update Scores'}
                        disabled={
                            !isEditing
                                ? false
                                : isFormInvalid(
                                      updatedInfo,
                                      errors,
                                      isFieldTouched,
                                      fieldsNotRequired
                                  ) ||
                                  !Object.values(isFieldTouched).some(
                                      (touched) => touched === true
                                  )
                        }
                        borderColor={!isEditing ? '#797979' : 'none'}
                        backgroundColor={
                            !isEditing ? 'white' : globalStyleVars.blue
                        }
                        color={!isEditing ? 'black' : 'white'}
                        onClick={handleEditScores}
                        sx={{
                            boxShadow: 'none',
                            marginRight: !isEditing ? 0 : '8px',
                        }}
                    />
                    )}
                    {isEditing && (
                        <RoundedButton
                            text="Cancel"
                            borderColor="#797979"
                            onClick={() => {
                                setIsEditing(false);
                            }}
                            sx={{
                                boxShadow: 'none',
                            }}
                        />
                    )}
                </Box>
                <Stack
                    direction="row"
                    spacing={{ md: '32px' }}
                    sx={{
                        [theme.breakpoints.down('md')]: {
                            flexDirection: 'column',
                            alignItems: 'center',
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: '50%',
                            [theme.breakpoints.down('md')]: {
                                width: '100%',
                                marginBottom: '32px',
                            },
                        }}
                    >
                        <BracketTeamInfo
                            team={
                                teams?.find(
                                    (team) =>
                                        team.id ===
                                        clickedMatch?.participants[0].id
                                ) as Team
                            }
                        />
                    </Box>
                    <Box
                        sx={{
                            width: '50%',
                            [theme.breakpoints.down('md')]: {
                                width: '100%',
                            },
                        }}
                    >
                        <BracketTeamInfo
                            team={
                                teams?.find(
                                    (team) =>
                                        team.id ===
                                        clickedMatch?.participants[1].id
                                ) as Team
                            }
                        />
                    </Box>
                </Stack>
            </Stack>
            <Stack
                spacing="8px"
                direction="row"
                sx={{
                    marginTop: '30px',
                    justifyContent: 'end',
                    position: 'relative',
                    top: '50px',
                }}
            ></Stack>
        </Modal>
    );
};

export default MatchInfoModal;
