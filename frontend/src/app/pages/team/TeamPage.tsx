import { Edit, RemoveCircle, RemoveCircleOutline } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Tooltip,
    Typography,
    keyframes,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { globalStyleVars } from 'src/app/app';
import Base64Image from 'src/app/components/Base64Image';
import Modal from 'src/app/components/Modal';
import RoundedButton from 'src/app/components/RoundedButton';
import UploadBox from 'src/app/components/UploadBox';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get, post } from 'src/app/services/api.service';
import {
    doesRoleHavePermission,
    getImageType,
} from 'src/app/services/utils.service';
import { Role } from 'src/app/types/enums';
import { Team } from 'src/app/types/team.types';
import { User } from 'src/app/types/user.types';
import {
    bioValidation,
    isFormInvalid,
    newTeamMemberEmailValidation,
    pictureValidation,
    playersRemovedValidation,
    teamNameValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';

interface UpdatedInfo {
    newTeamName: string;
    bio: string;
    pictureBase64: string;
    playersRemoved: string[];
}

interface IDeletedTeamInfo {
    deletedTeam: Team;
    authToken: string;
}

interface RemoveButtonColors {
    [key: string]: string;
}

type UpdatedInfoErrors = Record<keyof UpdatedInfo, string>;
type UpdatedInfoTouched = Record<keyof UpdatedInfo, boolean>;

const fieldsNotRequired: Partial<Record<keyof UpdatedInfo, boolean>> = {
    bio: true,
    pictureBase64: true,
    playersRemoved: true,
};

const schema = yup.object().shape({
    newTeamName: teamNameValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
    playersRemoved: playersRemovedValidation,
});

// styles that will probably change a lot and are worth storing in a single place
const styles = {
    headerHeightLarge: '420px',
    teamPictureWidth: '44vw',
    aboutSectionWidth: '530px',
    teamBackgroundColor: '#ECECEC',
};

const upvoteButtonAnimation = keyframes`
    0% {
        transform: rotate(0deg);
    }
    20% {
        transform: rotate(15deg);
    }
    40% {
        transform: rotate(-15deg);
    }
    60% {
        transform: rotate(10deg);
    }
    80% {
        transform: rotate(-10deg);
    }
    100% {
        transform: rotate(0deg);
    }
`;

/**
 * UI component for the team page.
 */
export default function TeamPage() {
    const theme = useTheme();
    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const { user, role, setAuthToken } = useAuth();
    const { name } = useParams();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [team, setTeam] = useState<Team>({} as Team);

    const [updatedInfo, setUpdatedInfo] = useState<UpdatedInfo>({
        newTeamName: '',
        bio: '',
        pictureBase64: '',
        playersRemoved: [],
    });

    const [isFieldTouched, setIsFieldTouched] = useState<UpdatedInfoTouched>({
        newTeamName: false,
        bio: false,
        pictureBase64: false,
        playersRemoved: false,
    });

    const [errors, setErrors] = useState<UpdatedInfoErrors>({
        newTeamName: '',
        bio: '',
        pictureBase64: '',
        playersRemoved: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const [removeButtons, setRemoveButtons] = useState<RemoveButtonColors>({});

    const [confirmDeleteTeamOpen, setConfirmDeleteTeamOpen] =
        useState<boolean>(false);

    const [newTeamMemberEmail, setNewTeamMemberEmail] = useState<string>('');

    const [newTeamMemberError, setNewTeamMemberError] = useState<string>('');

    const [isFullURI, setIsFullURI] = useState(false);

    const [upvoteClicked, setUpvoteClicked] = useState(false);

    const [userUpvotedTeam, setUserUpvotedTeam] = useState(false);

    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const [inviteButtonDisabled, setInviteButtonDisabled] = useState(false);
    const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);
    const [upvoteDisabled, setUpvoteDisabled] = useState(false);

    const [invitees, setInvitees] = useState<User[]>([]);
    const [userCanEdit, setUserCanEdit] = useState(false);

    const getTeamInfo = useCallback(
        async (newTeamName?: string) => {
            const { err, res } = await get('/api/team', {
                teamName: newTeamName ? newTeamName : name,
                email: user?.email,
            });

            if (err || !res) {
                openNotification(
                    err ?? 'Error retrieving team information',
                    'error'
                );
            }

            setIsFullURI(false);
            setTeam(res?.team);
            setInvitees(res?.invitees);
            setUserCanEdit(res?.userCanEdit || false);

            setUserUpvotedTeam(res?.userUpvotedTeam || false);

            setUpdatedInfo({
                newTeamName: res?.team.name,
                bio: res?.team.page?.bio ?? '',
                pictureBase64: res?.team.page?.picture,
                playersRemoved: [],
            });
        },
        [name]
    );

    const handleEditTeam = () => {
        setIsEditing(!isEditing);
    };

    const handleFieldsChange = async (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    const handleRemovePlayer = (email: string) => {
        setRemoveButtons((previousColors) => {
            return {
                ...previousColors,
                [email]:
                    previousColors[email] === 'tomato' ? 'white' : 'tomato',
            };
        });

        setUpdatedInfo((prev: UpdatedInfo) => {
            const updated = [...prev['playersRemoved']];
            const index = updated.indexOf(email);

            if (index > -1) {
                updated.splice(index, 1);
            } else {
                updated.push(email);
            }

            return {
                ...prev,
                playersRemoved: updated,
            };
        });

        setIsFieldTouched((prev: Record<keyof UpdatedInfo, boolean>) => ({
            ...prev,
            playersRemoved: true,
        }));
    };

    const handlePlayersRemoved = useCallback(async () => {
        try {
            await schema.validateAt('playersRemoved', updatedInfo);

            setErrors((prev: Record<keyof UpdatedInfo, string>) => ({
                ...prev,
                playersRemoved: '',
            }));
        } catch (err: any) {
            setErrors((prev: Record<keyof UpdatedInfo, string>) => ({
                ...prev,
                playersRemoved: err.message,
            }));
        }
    }, [updatedInfo.playersRemoved]);

    const handleSaveTeam = async () => {
        setSaveButtonDisabled(true);

        const touchedInfo = Object.keys(isFieldTouched).filter(
            (key) => isFieldTouched[key as keyof UpdatedInfoTouched]
        );

        const { err, res } = await post(`/api/team/edit`, {
            userId: user?.id,
            teamName: name,
            ...Object.fromEntries(
                Object.entries(updatedInfo).filter(([key]) =>
                    touchedInfo.includes(key)
                )
            ),
        });

        setIsEditing(false);
        setSaveButtonDisabled(false);

        if (!res || err) {
            setUpvoteClicked(false);

            openNotification(err ?? 'Error updating team', 'error');
            return;
        }

        if (res.team.name !== name) {
            navigate(`/team/${res.team.name}`, {
                replace: true,
                preventScrollReset: true,
            });

            await getTeamInfo(res.team.name);
        } else {
            await getTeamInfo();
        }
        openNotification('Team saved!', 'success');
    };

    const resetPageEditing = () => {
        setUpdatedInfo({
            newTeamName: team.name,
            bio: team.page?.bio ?? '',
            pictureBase64: team.page?.picture ?? '',
            playersRemoved: [],
        });

        setIsFieldTouched({
            newTeamName: false,
            bio: false,
            pictureBase64: false,
            playersRemoved: false,
        });

        setRemoveButtons({});

        setErrors({
            newTeamName: '',
            bio: '',
            pictureBase64: '',
            playersRemoved: '',
        });
    };

    const handleConfirmDeleteTeam = (opened: boolean) => {
        setConfirmDeleteTeamOpen(opened);
    };

    const handleDeleteTeam = async () => {
        setDeleteButtonDisabled(true);

        const { err, res } = (await post('/api/team/delete', {
            teamName: name,
            email: user?.email,
        })) as { err: any; res: IDeletedTeamInfo | undefined };

        setDeleteButtonDisabled(false);

        if (!res || err) {
            openNotification(err, 'error');
            return;
        }

        if (res?.authToken) {
            setAuthToken(res.authToken);
        }

        navigate('/');

        openNotification('Team deleted', 'info');
    };

    const handleNewTeamMemberEmail = async (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>
    ) => {
        const { value } = event.target;

        setNewTeamMemberEmail(value);

        try {
            await newTeamMemberEmailValidation.validate(value);

            setNewTeamMemberError('');
        } catch (err: any) {
            setNewTeamMemberError(err.message);
        }
    };

    const handleInviteTeamMember = async () => {
        setInviteButtonDisabled(true);

        const { err, res } = (await post('/api/team/invite', {
            teamName: name,
            email: newTeamMemberEmail,
        })) as { err: any; res: { emailPreview: string; maxPlayers?: string } };

        setInviteButtonDisabled(false);

        if (!res || err) {
            openNotification(err, 'error');
            return;
        }

        if (res.maxPlayers) {
            openNotification(res.maxPlayers, 'error');
            return;
        }

        setNewTeamMemberEmail('');
        openNotification('User invited!', 'success');
    };

    const handleSetTeamPicture = async (
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

    const handleUpvoteTeam = async () => {
        if (canUpvote()) {
            setUpvoteDisabled(true);
            setUpvoteClicked(!userUpvotedTeam);

            const { err, res } = await post('/api/teamPage/upvote', {
                userId: user?.id || '',
                teamName: name,
                upvote: !userUpvotedTeam,
            });

            if (!res || err) {
                openNotification(
                    err ||
                        (!userUpvotedTeam
                            ? 'Error upvoting team'
                            : 'Error removing upvote'),
                    'error'
                );
                return;
            }

            await getTeamInfo();

            setUpvoteDisabled(false);

            openNotification(
                !userUpvotedTeam ? 'Team upvoted' : 'Upvote removed',
                !userUpvotedTeam ? 'success' : 'info'
            );
        } else {
            openNotification('You must be signed in to upvote teams', 'info');
        }
    };

    const renderImage = useCallback(() => {
        if (updatedInfo.pictureBase64) {
            return (
                <Base64Image
                    src={updatedInfo.pictureBase64}
                    isFullURI={isFullURI}
                    alt="Team"
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
                alt="Team Placeholder"
                height="auto"
                width="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [updatedInfo.pictureBase64]);

    useEffect(() => {
        getTeamInfo().then(() => {
            setIsEditing(false);
        });
    }, []);

    useEffect(() => {
        if (!isEditing) {
            resetPageEditing();
        }
    }, [isEditing]);

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

    const canUpvote = () => {
        return doesRoleHavePermission(role, Role.REGISTERED_USER, false);
    };

    return (
        <Stack>
            <Stack
                direction={'row'}
                sx={{
                    justifyContent: 'space-between',
                    backgroundColor: globalStyleVars.mustardColor,
                    height: styles.headerHeightLarge,
                    padding: '30px 64px',
                    [theme.breakpoints.down('lg')]: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '64px',
                        height: !isEditing
                            ? styles.headerHeightLarge
                            : 'fit-content',
                    },
                }}
            >
                <Stack
                    sx={{
                        alignSelf: 'center',
                        [theme.breakpoints.down('lg')]: {
                            alignItems: 'center',
                            marginBottom: !isEditing ? '0' : '40px',
                        },
                        [theme.breakpoints.down('sm')]: {
                            textAlign: 'center',
                        },
                    }}
                    spacing="30px"
                >
                    {(!isEditing && (
                        <Typography variant="h3">
                            {team.name ?? 'Placeholder Team Name'}
                        </Typography>
                    )) || (
                        <Box>
                            <TextField
                                id="team-name-input"
                                label="Team Name"
                                name="newTeamName"
                                autoFocus
                                defaultValue={team.name}
                                required
                                placeholder="Team name"
                                variant="outlined"
                                onChange={handleFieldsChange}
                                error={!!errors.newTeamName}
                                helperText={errors.newTeamName}
                                inputProps={{ maxLength: 20 }}
                                sx={{
                                    width: '28vw',
                                    backgroundColor: 'white',
                                    [theme.breakpoints.down('md')]: {
                                        width: '40vw',
                                    },
                                    [theme.breakpoints.down('sm')]: {
                                        width: '80vw',
                                    },
                                }}
                            ></TextField>
                        </Box>
                    )}

                    {(team.college && (
                        <Typography>
                            Affiliated with <b>{team.college.name}.</b>{' '}
                            {team.tournament
                                ? `Participating in the ${team.tournament.name} tournament.`
                                : 'This team is not participating in a tournament at the moment.'}
                        </Typography>
                    )) || (
                        <Typography>
                            This team is not affiliated with any colleges.
                        </Typography>
                    )}

                    <Stack direction={'row'} spacing="16px">
                        <Box
                            onClick={
                                !upvoteDisabled ? handleUpvoteTeam : undefined
                            }
                            sx={{
                                height: '30px',
                                width: '30px',
                                borderRadius: '50%',
                                backgroundColor: 'black',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 100ms ease-in-out',
                                transitionDelay: '100ms',
                                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.50)',
                                ...(upvoteClicked
                                    ? {
                                          animation: `${upvoteButtonAnimation} 500ms ease-in-out forwards`,
                                      }
                                    : null),
                            }}
                        >
                            <FavoriteIcon
                                sx={{
                                    color:
                                        upvoteClicked || userUpvotedTeam
                                            ? globalStyleVars.heartColor
                                            : 'white',
                                    fontSize: 'small',
                                }}
                            />
                        </Box>
                        <Typography>
                            {team.upvotes} upvote
                            {team.upvotes > 1 || team.upvotes === 0 ? 's' : ''}
                        </Typography>
                    </Stack>
                </Stack>

                {canEdit() && (
                    <>
                        {(!isEditing && (
                            <RoundedButton
                                text="Edit"
                                startIcon={<Edit />}
                                onClick={handleEditTeam}
                            />
                        )) || (
                            <Stack spacing="8px" direction="row">
                                <RoundedButton
                                    text="Save"
                                    type="submit"
                                    disabled={
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
                                    onClick={handleSaveTeam}
                                />
                                <RoundedButton
                                    text="Cancel"
                                    sx={{
                                        border: `1px solid ${globalStyleVars.mustardColor}`,
                                        backgroundColor:
                                            globalStyleVars.mustardColor,
                                        boxShadow: 0,
                                        ':hover': {
                                            backgroundColor:
                                                globalStyleVars.mustardColor,
                                        },
                                    }}
                                    onClick={handleEditTeam}
                                />
                            </Stack>
                        )}
                    </>
                )}
            </Stack>
            <Stack
                sx={{
                    margin: '140px 64px 30px 64px',
                    alignItems: 'center',
                    [theme.breakpoints.down('lg')]: {
                        flexDirection: 'column',
                    },
                }}
                direction="row"
            >
                <UploadBox
                    showUploadButton={isEditing}
                    inputId="upload-team-picture"
                    accept="image/*"
                    handler={handleSetTeamPicture}
                    sx={{
                        width: styles.teamPictureWidth,
                        [theme.breakpoints.down('lg')]: {
                            width: '100%',
                            marginBottom: '30px',
                        },
                    }}
                >
                    {renderImage()}
                </UploadBox>
                <Stack
                    sx={{
                        width: styles.aboutSectionWidth,
                        marginLeft: '140px',
                        [theme.breakpoints.down('lg')]: {
                            width: '100%',
                            marginLeft: '0',
                        },
                        [theme.breakpoints.down('sm')]: {
                            width: '100%',
                            alignItems: 'center',
                        },
                    }}
                >
                    {(!isEditing && (
                        <>
                            <Typography
                                variant="h4"
                                sx={{
                                    marginBottom: `8px`,
                                    [theme.breakpoints.down('lg')]: {
                                        textAlign: 'center',
                                    },
                                }}
                            >
                                About
                            </Typography>
                            <Typography
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    [theme.breakpoints.down('lg')]: {
                                        textAlign: 'center',
                                    },
                                }}
                            >
                                {team.page?.bio ?? 'N/A'}
                            </Typography>
                        </>
                    )) || (
                        <TextField
                            id="about-you-input"
                            label="About"
                            name="bio"
                            defaultValue={team.page?.bio}
                            placeholder="Tell us about your team"
                            variant="outlined"
                            onChange={handleFieldsChange}
                            error={!!errors.bio}
                            helperText={errors.bio}
                            inputProps={{ maxLength: 300 }}
                            sx={{
                                width: '100%',
                            }}
                            multiline
                            rows={10}
                        ></TextField>
                    )}
                </Stack>
            </Stack>
            <Box sx={{ margin: '30px 64px' }}>
                <Typography
                    variant="h4"
                    sx={{
                        marginBottom: `40px`,
                        [theme.breakpoints.down('sm')]: {
                            textAlign: 'center',
                        },
                    }}
                >
                    Team Members ({team.players ? team.players.length : 0})
                </Typography>
                <Grid2 container spacing="24px">
                    {team.players?.map((player: User) => {
                        return (
                            <Grid2
                                sm={12}
                                lg={6}
                                key={player.email}
                                sx={{
                                    width: '100%',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    navigate(`/profile/${player.id}`);
                                }}
                            >
                                <Stack
                                    direction="row"
                                    sx={{
                                        position: 'relative',
                                        alignItems: 'center',
                                        height: '200px',
                                        padding: '32px',
                                        backgroundColor:
                                            styles.teamBackgroundColor,
                                        borderRadius: '8px',
                                        [theme.breakpoints.down('sm')]: {
                                            flexDirection: 'column',
                                            height: 'fit-content',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            [theme.breakpoints.down('sm')]: {
                                                height: '150px',
                                                marginBottom: '8px',
                                            },
                                        }}
                                    >
                                        {player.page?.picture ? (
                                            <Base64Image
                                                src={player.page?.picture || ''}
                                                alt="Team Player Profile Picture"
                                                style={{
                                                    width: !isSmallScreen
                                                        ? '150px'
                                                        : '150px',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src="/placeholder.jpeg"
                                                alt="Team Player Profile Placeholder"
                                                style={{
                                                    width: !isSmallScreen
                                                        ? '150px'
                                                        : '150px',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            marginLeft: '80px',
                                            height: '110px',
                                            overflow: 'hidden',
                                            [theme.breakpoints.down('lg')]: {
                                                marginLeft: '40px',
                                            },
                                            [theme.breakpoints.down('sm')]: {
                                                marginLeft: '0',
                                                height: 'fit-content',
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="card"
                                            sx={{
                                                marginBottom: `8px`,
                                                whiteSpace: 'nowrap',
                                                [theme.breakpoints.down('sm')]:
                                                    {
                                                        textAlign: 'center',
                                                    },
                                            }}
                                        >
                                            {player.display_name}
                                        </Typography>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: '100%',
                                                [theme.breakpoints.down('sm')]:
                                                    {
                                                        display: 'none',
                                                    },
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {player.role || 'N/A'}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    height: '20px',
                                                    bottom: '20px',
                                                    width: '100%',
                                                    backgroundColor:
                                                        styles.teamBackgroundColor,
                                                    opacity: 0.9,
                                                }}
                                            ></Box>
                                        </Box>
                                    </Box>

                                    {isEditing && (
                                        <RoundedButton
                                            text={
                                                !(
                                                    removeButtons[
                                                        player.email
                                                    ] === 'tomato'
                                                )
                                                    ? 'Remove'
                                                    : 'Removed'
                                            }
                                            startIcon={
                                                !(
                                                    removeButtons[
                                                        player.email
                                                    ] === 'tomato'
                                                ) ? (
                                                    <RemoveCircleOutline />
                                                ) : (
                                                    <RemoveCircle />
                                                )
                                            }
                                            onClick={async () => {
                                                await handlePlayersRemoved();
                                                handleRemovePlayer(
                                                    player.email
                                                );
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                opacity: !(
                                                    removeButtons[
                                                        player.email
                                                    ] === 'tomato'
                                                )
                                                    ? 0.7
                                                    : 1.0,
                                                transition: 'none',
                                                backgroundColor:
                                                    removeButtons[
                                                        player.email
                                                    ] ?? 'white',
                                                borderColor:
                                                    removeButtons[
                                                        player.email
                                                    ] ?? 'white',
                                                ':hover': {
                                                    opacity: 1,
                                                    backgroundColor:
                                                        removeButtons[
                                                            player.email
                                                        ] ?? 'white',
                                                },
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Grid2>
                        );
                    })}
                </Grid2>
            </Box>

            {!isEditing && canEdit() && (
                <Box sx={{ margin: '30px 64px' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            marginBottom: `16px`,
                            [theme.breakpoints.down('sm')]: {
                                textAlign: 'center',
                            },
                        }}
                    >
                        Invite to Team
                    </Typography>
                    <Typography
                        sx={{
                            marginBottom: '16px',
                            width: `calc(28vw + 224px)`,
                            [theme.breakpoints.down('md')]: {
                                width: `calc(40vw + 224px)`,
                            },
                            [theme.breakpoints.down('sm')]: {
                                textAlign: 'center',
                                width: 'auto',
                            },
                        }}
                    >
                        Inivte people to your team by email.
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={'8px'}
                        sx={{
                            width: `calc(28vw + 224px)`,
                            justifyContent: 'space-between',
                            [theme.breakpoints.down('md')]: {
                                width: `calc(40vw + 224px)`,
                            },
                            [theme.breakpoints.down('sm')]: {
                                width: '100%',
                            },
                        }}
                    >
                        <Tooltip
                            followCursor
                            title={
                                !invitees?.length
                                    ? `It looks like there are no other players in this team's college at the moment`
                                    : undefined
                            }
                        >
                            <FormControl fullWidth>
                                <InputLabel>Invitees</InputLabel>
                                <Select
                                    name="invitePlayer"
                                    label="Invitees"
                                    disabled={!invitees?.length}
                                    onChange={handleNewTeamMemberEmail}
                                    value={newTeamMemberEmail || ''}
                                    error={!!newTeamMemberError}
                                >
                                    {invitees.map((invitee) => (
                                        <MenuItem
                                            key={invitee.id}
                                            value={invitee.email}
                                        >
                                            {invitee.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Tooltip>
                        <Button
                            onClick={handleInviteTeamMember}
                            disabled={
                                !!newTeamMemberError ||
                                inviteButtonDisabled ||
                                !newTeamMemberEmail
                            }
                            sx={{
                                color: '#FFFFFF',
                                backgroundColor: '#000000',
                                border: '1px solid white',
                                ':hover': {
                                    backgroundColor: 'white',
                                    border: '1px solid black',
                                    color: 'black',
                                },
                                '&.Mui-disabled': {
                                    color: 'gray',
                                },
                            }}
                            size={!isSmallScreen ? 'large' : 'small'}
                        >
                            Send Invite
                        </Button>
                    </Stack>
                </Box>
            )}

            {isEditing && (
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    sx={{ padding: 3, color: 'white' }}
                    onClick={
                        !confirmDeleteTeamOpen
                            ? () => handleConfirmDeleteTeam(true)
                            : undefined
                    }
                >
                    Delete Team
                </Button>
            )}

            <Modal
                type="warning"
                open={confirmDeleteTeamOpen}
                onClose={() => {
                    handleConfirmDeleteTeam(false);
                }}
                ariaDescribedBy="modal-description"
                ariaLabelledBy="modal-label"
            >
                <Typography>
                    Are you sure you want to delete this team?
                </Typography>
                <Stack
                    spacing="8px"
                    direction="row"
                    sx={{
                        marginTop: '30px',
                        justifyContent: 'end',
                        position: 'relative',
                        top: '50px',
                    }}
                >
                    <RoundedButton
                        text="Delete"
                        onClick={handleDeleteTeam}
                        disabled={deleteButtonDisabled}
                        sx={{
                            border: '1px solid tomato',
                            backgroundColor: 'tomato',
                            ':hover': {
                                opacity: 1,
                                backgroundColor: 'tomato',
                            },
                        }}
                    />
                    <RoundedButton
                        text="Cancel"
                        sx={{
                            boxShadow: 0,
                        }}
                        onClick={() => {
                            handleConfirmDeleteTeam(false);
                        }}
                    />
                </Stack>
            </Modal>
        </Stack>
    );
}
