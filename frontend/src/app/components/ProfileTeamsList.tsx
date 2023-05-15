import { useMediaQuery, useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/system/Stack';
import React, { useState } from 'react';
import { globalStyleVars } from '../app';
import { useAuth } from '../contexts/authContext';
import { useOpenNotification } from '../hooks/useNotification';
import { post } from '../services/api.service';
import Modal from './Modal';
import RoundedButton, { RoundedButtonText } from './RoundedButton';

interface Props {
    teams: string[];
    userId: string;
    refreshInfo: () => Promise<void>;
}

interface ModalProps {
    open: boolean;
    teamName: string;
}

const ProfileTeamsList = ({ teams, userId, refreshInfo }: Props) => {
    const [modal, setModal] = React.useState<ModalProps>({
        open: false,
        teamName: '',
    });

    const { setAuthToken } = useAuth();
    const theme = useTheme();
    const openNotification = useOpenNotification();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [joinButtonDisabled, setJoinButtonDisabled] = useState(false);
    const [rejectButtonDisabled, setRejectButtonDisabled] = useState(false);

    const handleJoinTeam = async (teamName: string) => {
        setJoinButtonDisabled(true);

        const { err, res } = await post(
            '/api/participantProfile/acceptInvite',
            {
                userId,
                teamName,
            }
        );

        setJoinButtonDisabled(false);

        if (!res || err) {
            openNotification(err || `Error joining team ${teamName}`, 'error');
            return;
        }

        if (res.maxPlayers) {
            openNotification(res.maxPlayers, 'error');
            return;
        }

        if (res?.authToken) {
            setAuthToken(res.authToken);
        }

        await refreshInfo();
        openNotification(`Successfully joined '${teamName}!'`, 'success');
    };
    const handleRejectTeam = async () => {
        setRejectButtonDisabled(true);

        const { err, res } = await post(
            '/api/participantProfile/rejectInvite',
            {
                userId,
                teamName: modal.teamName,
            }
        );

        setRejectButtonDisabled(false);

        if (!res || err) {
            openNotification(
                err ?? `Error rejecting invite from ${modal.teamName}}`,
                'error'
            );
            return;
        }

        if (res?.authToken) {
            setAuthToken(res.authToken);
        }

        await refreshInfo();
        openNotification(
            `Successfully rejected invite from ${modal.teamName}`,
            'success'
        );
        handleRejectModal(false);
    };

    const handleRejectModal = (open: boolean, name?: string) => {
        setModal({
            open,
            teamName: name || '',
        });
    };

    return (
        <Stack
            spacing="32px"
            sx={{
                marginTop: '100px',
                whiteSpace: 'normal',
            }}
        >
            <Stack
                spacing="16px"
                sx={{
                    width: '550px',
                    [theme.breakpoints.down('sm')]: {
                        width: '400px',
                    },
                }}
            >
                <Typography variant="bold">Team Invites</Typography>
                <Typography>
                    You can accept any pending invites that appear here.
                </Typography>
            </Stack>
            <Divider />
            <List
                disablePadding
                sx={{
                    width: '100%',
                    maxHeight: '300px',
                    overflowY: 'scroll',
                }}
            >
                {teams.map((team: string, index: number) => (
                    <React.Fragment key={team}>
                        <ListItem
                            disableGutters
                            disablePadding
                            sx={{
                                alignItems: 'center',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            <Stack
                                direction="row"
                                sx={{
                                    alignItems: 'center',
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    [theme.breakpoints.down('sm')]: {
                                        flexDirection: 'column',
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        textAlign: 'start',
                                    }}
                                >
                                    {team}
                                </Typography>
                                <Stack
                                    spacing={{ xs: 2, sm: 1 }}
                                    direction={{ xs: 'column', sm: 'row' }}
                                    sx={{
                                        [theme.breakpoints.down('sm')]: {
                                            marginTop: '20px',
                                            alignItems: 'center',
                                        },
                                    }}
                                >
                                    <RoundedButton
                                        text="Join Team"
                                        big
                                        disabled={joinButtonDisabled}
                                        backgroundColor={globalStyleVars.blue}
                                        borderColor={globalStyleVars.blue}
                                        color="white"
                                        onClick={() => {
                                            handleJoinTeam(team);
                                        }}
                                    />
                                    <RoundedButtonText
                                        text="Decline"
                                        onClick={() => {
                                            handleRejectModal(true, team);
                                        }}
                                        big={isSmallScreen}
                                    />
                                </Stack>
                            </Stack>
                        </ListItem>
                        {index < teams.length - 1 && (
                            <Divider sx={{ my: '32px' }} />
                        )}
                    </React.Fragment>
                ))}
            </List>
            <Modal
                type="warning"
                open={modal.open}
                onClose={() => {
                    handleRejectModal(false);
                    setRejectButtonDisabled(false);
                }}
                ariaDescribedBy="modal-description"
                ariaLabelledBy="modal-label"
            >
                <Typography>Reject invite from?</Typography>
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
                        text="Reject"
                        onClick={() => {
                            handleRejectTeam();
                        }}
                        disabled={rejectButtonDisabled}
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
                            handleRejectModal(false);
                            setRejectButtonDisabled(false);
                        }}
                    />
                </Stack>
            </Modal>
        </Stack>
    );
};

export default ProfileTeamsList;
