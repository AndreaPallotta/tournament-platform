/* eslint-disable react-hooks/exhaustive-deps */
import {
    Grid,
    Link as MUILink,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { globalStyleVars } from 'src/app/app';
import InputForm from 'src/app/components/InputForm';
import PasswordTooltip from 'src/app/components/PasswordTooltip';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { saveToStorage } from 'src/app/services/localStorage.service';
import { AuthResponse } from 'src/app/types/auth.types';
import {
    confirmPasswordValidation,
    displayNameValidation,
    emailValidation,
    firstNameValidation,
    isFormInvalid,
    lastNameValidation,
    passwordValidation,
} from 'src/app/validation/yup.validation';
import * as yup from 'yup';
import { post } from '../../services/api.service';

interface Credentials {
    first_name: string;
    last_name: string;
    display_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

type CredentialsErrors = Record<keyof Credentials, string>;
type CredentialsTouched = Record<keyof Credentials, boolean>;

const schema = yup.object().shape({
    first_name: firstNameValidation,
    last_name: lastNameValidation,
    display_name: displayNameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirm_password: confirmPasswordValidation,
});

/**
 * UI component for the sign-in page.
 */
export default function SignupPage() {
    const theme = useTheme();

    const [credentials, setCredentials] = React.useState<Credentials>({
        first_name: '',
        last_name: '',
        display_name: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = React.useState<CredentialsErrors>({
        first_name: '',
        last_name: '',
        display_name: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const [isFieldTouched, setIsFieldTouched] =
        React.useState<CredentialsTouched>({
            first_name: false,
            last_name: false,
            display_name: false,
            email: false,
            password: false,
            confirm_password: false,
        });

    const { authToken, user, role, setUser, setAuthToken } = useAuth();

    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const [signUpButtonDisabled, setSignUpButtonDisabled] = useState(false);

    const handleFieldsChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        setCredentials((prev: Credentials) => ({
            ...prev,
            [name]: value,
        }));

        setIsFieldTouched((prev: Record<keyof Credentials, boolean>) => ({
            ...prev,
            [name]: true,
        }));

        try {
            await schema.validateAt(name, { ...credentials, [name]: value });

            setErrors((prev: Record<keyof Credentials, string>) => ({
                ...prev,
                [name]: '',
            }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErrors((prev: Record<keyof Credentials, string>) => ({
                ...prev,
                [name]: err.message,
            }));
        }
    };

    const handleSignup = async () => {
        setSignUpButtonDisabled(true);

        const { err, res } = await post('/api/auth/signup', { ...credentials });

        if (err || !res) {
            openNotification(err || 'Error signing up', 'error');
            setSignUpButtonDisabled(false);
            return;
        }

        const { authToken, user, refreshToken } = res as AuthResponse;

        setAuthToken(authToken);
        setUser(user);

        saveToStorage('authToken', authToken);
        saveToStorage('user', user);

        Cookies.set('refresh_token', refreshToken, {
            httpOnly: false,
            secure: false,
        });

        setSignUpButtonDisabled(false);
    };

    React.useEffect(() => {
        if (authToken && user && role) {
            navigate(`/profile/${user.id}`);
        }
    }, [authToken, user, role]);

    return (
        <InputForm
            title="Sign Up"
            spacing={false}
            inputs={[
                <TextField
                    label="First Name"
                    name="first_name"
                    value={credentials.first_name}
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    autoFocus
                    autoComplete="given-name"
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                />,
                <TextField
                    label="Last Name"
                    name="last_name"
                    value={credentials.last_name}
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    autoComplete="family-name"
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                />,
                <TextField
                    label="Display Name"
                    name="display_name"
                    value={credentials.display_name}
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    autoComplete="username"
                    error={!!errors.display_name}
                    helperText={errors.display_name}
                />,
                <TextField
                    label="Email"
                    name="email"
                    value={credentials.email}
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email}
                />,
                <TextField
                    label="Password"
                    name="password"
                    value={credentials.password}
                    required
                    type="password"
                    onChange={handleFieldsChange}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                        endAdornment: <PasswordTooltip />,
                    }}
                />,
                <TextField
                    label="Retype Password"
                    name="confirm_password"
                    value={credentials.confirm_password}
                    required
                    type="password"
                    onChange={handleFieldsChange}
                    fullWidth
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password}
                />,
            ]}
            buttons={[
                {
                    text: 'Sign Up',
                    type: 'submit',
                    backgroundColor: globalStyleVars.blue,
                    borderColor: globalStyleVars.blue,
                    color: 'white',
                    disabled:
                        isFormInvalid(credentials, errors, isFieldTouched) ||
                        !Object.values(isFieldTouched).some(
                            (touched) => touched === true
                        ) ||
                        signUpButtonDisabled,
                    onClick: handleSignup,
                },
            ]}
            bottomHelper={
                <Grid container sx={{ gap: '0.5rem', marginTop: '16px' }}>
                    <Typography>Already have an account?</Typography>
                    <MUILink
                        to="/login"
                        underline="hover"
                        sx={{
                            textDecoration: 'none',
                            color: 'black',
                        }}
                        component={Link}
                    >
                        <Typography variant="card">Log In</Typography>
                    </MUILink>
                </Grid>
            }
            sx={{
                width: '500px',
                [theme.breakpoints.down('md')]: {
                    width: '500px',
                },
            }}
        />
    );
}
