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
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useCallback, useEffect, useState } from 'react';
import { To, useNavigate, useParams } from 'react-router-dom';
import Base64Image from 'src/app/components/Base64Image';
import Bracket from 'src/app/components/Bracket/Bracket';
import PageAboutSection from 'src/app/components/PageAboutSection';
import PageBanner from 'src/app/components/PageBanner';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { get, post } from 'src/app/services/api.service';
import {
    capitalizeFirst,
    doesRoleHavePermission,
    getImageType,
} from 'src/app/services/utils.service';
import { College } from 'src/app/types/college.type';
import { Role, TournamentStatus } from 'src/app/types/enums';
import { Team } from 'src/app/types/team.types';
import {
    bioValidation,
    collegeNameValidation,
    isFormInvalid,
    pictureValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';

interface UpdatedInfo {
    newCollegeName: string;
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
    newCollegeName: collegeNameValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

/**
 * UI component for the university page.
 */
export default function UniversityPage() {
    /*
        To-do:
            - allow at least users with the Spectator role to view teams competing from this university
                - view team picture
                - view snippets of info about the teams members upon hover?
            - allow at least users with the Spectator role to view university info
                - university logo
                - description
            - allow at least users with the Spectator role to view current matches this university is partaking in
                - show snippet of when match is, the team playing, opponent team playing, and who is on each team
            - allow at least users with the University Marketing Member role to edit university information
                - edit description
                - edit logo
            - - allow at least users with the Spectator role to search for teams
    */

    const theme = useTheme();
    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const { user, role } = useAuth();
    const { name } = useParams();

    const [isFullURI, setIsFullURI] = useState(false);

    const [college, setCollege] = useState<College>({} as College);

    const [updatedInfo, setUpdatedInfo] = useState<UpdatedInfo>({
        newCollegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] = useState<UpdatedInfoTouched>({
        newCollegeName: false,
        bio: false,
        pictureBase64: false,
    });

    const [errors, setErrors] = useState<UpdatedInfoErrors>({
        newCollegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

    const [userCanEdit, setUserCanEdit] = useState(false);

    const getCollegeInfo = useCallback(
        async (newCollegeName?: string) => {
            const { err, res } = await get('/api/college', {
                collegeName: newCollegeName ? newCollegeName : name,
                email: user?.email,
            });

            if (err || !res) {
                openNotification(
                    err ?? 'Error retrieving college information',
                    'error'
                );
            }

            if (res?.noCollegeName) {
                if (res?.noCollegeName.redirectCollege) {
                    navigate(
                        `/college/${res.noCollegeName.redirectCollege.name}`
                    );
                    return;
                }

                if (res?.noCollegeName.userCanCreateCollege) {
                    navigate('/college/create');

                    if (
                        role === Role.UNIVERSITY_TOURNAMENT_MOD ||
                        role === Role.UNIVERSITY_MARKETING_MOD
                    ) {
                        openNotification(
                            'You are not managing a college. Please create one.',
                            'info'
                        );
                    }
                } else {
                    navigate(-1);

                    openNotification(
                        'You are not in a college at the moment.',
                        'info'
                    );
                }

                return;
            }

            setIsFullURI(false);
            setCollege(res?.college);
            setUserCanEdit(res?.userCanEdit);

            setUpdatedInfo({
                newCollegeName: res?.college.name,
                bio: res?.college.page?.bio ?? '',
                pictureBase64: res?.college.page?.picture,
            });
        },
        [name]
    );

    const handleSetCollegePicture = async (
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
                    alt="College Picture"
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
                alt="College Placeholder"
                height="auto"
                width="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [updatedInfo.pictureBase64]);

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

    const handleSaveCollege = async () => {
        setSaveButtonDisabled(true);

        const touchedInfo = Object.keys(isFieldTouched).filter(
            (key) => isFieldTouched[key as keyof UpdatedInfoTouched]
        );

        const { err, res } = await post(`/api/college/edit`, {
            collegeName: name,
            ...Object.fromEntries(
                Object.entries(updatedInfo).filter(([key]) =>
                    touchedInfo.includes(key)
                )
            ),
        });

        setIsEditing(false);

        if (!res || err) {
            openNotification(err ?? 'Error updating college', 'error');
            return;
        }

        setSaveButtonDisabled(false);

        if (res.college.name !== name) {
            navigate(`/college/${res.college.name}`, {
                replace: true,
                preventScrollReset: true,
            });

            await getCollegeInfo(res.college.name);
        } else {
            await getCollegeInfo();
        }

        openNotification('College saved!', 'success');
    };

    const resetPageEditing = () => {
        setUpdatedInfo({
            newCollegeName: college.name ?? '',
            bio: college.page?.bio ?? '',
            pictureBase64: college.page?.picture ?? '',
        });

        setIsFieldTouched({
            newCollegeName: false,
            bio: false,
            pictureBase64: false,
        });

        setErrors({
            newCollegeName: '',
            bio: '',
            pictureBase64: '',
        });
    };

    useEffect(() => {
        getCollegeInfo().then(() => {
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

    return (
        <Stack>
            <PageBanner
                title={college?.name}
                canEdit={canEdit()}
                extraText={
                    college?.tournament
                        ? `Participating in the ${college.tournament?.name} tournament.`
                        : 'This college is not participating in a tournament.'
                }
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                extraEditingText="People viewing the college will see the following
                information"
                titleField={
                    <TextField
                        name="newCollegeName"
                        label="College Name"
                        autoFocus
                        required
                        defaultValue={updatedInfo.newCollegeName || ''}
                        placeholder="College name"
                        variant="outlined"
                        onChange={handleFieldsChange}
                        error={!!errors.newCollegeName}
                        helperText={errors.newCollegeName}
                        inputProps={{ maxLength: 60 }}
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
                handleSave={handleSaveCollege}
            />

            <PageAboutSection
                isEditing={isEditing}
                setPictureHandler={handleSetCollegePicture}
                imageComponent={renderImage()}
                bio={college?.page?.bio}
                aboutField={
                    <TextField
                        label="About Section"
                        name="bio"
                        defaultValue={college?.page?.bio}
                        placeholder="Describe the college"
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
            {college?.tournament_id && (
                <Stack padding="64px" spacing="40px">
                    <Typography variant="bold-title">
                        Teams From {college.name} ({college.teams?.length})
                    </Typography>
                    <Grid2
                        container
                        columnSpacing="55px"
                        rowSpacing="40px"
                        sx={{
                            justifyContent: 'center',
                        }}
                    >
                        {college.teams?.map((team: Team) => {
                            return (
                                <Grid2
                                    sm={12}
                                    md={6}
                                    xl={4}
                                    key={team.name}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        navigate(`/team/${team.name}`, {
                                            preventScrollReset: true,
                                        });
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

            {college.tournament_id && (
                <>
                    {(college.tournament.status === TournamentStatus.IN_PROGRESS && (
                        <Bracket collegeId={college.id} />
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
        </Stack>
    );
}
