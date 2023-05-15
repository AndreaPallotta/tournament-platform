import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Tooltip,
    useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyleVars } from 'src/app/app';
import Base64Image from 'src/app/components/Base64Image';
import InputForm from 'src/app/components/InputForm';
import UploadBox from 'src/app/components/UploadBox';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get, post } from 'src/app/services/api.service';
import { capitalizeFirst, getImageType } from 'src/app/services/utils.service';
import { College } from 'src/app/types/college.type';
import {
    bioValidation,
    collegeNameValidation,
    isFormInvalid,
    pictureValidation,
    teamNameValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';

interface NewTeamInfo {
    teamName: string;
    collegeName: string;
    bio: string;
    pictureBase64: string;
}

type NewTeamInfoErrors = Record<keyof NewTeamInfo, string>;
type NewTeamInfoTouched = Record<keyof NewTeamInfo, boolean>;

const fieldsNotRequired: Partial<Record<keyof NewTeamInfo, boolean>> = {
    bio: true,
    pictureBase64: true,
};

const schema = yup.object().shape({
    teamName: teamNameValidation,
    collegeName: collegeNameValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

/**
 * UI component for the team creation page.
 */
export default function CreateTeamPage() {
    /*
        To-do:
            - allow at least users with the Player role to provide team info
                - team name
                - team picture
                - team description
                - college name
            - allow at least users with the Player role to invite players
                - search for invitee by email
                - invite invitee by email
            - allow at least users with the Player role to remove players from the team
            - this team should automatically create a new page for its representative university upon creation (if the university page does not exist yet)
    */

    const openNotification = useOpenNotification();
    const navigate = useNavigate();
    const theme = useTheme();
    const { user, setAuthToken } = useAuth();

    const [newTeamInfo, setNewTeamInfo] = useState<NewTeamInfo>({
        teamName: '',
        collegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [errors, setErrors] = useState<NewTeamInfoErrors>({
        teamName: '',
        collegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] = useState<NewTeamInfoTouched>({
        teamName: false,
        collegeName: false,
        bio: false,
        pictureBase64: false,
    });

    const [isFullURI, setIsFullURI] = useState(false);

    const [createButtonDisabled, setCreateButtonDisabled] = useState(false);

    const [colleges, setColleges] = useState<College[]>([]);

    const handleFieldsChange = async (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>
    ) => {
        const { name, value } = event.target;

        setNewTeamInfo((prev: NewTeamInfo) => ({
            ...prev,
            [name]: value,
        }));

        setIsFieldTouched((prev: Record<keyof NewTeamInfo, boolean>) => ({
            ...prev,
            [name]: true,
        }));

        try {
            await schema.validateAt(name, { ...newTeamInfo, [name]: value });

            setErrors((prev: Record<keyof NewTeamInfo, string>) => ({
                ...prev,
                [name]: '',
            }));
        } catch (err: any) {
            setErrors((prev: Record<keyof NewTeamInfo, string>) => ({
                ...prev,
                [name]: err.message,
            }));
        }
    };

    const handleSetTeamPicture = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picture = event.target.files?.[0];

        if (!picture) {
            setNewTeamInfo((prev: NewTeamInfo) => ({
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

            setNewTeamInfo((prev: NewTeamInfo) => ({
                ...prev,
                pictureBase64: type === null ? pictureBase64 : result,
            }));

            setIsFieldTouched((prev: Record<keyof NewTeamInfo, boolean>) => ({
                ...prev,
                pictureBase64: true,
            }));
        };
    };

    const renderImage = useCallback(() => {
        if (newTeamInfo.pictureBase64) {
            return (
                <Base64Image
                    src={newTeamInfo.pictureBase64}
                    isFullURI={isFullURI}
                    alt="Team Picture"
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
                width="100%"
                height="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [newTeamInfo.pictureBase64]);

    const handleCreateTeam = async () => {
        setCreateButtonDisabled(true);

        const { err, res } = await post(`/api/team/create`, {
            userId: user?.id,
            ...newTeamInfo,
        });

        setCreateButtonDisabled(false);

        if (!res || err) {
            openNotification(err ?? 'Error creating team', 'error');
            return;
        }

        if (res?.authToken) {
            setAuthToken(res.authToken);
        }

        const creationMessage = res.team?.tournament_id
            ? 'Team created!'
            : 'Team has been created, but cannot join the ongoing tournament right now.';

        navigate(`/team/${res.team.name}`);
        openNotification(creationMessage, 'success');
    };

    const getCollegeInfo = async () => {
        const { err, res } = await get('/api/college/colleges');

        if (err || !res) {
            openNotification(
                err ?? 'Error retrieving college information',
                'error'
            );
        }

        setColleges(res?.colleges);
    };

    useEffect(() => {
        getCollegeInfo();
    }, []);

    return (
        <InputForm
            title="Create Team"
            description={
                !colleges?.length
                    ? 'Teams cannot be created right now since no colleges exist at the moment.'
                    : 'If you are already in a team, you will not be able to create a new one. Also, you need to be in a college to create a team.'
            }
            inputs={[
                <TextField
                    label="Team Name"
                    name="teamName"
                    required
                    placeholder="Team Name"
                    onChange={handleFieldsChange}
                    margin="normal"
                    fullWidth
                    autoFocus
                    error={!!errors.teamName}
                    helperText={errors.teamName}
                    inputProps={{ maxLength: 20 }}
                />,
                <Tooltip
                    title={
                        !colleges?.length
                            ? 'Teams cannot be created right now since no colleges exist at the moment.'
                            : undefined
                    }
                    followCursor
                >
                    <FormControl fullWidth>
                        <InputLabel>College</InputLabel>
                        <Select
                            name="collegeName"
                            label="College"
                            onChange={handleFieldsChange}
                            value={newTeamInfo.collegeName || ''}
                            disabled={colleges && colleges.length < 1}
                            fullWidth
                            sx={{
                                textAlign: 'start',
                            }}
                            error={!!errors.collegeName}
                            required
                        >
                            {colleges.map((college) => (
                                <MenuItem key={college.id} value={college.name}>
                                    {college.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Tooltip>,
                <TextField
                    label="About Section"
                    name="bio"
                    placeholder="Tell us about your team"
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
                    text: 'Create Team',
                    type: 'submit',
                    backgroundColor: globalStyleVars.blue,
                    borderColor: globalStyleVars.blue,
                    color: 'white',
                    disabled:
                        isFormInvalid(
                            newTeamInfo,
                            errors,
                            isFieldTouched,
                            fieldsNotRequired
                        ) ||
                        !Object.values(isFieldTouched).some(
                            (touched) => touched === true
                        ) ||
                        createButtonDisabled,
                    onClick: handleCreateTeam,
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
                inputId="upload-team-picture"
                accept="image/*"
                handler={handleSetTeamPicture}
                sx={{
                    width: '100%',
                }}
            >
                {renderImage()}
            </UploadBox>
        </InputForm>
    );
}
