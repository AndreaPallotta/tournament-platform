import { TextField, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyleVars } from 'src/app/app';
import Base64Image from 'src/app/components/Base64Image';
import InputForm from 'src/app/components/InputForm';
import UploadBox from 'src/app/components/UploadBox';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { post } from 'src/app/services/api.service';
import { getImageType } from 'src/app/services/utils.service';
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

interface NewTournamentInfo {
    tournamentName: string;
    registerDeadline: string;
    startDate: string;
    endDate: string;
    bio: string;
    pictureBase64: string;
}

type NewTournamentInfoErrors = Record<keyof NewTournamentInfo, string>;
type NewTournamentInfoTouched = Record<keyof NewTournamentInfo, boolean>;

const fieldsNotRequired: Partial<Record<keyof NewTournamentInfo, boolean>> = {
    bio: true,
    pictureBase64: true,
};

const schema = yup.object().shape({
    tournamentName: tournamentNameValidation,
    registerDeadline: tournamentDeadlineValidation,
    startDate: tournamentStartValidation,
    endDate: tournamentEndValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

/**
 * UI component for the create tournament page.
 */
export default function CreateTournamentPage() {
    /*
        To-do:
            - allow at least users with the Tournament Admin role to add tournament info
                - tournament name
                - tournament description
                - tournament registration deadline
                - tournament start/end dates
            - allow at least users with the Tournament Admin role to edit/create Tournament Moderator accounts
                - edit/create usernames
                - edit/create first and last name
                - edit/create email
                - edit/create password (and confirm these passwords)
    */

    const { user } = useAuth();
    const openNotification = useOpenNotification();
    const navigate = useNavigate();
    const theme = useTheme();

    const [newTournamentInfo, setNewTournamentInfo] =
        useState<NewTournamentInfo>({
            tournamentName: '',
            registerDeadline: '',
            startDate: '',
            endDate: '',
            bio: '',
            pictureBase64: '',
        });

    const [errors, setErrors] = useState<NewTournamentInfoErrors>({
        tournamentName: '',
        registerDeadline: '',
        startDate: '',
        endDate: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] =
        useState<NewTournamentInfoTouched>({
            tournamentName: false,
            registerDeadline: false,
            startDate: false,
            endDate: false,
            bio: false,
            pictureBase64: false,
        });

    const [isFullURI, setIsFullURI] = useState(false);

    const [createButtonDisabled, setCreateButtonDisabled] = useState(false);

    const handleFieldsChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        setNewTournamentInfo((prev: NewTournamentInfo) => ({
            ...prev,
            [name]: value,
        }));

        setIsFieldTouched((prev: Record<keyof NewTournamentInfo, boolean>) => ({
            ...prev,
            [name]: true,
        }));

        try {
            await schema.validateAt(name, {
                ...newTournamentInfo,
                [name]: value,
            });

            setErrors((prev: Record<keyof NewTournamentInfo, string>) => ({
                ...prev,
                [name]: '',
            }));
        } catch (err: any) {
            setErrors((prev: Record<keyof NewTournamentInfo, string>) => ({
                ...prev,
                [name]: err.message,
            }));
        }
    };

    const handleSetTournamentPicture = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picture = event.target.files?.[0];

        if (!picture) {
            setNewTournamentInfo((prev: NewTournamentInfo) => ({
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

            setNewTournamentInfo((prev: NewTournamentInfo) => ({
                ...prev,
                pictureBase64: type === null ? pictureBase64 : result,
            }));

            setIsFieldTouched(
                (prev: Record<keyof NewTournamentInfo, boolean>) => ({
                    ...prev,
                    pictureBase64: true,
                })
            );
        };
    };

    const renderImage = useCallback(() => {
        if (newTournamentInfo.pictureBase64) {
            return (
                <Base64Image
                    src={newTournamentInfo.pictureBase64}
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
                width="100%"
                height="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [newTournamentInfo.pictureBase64]);

    const handleCreateTournament = async () => {
        setCreateButtonDisabled(true);

        const { err, res } = await post(`/api/tournament/create`, {
            email: user?.email,
            ...newTournamentInfo,
        });

        setCreateButtonDisabled(false);

        if (!res || err) {
            openNotification(err ?? 'Error creating tournament', 'error');
            return;
        }

        navigate(`/tournament/${res.tournament.name}`);
        openNotification('Tournament created!', 'success');
    };

    return (
        <InputForm
            title="Create Tournament"
            description="This will create a main tournament. If one already
            exists and has not finished yet, you will not be able to
            create a new main tournament."
            inputs={[
                <TextField
                    label="Tournament Name"
                    name="tournamentName"
                    required
                    placeholder="Tournament Name"
                    onChange={handleFieldsChange}
                    margin="normal"
                    fullWidth
                    autoFocus
                    error={!!errors.tournamentName}
                    helperText={errors.tournamentName}
                    inputProps={{ maxLength: 30 }}
                />,
                <TextField
                    label="Registration Deadline"
                    name="registerDeadline"
                    type="datetime-local"
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    error={!!errors.registerDeadline}
                    helperText={errors.registerDeadline}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />,
                <TextField
                    label="Start Date"
                    name="startDate"
                    type="datetime-local"
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />,
                <TextField
                    label="End Date"
                    name="endDate"
                    type="datetime-local"
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />,
                <TextField
                    label="About Section"
                    name="bio"
                    placeholder="Describe the tournament"
                    fullWidth
                    variant="outlined"
                    onChange={handleFieldsChange}
                    error={!!errors.bio}
                    helperText={errors.bio}
                    inputProps={{ maxLength: 300 }}
                    multiline
                    rows={10}
                />,
            ]}
            buttons={[
                {
                    text: 'Create Tournament',
                    type: 'submit',
                    backgroundColor: globalStyleVars.blue,
                    borderColor: globalStyleVars.blue,
                    color: 'white',
                    disabled:
                        isFormInvalid(
                            newTournamentInfo,
                            errors,
                            isFieldTouched,
                            fieldsNotRequired
                        ) ||
                        !Object.values(isFieldTouched).some(
                            (touched) => touched === true
                        ) ||
                        createButtonDisabled,
                    onClick: handleCreateTournament,
                },
            ]}
            sx={{
                width: '800px',
                [theme.breakpoints.down('md')]: {
                    width: '500px',
                },
            }}
        >
            <UploadBox
                inputId="upload-tournament-picture"
                accept="image/*"
                handler={handleSetTournamentPicture}
                sx={{
                    width: '100%',
                }}
            >
                {renderImage()}
            </UploadBox>
        </InputForm>
    );
}
