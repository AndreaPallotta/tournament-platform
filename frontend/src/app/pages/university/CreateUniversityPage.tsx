/* eslint-disable react-hooks/exhaustive-deps */
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
    collegeNameValidation,
    isFormInvalid,
    pictureValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';

interface NewCollegeInfo {
    collegeName: string;
    bio: string;
    pictureBase64: string;
}

type NewCollegeInfoErrors = Record<keyof NewCollegeInfo, string>;
type NewCollegeInfoTouched = Record<keyof NewCollegeInfo, boolean>;

const fieldsNotRequired: Partial<Record<keyof NewCollegeInfo, boolean>> = {
    bio: true,
    pictureBase64: true,
};

const schema = yup.object().shape({
    collegeName: collegeNameValidation,
    bio: bioValidation,
    pictureBase64: pictureValidation,
});

/**
 * UI component for the create college page.
 */
export default function CreateUniversityPage() {
    const openNotification = useOpenNotification();
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();

    const [newCollegeInfo, setNewCollegeInfo] = useState<NewCollegeInfo>({
        collegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [errors, setErrors] = useState<NewCollegeInfoErrors>({
        collegeName: '',
        bio: '',
        pictureBase64: '',
    });

    const [isFieldTouched, setIsFieldTouched] = useState<NewCollegeInfoTouched>(
        {
            collegeName: false,
            bio: false,
            pictureBase64: false,
        }
    );

    const [isFullURI, setIsFullURI] = useState(false);

    const [createButtonDisabled, setCreateButtonDisabled] = useState(false);

    const handleFieldsChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        setNewCollegeInfo((prev: NewCollegeInfo) => ({
            ...prev,
            [name]: value,
        }));

        setIsFieldTouched((prev: Record<keyof NewCollegeInfo, boolean>) => ({
            ...prev,
            [name]: true,
        }));

        try {
            await schema.validateAt(name, {
                ...newCollegeInfo,
                [name]: value,
            });

            setErrors((prev: Record<keyof NewCollegeInfo, string>) => ({
                ...prev,
                [name]: '',
            }));
        } catch (err: any) {
            setErrors((prev: Record<keyof NewCollegeInfo, string>) => ({
                ...prev,
                [name]: err.message,
            }));
        }
    };

    const handleSetCollegePicture = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picture = event.target.files?.[0];

        if (!picture) {
            setNewCollegeInfo((prev: NewCollegeInfo) => ({
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

            setNewCollegeInfo((prev: NewCollegeInfo) => ({
                ...prev,
                pictureBase64: type === null ? pictureBase64 : result,
            }));

            setIsFieldTouched(
                (prev: Record<keyof NewCollegeInfo, boolean>) => ({
                    ...prev,
                    pictureBase64: true,
                })
            );
        };
    };

    const renderImage = useCallback(() => {
        if (newCollegeInfo.pictureBase64) {
            return (
                <Base64Image
                    src={newCollegeInfo.pictureBase64}
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
                width="100%"
                height="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        );
    }, [newCollegeInfo.pictureBase64]);

    const handleCreateCollege = async () => {
        setCreateButtonDisabled(true);

        const { err, res } = await post(`/api/college/create`, {
            userId: user?.id,
            ...newCollegeInfo,
        });

        setCreateButtonDisabled(false);

        if (!res || err) {
            openNotification(err ?? 'Error creating college', 'error');
            return;
        }

        const creationMessage = res.college?.tournament_id
            ? 'College created!'
            : 'College has been created, but cannot join the ongoing tournament right now.';

        navigate(`/college/${res.college.name}`);
        openNotification(creationMessage, 'success');
    };

    return (
        <InputForm
            title="Create College"
            description="University Tournament Moderators and University Marketing Moderators will not be able to create and manage more than one college."
            inputs={[
                <TextField
                    label="College Name"
                    name="collegeName"
                    required
                    placeholder="College Name"
                    onChange={handleFieldsChange}
                    margin="normal"
                    fullWidth
                    autoFocus
                    error={!!errors.collegeName}
                    helperText={errors.collegeName}
                    inputProps={{ maxLength: 60 }}
                />,
                <TextField
                    label="About Section"
                    name="bio"
                    placeholder="Describe the college"
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
                    text: 'Create College',
                    type: 'submit',
                    backgroundColor: globalStyleVars.blue,
                    borderColor: globalStyleVars.blue,
                    color: 'white',
                    disabled:
                        isFormInvalid(
                            newCollegeInfo,
                            errors,
                            isFieldTouched,
                            fieldsNotRequired
                        ) ||
                        !Object.values(isFieldTouched).some(
                            (touched) => touched === true
                        ) ||
                        createButtonDisabled,
                    onClick: handleCreateCollege,
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
                inputId="upload-college-picture"
                accept="image/*"
                handler={handleSetCollegePicture}
                sx={{
                    width: '100%',
                }}
            >
                {renderImage()}
            </UploadBox>
        </InputForm>
    );
}
