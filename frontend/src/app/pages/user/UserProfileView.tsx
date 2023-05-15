import { Divider, Stack, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InlineLink from 'src/app/components/InlineLink';
import ProfileTeamsList from 'src/app/components/ProfileTeamsList';
import RoundedButton from 'src/app/components/RoundedButton';
import { Role } from 'src/app/types/enums';
import { globalStyleVars } from '../../app';
import ProfileBanner from '../../components/ProfileBanner';
import { useOpenNotification } from '../../hooks/useNotification';
import { post } from '../../services/api.service';
import { nullTruthyCheck } from '../../services/utils.service';
import { User } from '../../types/user.types';

interface Props {
    canEdit: boolean;
    handleSetEditProfile: (value: boolean) => void;
    profile: User | undefined;
    userId: string;
    refreshInfo: () => Promise<void>;
    pendingTeams: string[];
}

const roleText: { [key: string]: string } = {
    VISITOR: 'Visitor',
    REGISTERED_USER: 'Registered User',
    PLAYER: 'Player',
    TEAM_CAPTAIN: 'Team Captain',
    UNIVERSITY_MARKETING_MOD: 'University Marketing Moderator',
    UNIVERSITY_TOURNAMENT_MOD: 'University Tournament Moderator',
    AARDVARK_TOURNAMENT_MOD: 'Aardvark Tournament Moderator',
    ADMIN: 'Admin',
};

const UserProfileView = (props: Props) => {
    const {
        canEdit,
        handleSetEditProfile,
        profile,
        userId,
        refreshInfo,
        pendingTeams,
    } = props;

    const theme = useTheme();
    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const [leaveTeamButtonDisabled, setLeaveTeamButtonDisabled] =
        useState(false);

    const handleLeaveTeam = async () => {
        setLeaveTeamButtonDisabled(true);

        const { err, res } = await post('/api/participantProfile/leaveTeam', {
            userId,
            teamName: profile?.team?.name || '',
        });

        setLeaveTeamButtonDisabled(false);

        if (!res || err) {
            openNotification(
                err ?? `Error leaving team ${profile?.team?.name}`,
                'error'
            );
            return;
        }

        await refreshInfo();
        openNotification(`Successfully left ${profile?.team?.name}`, 'success');
    };

    const handleDeleteTeam = async () => {
        setLeaveTeamButtonDisabled(true);

        const { err, res } = await post('/api/team/delete', {
            teamName: profile?.team?.name || '',
            teamCaptainId: userId,
        });

        setLeaveTeamButtonDisabled(false);

        if (!res || err) {
            openNotification(
                err ?? `Error deleting team ${profile?.team?.name}`,
                'error'
            );
            return;
        }

        navigate('/');

        openNotification('Team deleted', 'info');
    };

    return (
        <Stack
            sx={{
                display: 'flex',
                marginBottom: '270px',
            }}
        >
            <ProfileBanner
                bgColor={globalStyleVars.mustardColor}
                canEdit={canEdit}
                setEdit={handleSetEditProfile}
                image={profile?.page?.picture}
                profile={profile}
            />

            <Stack
                spacing={{ lg: '180px' }}
                direction="row"
                sx={{
                    width: 'fit-content',
                    alignSelf: 'start',
                    // marginRight: '270px',
                    marginTop: '150px',
                    marginLeft: '245px',
                    [theme.breakpoints.down('lg')]: {
                        flexDirection: 'column',
                        textAlign: 'center',
                        margin: '150px auto 0 auto',
                    },
                    [theme.breakpoints.down('sm')]: {
                        width: '400px',
                    },
                }}
            >
                <Box
                    sx={{
                        [theme.breakpoints.down('lg')]: {
                            width: '550px',
                        },
                        [theme.breakpoints.down('sm')]: {
                            width: '400px',
                        },
                    }}
                >
                    <Stack spacing="24px">
                        <Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 'bold' }}
                            >
                                {profile?.display_name || 'No Username ™'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="card"
                                sx={{ fontStyle: 'italic' }}
                            >
                                {roleText[(profile?.role as Role) || 'VISITOR']}
                            </Typography>
                            <Typography variant="subtitle1">
                                {profile?.college?.name ||
                                    'The user is not part of a college'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <Stack
                    spacing="32px"
                    sx={{
                        whiteSpace: 'nowrap',
                        width: '550px',
                        [theme.breakpoints.down('lg')]: {
                            marginTop: '30px',
                        },
                        [theme.breakpoints.down('sm')]: {
                            width: '400px',
                        },
                    }}
                >
                    <Box
                        sx={{
                            whiteSpace: 'normal',
                        }}
                    >
                        <Typography variant="bold">About</Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                            }}
                        >
                            {profile?.page?.bio || 'N/A'}
                        </Typography>
                    </Box>
                    <Stack
                        spacing="32px"
                        sx={{
                            [theme.breakpoints.down('lg')]: {
                                alignItems: 'center',
                            },
                        }}
                    >
                        <Stack
                            spacing="16px"
                            sx={{
                                [theme.breakpoints.down('lg')]: {
                                    width: '100%',
                                },
                            }}
                        >
                            <Typography variant="bold">Team</Typography>
                            {profile?.team?.name && (
                                <>
                                    {canEdit && (
                                        <Typography>
                                            You may leave your current team.
                                        </Typography>
                                    )}
                                    <Divider />
                                </>
                            )}
                        </Stack>
                        <Stack
                            direction="row"
                            sx={{
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                [theme.breakpoints.down('sm')]: {
                                    flexDirection: 'column',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    [theme.breakpoints.down('sm')]: {
                                        whiteSpace: 'pre-line',
                                    },
                                }}
                            >
                                {(profile?.team?.name && (
                                    <InlineLink
                                        to={`/team/${profile.team.name}`}
                                        text={profile.team.name}
                                        sx={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            color: 'black',
                                            textDecoration: 'underline',
                                        }}
                                        underline="always"
                                    />
                                )) || (
                                    <>
                                        <Typography
                                            sx={{
                                                display: 'inline-block',
                                            }}
                                        >
                                            You are currently not in a team. You
                                            can{' '}
                                        </Typography>
                                        <InlineLink
                                            to="/team/create"
                                            text="create a team"
                                        />
                                        .
                                    </>
                                )}
                            </Box>
                            {canEdit && (
                                <>
                                    {profile?.team?.name && (
                                        <RoundedButton
                                            text={
                                                profile.role ===
                                                Role.TEAM_CAPTAIN
                                                    ? 'Delete Team'
                                                    : 'Leave Team'
                                            }
                                            backgroundColor={
                                                globalStyleVars.blue
                                            }
                                            borderColor={globalStyleVars.blue}
                                            color="white"
                                            disabled={leaveTeamButtonDisabled}
                                            onClick={
                                                profile.role ===
                                                Role.TEAM_CAPTAIN
                                                    ? handleDeleteTeam
                                                    : handleLeaveTeam
                                            }
                                            big
                                            sx={{
                                                [theme.breakpoints.down('sm')]:
                                                    {
                                                        marginTop: '20px',
                                                    },
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </Stack>
                    </Stack>
                    <Box>
                        {nullTruthyCheck(profile?.team) && canEdit && (
                            <ProfileTeamsList
                                teams={pendingTeams}
                                userId={userId || ''}
                                refreshInfo={refreshInfo}
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default UserProfileView;
