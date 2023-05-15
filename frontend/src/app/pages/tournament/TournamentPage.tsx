/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'react-calendar-components';
import { To, useNavigate, useParams } from 'react-router-dom';
import Base64Image from 'src/app/components/Base64Image';
import Bracket from 'src/app/components/Bracket/Bracket';
import PageAboutSection from 'src/app/components/PageAboutSection';
import PageBanner from 'src/app/components/PageBanner';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get, post } from 'src/app/services/api.service';
import {
    calendarDateString,
    doesRoleHavePermission,
    getDateTime,
    getImageType,
    humanReadableDate,
    textFieldDateString,
} from 'src/app/services/utils.service';
import { Role, TournamentStatus } from 'src/app/types/enums';
import { Team } from 'src/app/types/team.types';
import { Tournament } from 'src/app/types/tournament.types';
import {
    bioValidation,
    isFormInvalid,
    pictureValidation,
    tournamentDeadlineValidation,
    tournamentEndValidation,
    tournamentNameValidation,
    tournamentStartValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';

interface UpdatedInfo {
    newTournamentName: string;
    registerDeadline: string;
    startDate: string;
    endDate: string;
    bio: string;
    pictureBase64: string;
}

type UpdatedInfoErrors = Record<keyof UpdatedInfo, string>;
type UpdatedInfoTouched = Record<keyof UpdatedInfo, boolean>;

const fieldsNotRequired: Partial<Record<keyof UpdatedInfo, boolean>> = {
    bio: true,
    pictureBase64: true,
};

const schema = yup.object().shape({
    newTournamentName: tournamentNameValidation,
    registerDeadline: tournamentDeadlineValidation,
    startDate: tournamentStartValidation,
    endDate: tournamentEndValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

/**
 * UI component for the tournament page.
 */
export default function TournamentPage() {
    /*
        To-do:
            - allow at least users with the Spectator role to view tournament rules
            - allow at least users with the Tournament Moderator role to submit tournament results
            - allow at least users with the Tournament Moderator role to view player contact info
                - sort this list of players by role (e.g. team captain/regular player)
            - allow at least users with the Tournament Moderator role to submit final scores
                - specify winning team
                - specify points scored by each team
            - allow at least users with the Tournament Moderator role to submit real-time updates
                - current points scored by each team
                - current leading team
            - allow at least users with the Tournament Admin role to edit tournament info
                - tournament name
                - tournament description
                - tournament registration date
                - tournament start/end dates
            - allow at least users with the Tournament Admin role to edit/create Tournament Moderator accounts
                - edit/create usernames
                - edit/create first and last name
                - edit/create email
                - edit/create password (and confirm these passwords)
            - allow at least users with the Team Captain role to join this tournament
                - ask Team Captain to confirm their college and team before joining
            - allow at least users with the Tournament Moderator role to leave this tournament
    */

    const theme = useTheme();
    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const { user, role } = useAuth();
    const { name } = useParams();

    const [isFullURI, setIsFullURI] = useState(false);

    const [tournament, setTournament] = useState<Tournament>({} as Tournament);
    const [mainTournamentName, setMainTournamentName] = useState(false);

    const [userCanEdit, setUserCanEdit] = useState(false);

    const [updatedInfo, setUpdatedInfo] = useState<UpdatedInfo>({
        newTournamentName: '',
        registerDeadline: '',
        startDate: '',
        endDate: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] = useState<UpdatedInfoTouched>({
        newTournamentName: false,
        registerDeadline: false,
        startDate: false,
        endDate: false,
        bio: false,
        pictureBase64: false,
    });

    const [errors, setErrors] = useState<UpdatedInfoErrors>({
        newTournamentName: '',
        registerDeadline: '',
        startDate: '',
        endDate: '',
        bio: '',
        pictureBase64: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const [generateButtonDisabled, setGenerateButtonDisabled] = useState(false);

    const getTournamentInfo = useCallback(
        async (newTournamentName?: string) => {
            const { err, res } = await get('/api/tournament', {
                tournamentName: newTournamentName ? newTournamentName : name,
                email: user?.email,
            });

            if (err || !res) {
                openNotification(
                    err ?? 'Error retrieving tournament information',
                    'error'
                );
            }

            if (res?.noTournamentName) {
                if (res?.noTournamentName.redirectTournament) {
                    navigate(
                        `/tournament/${res.noTournamentName.redirectTournament.name}`
                    );
                    return;
                }

                if (res?.noTournamentName.userCanCreateTournament) {
                    navigate('/tournament/create');

                    if (role === Role.AARDVARK_TOURNAMENT_MOD) {
                        openNotification(
                            'There is no main tournament. Please create one.',
                            'info'
                        );
                    }
                } else {
                    navigate('/participants');

                    openNotification(
                        'You are not in a tournament at the moment. You can search for teams here.',
                        'info'
                    );
                }

                return;
            }

            setIsFullURI(false);
            setTournament(res?.tournament);
            setMainTournamentName(res?.mainTournamentName);
            setUserCanEdit(res?.userCanEdit);

            setUpdatedInfo({
                newTournamentName: res?.tournament.name,
                registerDeadline: res?.tournament.deadline,
                startDate: res?.tournament.start_date,
                endDate: res?.tournament.end_date,
                bio: res?.tournament.page?.bio,
                pictureBase64: res?.tournament.page?.picture,
            });
        },
        [name]
    );

    const handleSetTournamentPicture = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picture = event.target.files?.[0];

        if (!picture) {
            setUpdatedInfo((prev: UpdatedInfo) => ({
                ...prev,
                pictureBase64: '',
            }));
            setIsFullURI(false);
            return;
        }
        event.target.value = '';

        const reader = new FileReader();
        reader.readAsDataURL(picture);

        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                openNotification('Format not supported', 'error');
                return;
            }

            const result = reader.result as string;

            const [base64Type, pictureBase64] = result.split(',');

            const type = getImageType(base64Type);

            setIsFullURI(type !== null);

            setUpdatedInfo((prev: UpdatedInfo) => ({
                ...prev,
                pictureBase64: type === null ? pictureBase64 : result,
            }));

            setIsFieldTouched((prev: Record<keyof UpdatedInfo, boolean>) => ({
                ...prev,
                pictureBase64: true,
            }));
        };
    };

    const renderImage = useCallback(() => {
        if (updatedInfo.pictureBase64) {
            return (
                <Base64Image
                    src={updatedInfo.pictureBase64}
                    isFullURI={isFullURI}
                    alt="Tournament Picture"
                    style={{
                        width: '100%',
                        borderRadius: '8px',
                    }}
                />
            );
        }

        return (
            <img
                src="/placeholder.jpeg"
                alt="Tournament Placeholder"
                height="auto"
                width="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [updatedInfo.pictureBase64]);

    const handleFieldsChange = async (
        event: React.ChangeEvent<HTMLInputElement>
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

    const handleSaveTournament = async () => {
        setSaveButtonDisabled(true);

        const touchedInfo = Object.keys(isFieldTouched).filter(
            (key) => isFieldTouched[key as keyof UpdatedInfoTouched]
        );

        const { err, res } = await post(`/api/tournament/edit`, {
            tournamentName: tournament.name,
            ...Object.fromEntries(
                Object.entries(updatedInfo).filter(([key]) =>
                    touchedInfo.includes(key)
                )
            ),
        });

        setIsEditing(false);

        if (!res || err) {
            openNotification(err ?? 'Error updating tournament', 'error');
            return;
        }

        setSaveButtonDisabled(false);

        if (res.tournament.name !== tournament.name) {
            navigate(`/tournament/${res.tournament.name}`, {
                replace: true,
                preventScrollReset: true,
            });

            await getTournamentInfo(res.tournament.name);
        } else {
            await getTournamentInfo();
        }

        openNotification('Tournament saved!', 'success');
    };

    const handleCreateTournamentGames = async () => {
        setGenerateButtonDisabled(true);

        const { err, res } = await post(`/api/tournament/generatebrackets`, {
            tournamentName: tournament.name,
        });

        if (!res || err) {
            openNotification(err ?? 'Error generating brackets', 'error');
            return;
        }

        setGenerateButtonDisabled(false);

        setTournament(res?.tournament);

        openNotification('Brackets generated!', 'success');
    };

    const resetPageEditing = () => {
        setUpdatedInfo({
            newTournamentName: tournament.name || '',
            registerDeadline: tournament.deadline || '',
            startDate: tournament.start_date || '',
            endDate: tournament.end_date || '',
            bio: tournament.page?.bio || '',
            pictureBase64: tournament.page?.picture || '',
        });

        setIsFieldTouched({
            newTournamentName: false,
            registerDeadline: false,
            startDate: false,
            endDate: false,
            bio: false,
            pictureBase64: false,
        });

        setErrors({
            newTournamentName: '',
            registerDeadline: '',
            startDate: '',
            endDate: '',
            bio: '',
            pictureBase64: '',
        });
    };

    useEffect(() => {
        getTournamentInfo().then(() => {
            setIsEditing(false);
        });
    }, []);

    useEffect(() => {
        if (!isEditing) {
            resetPageEditing();
        }
    }, [isEditing]);

    useEffect(() => {
        Array.from(
            document.getElementsByClassName(
                'calendar-module_primaryIndex__0r2Es'
            )
        ).forEach((calendarEventDiv) => {
            // this will reveal each Calendar component's "event" detail section
            (calendarEventDiv as HTMLDivElement).click();
        });
    }, [
        updatedInfo.startDate,
        updatedInfo.registerDeadline,
        updatedInfo.endDate,
    ]);

    const tournamentStatusText = {
        UNSTARTED: `This tournament starts on ${humanReadableDate(
            tournament.start_date
        )}.`,
        IN_PROGRESS: `This tournament is currently in progress until ${humanReadableDate(
            tournament.end_date
        )}.`,
        TERMINATED: `This tournament ended on ${humanReadableDate(
            tournament.end_date
        )}.`,
    };

    const canEdit = () => {
        if (userCanEdit) {
            return true;
        }

        return doesRoleHavePermission(
            role,
            Role.AARDVARK_TOURNAMENT_MOD,
            false
        );
    };

    return (
        <Stack>
            <PageBanner
                title={tournament?.name}
                extraText={((): string | undefined => {
                    if (tournament.college && mainTournamentName) {
                        return `In association with ${tournament.college.name}. Part of the ${mainTournamentName} main tournament.`;
                    } else if (tournament.parent_id === null) {
                        return 'Main Tournament';
                    }
                })()}
                canEdit={canEdit()}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                extraEditingText="People viewing the tournament will see the following
                information"
                titleField={
                    <TextField
                        label="Tournament Name"
                        name="newTournamentName"
                        defaultValue={tournament?.name}
                        required
                        placeholder="Tournament Name"
                        onChange={handleFieldsChange}
                        margin="normal"
                        autoFocus
                        error={!!errors.newTournamentName}
                        helperText={errors.newTournamentName}
                        inputProps={{ maxLength: 30 }}
                    />
                }
                saveDisabled={
                    isFormInvalid(
                        updatedInfo,
                        errors,
                        isFieldTouched,
                        fieldsNotRequired
                    ) ||
                    !Object.values(isFieldTouched).some(
                        (touched) => touched === true
                    ) ||
                    saveButtonDisabled
                }
                handleSave={handleSaveTournament}
            />

            <PageAboutSection
                isEditing={isEditing}
                setPictureHandler={handleSetTournamentPicture}
                imageComponent={renderImage()}
                bio={tournament?.page?.bio}
                aboutField={
                    <TextField
                        label="About Section"
                        name="bio"
                        defaultValue={tournament?.page?.bio}
                        placeholder="Describe the tournament"
                        variant="outlined"
                        onChange={handleFieldsChange}
                        error={!!errors.bio}
                        helperText={errors.bio}
                        inputProps={{ maxLength: 300 }}
                        multiline
                        rows={10}
                        sx={{
                            [theme.breakpoints.down('lg')]: {
                                width: '100%',
                                marginBottom: '30px',
                            },
                        }}
                    />
                }
            />

            <Stack padding="64px" spacing="40px">
                <Typography variant="bold-title">
                    Tournament Schedule
                </Typography>
                <Box
                    sx={{
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="card">
                        {tournamentStatusText[tournament.status]}
                    </Typography>
                </Box>
                <Grid2
                    container
                    columnSpacing="55px"
                    rowSpacing="40px"
                    sx={{
                        justifyContent: 'center',
                    }}
                >
                    <Grid2 sm={12} md={6} xl={4}>
                        <Stack
                            spacing="24px"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            {(!isEditing && (
                                <Calendar
                                    size="sm"
                                    rounded
                                    showEventsOnClick
                                    startDate={
                                        new Date(
                                            calendarDateString(
                                                tournament.start_date
                                            )
                                        )
                                    }
                                    events={[
                                        {
                                            id: 'tournament-start-date',
                                            name: 'Start Date',
                                            description:
                                                'The date and time that this tournament starts.',
                                            date: calendarDateString(
                                                tournament.start_date
                                            ),
                                            type: 'primary',
                                            hour: getDateTime(
                                                tournament.start_date
                                            ),
                                        },
                                    ]}
                                />
                            )) || (
                                <Tooltip
                                    followCursor
                                    title={
                                        tournament.parent_id !== null &&
                                        'You can only modify the dates of the main tournament'
                                    }
                                >
                                    <TextField
                                        label="Start Date"
                                        name="startDate"
                                        disabled={!!tournament.parent_id}
                                        type="datetime-local"
                                        required
                                        onChange={handleFieldsChange}
                                        defaultValue={textFieldDateString(
                                            tournament.start_date
                                        )}
                                        fullWidth
                                        error={!!errors.startDate}
                                        helperText={errors.startDate}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Tooltip>
                            )}
                            <Typography variant="bold-small">
                                Start Date
                            </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2 sm={12} md={6} xl={4}>
                        <Stack
                            spacing="24px"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            {(!isEditing && (
                                <Calendar
                                    size="lg"
                                    rounded
                                    showEventsOnClick
                                    startDate={
                                        new Date(
                                            calendarDateString(
                                                tournament.deadline
                                            )
                                        )
                                    }
                                    events={[
                                        {
                                            id: 'tournament-registration-deadline',
                                            name: 'Registration Deadline',
                                            description:
                                                'The date and time that team registration for this tournament ends.',
                                            date: calendarDateString(
                                                tournament.deadline
                                            ),
                                            type: 'primary',
                                            hour: getDateTime(
                                                tournament.deadline
                                            ),
                                        },
                                    ]}
                                />
                            )) || (
                                <Tooltip
                                    followCursor
                                    title={
                                        tournament.parent_id !== null &&
                                        'You can only modify the dates of the main tournament'
                                    }
                                >
                                    <TextField
                                        label="Registration Deadline"
                                        name="registerDeadline"
                                        disabled={!!tournament.parent_id}
                                        type="datetime-local"
                                        required
                                        onChange={handleFieldsChange}
                                        defaultValue={textFieldDateString(
                                            tournament.deadline
                                        )}
                                        fullWidth
                                        error={!!errors.registerDeadline}
                                        helperText={errors.registerDeadline}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Tooltip>
                            )}
                            <Typography variant="bold-small">
                                Deadline to Join
                            </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2 sm={12} md={6} xl={4}>
                        <Stack
                            spacing="24px"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            {(!isEditing && (
                                <Calendar
                                    size="sm"
                                    rounded
                                    showEventsOnClick
                                    startDate={
                                        new Date(
                                            calendarDateString(
                                                tournament.end_date
                                            )
                                        )
                                    }
                                    events={[
                                        {
                                            id: 'tournament-end-date',
                                            name: 'End Date',
                                            description:
                                                'The date and time that this tournament ends.',
                                            date: calendarDateString(
                                                tournament.end_date
                                            ),
                                            type: 'primary',
                                            hour: getDateTime(
                                                tournament.end_date
                                            ),
                                        },
                                    ]}
                                />
                            )) || (
                                <Tooltip
                                    followCursor
                                    title={
                                        tournament.parent_id !== null &&
                                        'You can only modify the dates of the main tournament'
                                    }
                                >
                                    <TextField
                                        label="End Date"
                                        name="endDate"
                                        disabled={!!tournament.parent_id}
                                        type="datetime-local"
                                        required
                                        onChange={handleFieldsChange}
                                        defaultValue={textFieldDateString(
                                            tournament.end_date
                                        )}
                                        fullWidth
                                        error={!!errors.endDate}
                                        helperText={errors.endDate}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Tooltip>
                            )}
                            <Typography variant="bold-small">
                                End Date
                            </Typography>
                        </Stack>
                    </Grid2>
                </Grid2>
            </Stack>
            {tournament?.parent_id && (
                <Stack padding="64px" spacing="40px">
                    <Typography variant="bold-title">
                        Teams Competing ({tournament.teams?.length})
                    </Typography>
                    <Grid2
                        container
                        columnSpacing="55px"
                        rowSpacing="40px"
                        sx={{
                            justifyContent: 'center',
                        }}
                    >
                        {tournament.teams?.map((team: Team) => {
                            return (
                                <Grid2
                                    sm={12}
                                    md={6}
                                    xl={4}
                                    key={team.name}
                                    sx={{
                                        width: '100%',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        navigate(`/team/${team.name}`);
                                    }}
                                >
                                    <Stack
                                        spacing="24px"
                                        sx={{
                                            alignItems: 'center',
                                        }}
                                    >
                                        {(team.page?.picture && (
                                            <Base64Image
                                                src={team.page.picture}
                                                alt="Team"
                                                height="auto"
                                                width="210px"
                                                style={{
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        )) || (
                                            <img
                                                src="/placeholder.jpeg"
                                                alt="Placeholder"
                                                width="210px"
                                                height="auto"
                                            />
                                        )}
                                        <Typography variant="bold-small">
                                            {team.name}
                                        </Typography>
                                    </Stack>
                                </Grid2>
                            );
                        })}
                    </Grid2>
                </Stack>
            )}

            {tournament?.parent_id && (
                <>
                    {(tournament.status === TournamentStatus.IN_PROGRESS && (
                        <Bracket tournamentId={tournament.id} />
                    )) || (
                        <Box
                            sx={{
                                margin: '50px 0',
                                textAlign: 'center',
                            }}
                        >
                            Bracketing will appear here when it is generated.
                        </Box>
                    )}
                </>
            )}

            {canEdit() &&
                !tournament?.parent_id &&
                tournament?.status === TournamentStatus.UNSTARTED && (
                    <Tooltip
                        title={(() => {
                            if (new Date() < new Date(tournament.deadline)) {
                                return 'Please wait until the start date of this tournament to generate the brackets.';
                            }
                        })()}
                        followCursor
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            color="info"
                            sx={{ padding: 3, color: 'white' }}
                            onClick={handleCreateTournamentGames}
                            disabled={
                                new Date() < new Date(tournament.deadline) ||
                                generateButtonDisabled
                            }
                        >
                            Generate Brackets
                        </Button>
                    </Tooltip>
                )}
        </Stack>
    );
}
