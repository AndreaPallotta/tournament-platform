import { Close } from '@mui/icons-material';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Tooltip,
    useTheme,
} from '@mui/material';
import Container from '@mui/material/Container';
import React from 'react';
import CircleButton from 'src/app/components/CircleButton';
import { College } from 'src/app/types/college.type';
import * as yup from 'yup';
import { globalStyleVars } from '../../app';
import Base64Image from '../../components/Base64Image';
import ProfileEditBanner from '../../components/ProfileEditBanner';
import RoundedButton from '../../components/RoundedButton';
import { useOpenNotification } from '../../hooks/useNotification';
import { post } from '../../services/api.service';
import { getImageType } from '../../services/utils.service';
import { User } from '../../types/user.types';
import {
    bioValidation,
    collegeNameValidation,
    displayNameValidation,
    isFormInvalid,
    pictureValidation,
} from '../../validation/yup.validation';

interface Props {
    profile: User | undefined;
    handleSetEditProfile: (value: boolean) => void;
    userId: string;
    refreshInfo: () => Promise<void>;
    colleges: College[];
}

interface UpdatedInfo {
    displayName: string;
    collegeName: string;
    bio: string;
    pictureBase64: string | undefined;
}

type UpdatedInfoErrors = Record<keyof UpdatedInfo, string>;
type UpdatedInfoTouched = Record<keyof UpdatedInfo, boolean>;

