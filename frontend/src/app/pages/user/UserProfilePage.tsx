/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@mui/material';
import Cookies from 'js-cookie';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doesRoleHavePermission } from 'src/app/services/utils.service';
import { College } from 'src/app/types/college.type';
import { useAuth } from '../../contexts/authContext';
import { useOpenNotification } from '../../hooks/useNotification';
import { clearSession, get, post } from '../../services/api.service';
import { Role } from '../../types/enums';
import { User } from '../../types/user.types';
import UserProfileEdit from './UserProfileEdit';
import UserProfileView from './UserProfileView';

const UserProfilePage = () => {
    const [profile, setProfile] = React.useState<User>();
    const [pendingTeams, setPendingTeams] = React.useState<string[]>([]);
    const [colleges, setColleges] = React.useState<College[]>([]);
    const [isEdit, setIsEdit] = React.useState(false);
    const [userCanEdit, setUserCanEdit] = React.useState(false);

    const { user, role, setRole, setUser, setAuthToken } = useAuth();
    const openNotification = useOpenNotification();
    const { id } = useParams();
    const navigate = useNavigate();

    const canEdit = () => {
        if (user?.id === id || userCanEdit) {
            return true;
        }

        return doesRoleHavePermission(
            role,
            Role.AARDVARK_TOURNAMENT_MOD,
            false
        );
    };

    const handleSetEditProfile = (isEdit: boolean) => {
        setIsEdit(isEdit);
    };

    const getUserInfo = React.useCallback(async () => {
        const { err, res } = await get('/api/participantProfile', {
            userId: id,
            email: user?.email,
        });

        if (err || !res) {
            openNotification(
                err ?? 'Error retrieving user information',
                'error'
            );
        }

        setUserCanEdit(res?.userCanEdit);
        setProfile(res?.user);
        setPendingTeams(res?.pendingTeams ?? []);
        setColleges(res?.colleges);
    }, [id]);

    const handleDeleteAccount = async () => {
        const { err, res } = await post('/api/auth/deleteAccount', {
            userId: user?.id,
            ...(user?.team_id && { teamId: user?.team_id })
        });

        if (err || !res) {
            openNotification(err ?? 'Error deleting account', 'error');
            return;
        }

        openNotification('Successfully deleted account', 'success');
        clearSession();
        setRole(undefined);
        setUser(undefined);
        setAuthToken(undefined);
        navigate('/');
    };

    React.useEffect(() => {
        getUserInfo().then(() => {
            handleSetEditProfile(false);
        });
    }, [id]);

    return (
        <>
            {isEdit ? (
                <UserProfileEdit
                    profile={profile}
                    handleSetEditProfile={handleSetEditProfile}
                    userId={id || ''}
                    refreshInfo={getUserInfo}
                    colleges={colleges}
                />
            ) : (
                <UserProfileView
                    canEdit={canEdit()}
                    handleSetEditProfile={handleSetEditProfile}
                    profile={profile}
                    userId={id || ''}
                    refreshInfo={getUserInfo}
                    pendingTeams={pendingTeams}
                />
            )}
            {id === user?.id && (
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    sx={{ padding: 3, color: 'white' }}
                    onClick={handleDeleteAccount}
                >
                    Delete Account
                </Button>
            )}
        </>
    );
};

export default UserProfilePage;