const schema = yup.object().shape({
    displayName: displayNameValidation,
    collegeName: collegeNameValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

const fieldsNotRequired: Partial<Record<keyof UpdatedInfo, boolean>> = {
    collegeName: true,
    bio: true,
    pictureBase64: true,
};

const UserProfileEdit = ({
    profile,
    handleSetEditProfile,
    userId,
    refreshInfo,
    colleges,
}: Props) => {
    const [updatedInfo, setUpdatedInfo] = React.useState<UpdatedInfo>({
        displayName: profile?.display_name ?? '',
        collegeName: profile?.college?.name ?? '',
        bio: profile?.page?.bio ?? '',
        pictureBase64: profile?.page?.picture,
    });

    const [errors, setErrors] = React.useState<UpdatedInfoErrors>({
        displayName: '',
        collegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] =
        React.useState<UpdatedInfoTouched>({
            displayName: false,
            collegeName: false,
            bio: false,
            pictureBase64: false,
        });

    const [isFullURI, setIsFullURI] = React.useState(false);

    const theme = useTheme();
    const openNotification = useOpenNotification();

    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);

    const renderImage = () => {
        if (updatedInfo.pictureBase64) {
            return (
                <Base64Image
                    src={updatedInfo.pictureBase64}
                    isFullURI={isFullURI}
                    alt="Profile"
                    height="auto"
                    width="350px"
                    style={{
                        border: '8px solid white',
                        borderRadius: '6px',
                    }}
                />
            );
        }

        return (
            <img
                src="/placeholder.jpeg"
                alt="Profile Placeholder"
                height="auto"
                width="350px"
                style={{
                    border: '8px solid white',
                    borderRadius: '6px',
                }}
            />
        );
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

    const handleResetImage = () => {
        setUpdatedInfo((prev: UpdatedInfo) => ({
            ...prev,
            pictureBase64: '',
        }));
        setIsFullURI(false);
    };

    const handleSetProfilePicture = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picture = event.target.files?.[0];

        if (!picture) {
            openNotification('Selected image is not valid', 'error');
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

    const handleOnSave = async () => {
        setSaveButtonDisabled(true);

        const touchedBody = Object.keys(isFieldTouched).reduce((acc: any, key: any) => {
            if (isFieldTouched[key as keyof UpdatedInfoTouched]) {
                acc[key] = updatedInfo[key as keyof UpdatedInfo];
            }
            return acc;
        }, {} as any);

        const { err, res } = await post('/api/participantProfile/updateInfo', {
            userId,
            ...touchedBody,
        });

        setSaveButtonDisabled(false);

        if (err || !res) {
            openNotification(
                err || 'Error updating profile information',
                'error'
            );
            return;
        }

        await refreshInfo();
        handleSetEditProfile(false);

        openNotification('User saved!', 'success');
    };

    const handleOnCancel = () => {
        handleSetEditProfile(false);
    };

    return (
        <Box
            sx={{
                marginBottom: '250px',
            }}
        >
            <ProfileEditBanner
                bgColor={globalStyleVars.mustardColor}
                handleOnSave={handleOnSave}
                handleOnCancel={handleOnCancel}
                disabled={
                    isFormInvalid(
                        updatedInfo,
                        errors,
                        isFieldTouched,
                        fieldsNotRequired
                    ) || saveButtonDisabled
                }
            />
            <Container
                sx={{
                    position: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'space-around',
                    textAlign: 'center',
                    flexDirection: 'row',
                    marginTop: '150px',
                }}
            >
                <Stack
                    direction="row"
                    spacing={{ md: '80px' }}
                    sx={{
                        [theme.breakpoints.down('md')]: {
                            flexDirection: 'column',
                        },
                    }}
                >
                    <Stack
                        spacing={1}
                        sx={{
                            [theme.breakpoints.down('md')]: {
                                alignItems: 'center',
                            },
                            position: 'relative',
                        }}
                    >
                        {renderImage()}
                        {updatedInfo.pictureBase64 && (
                            <CircleButton
                                icon={<Close />}
                                onClick={handleResetImage}
                                sx={{
                                    position: 'absolute',
                                    top: `calc((${theme.spacing(1)} + ${
                                        theme.typography.fontSize
                                    }px) * -1)`,
                                    right: `calc((${theme.spacing(1)} + ${
                                        theme.typography.fontSize
                                    }px) * -1)`,
                                    boxShadow:
                                        '0px 2px 1px rgba(0, 0, 0, 0.25)',
                                }}
                            />
                        )}
                        <RoundedButton
                            text="Select Photo"
                            backgroundColor={globalStyleVars.blue}
                            color="white"
                            onClick={() =>
                                document
                                    .getElementById('set-profile-picture')
                                    ?.click()
                            }
                            sx={{
                                width: '350px',
                                borderColor: globalStyleVars.blue,
                            }}
                        />
                        <input
                            id="set-profile-picture"
                            name="picture"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleSetProfilePicture}
                        />
                    </Stack>
                    <Stack
                        spacing={4}
                        sx={{
                            width: '100%',
                            [theme.breakpoints.down('md')]: {
                                marginTop: '30px',
                            },
                        }}
                    >
                        <TextField
                            label="Display Name"
                            name="displayName"
                            value={updatedInfo.displayName ?? ''}
                            required
                            onChange={handleFieldsChange}
                            margin="normal"
                            fullWidth
                            autoFocus
                            autoComplete="name"
                            error={!!errors.displayName}
                            helperText={errors.displayName}
                        />
                        <Tooltip
                            followCursor
                            title={(() => {
                                if (!colleges?.length) {
                                    return `It looks like there are no colleges to choose from right now`;
                                }
                                if (profile?.team) {
                                    return 'You cannot switch colleges while in a team. Leave the team first';
                                }
                                if (profile?.college?.tournament?.parent_id) {
                                    return `You cannot switch colleges while competing in a tournament`;
                                }
                            })()}
                        >
                            <FormControl
                                disabled={
                                    (colleges && colleges.length < 1) ||
                                    !!profile?.team
                                }
                            >
                                <InputLabel>Colleges</InputLabel>
                                <Select
                                    name="collegeName"
                                    label="Colleges"
                                    value={updatedInfo.collegeName || ''}
                                    onChange={handleFieldsChange}
                                    required
                                    sx={{
                                        textAlign: 'start',
                                    }}
                                    error={!!errors.collegeName}
                                >
                                    {colleges.map((college: College) => (
                                        <MenuItem
                                            key={college.id}
                                            value={college.name}
                                        >
                                            {college.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Tooltip>
                        <TextField
                            label="About"
                            name="bio"
                            value={updatedInfo.bio}
                            onChange={handleFieldsChange}
                            placeholder="Tell us about yourself"
                            multiline
                            rows={5}
                            margin="normal"
                            fullWidth
                            error={!!errors.bio}
                            helperText={errors.bio}
                        />
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default UserProfileEdit;
