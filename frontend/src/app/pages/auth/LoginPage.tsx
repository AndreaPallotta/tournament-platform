/* eslint-disable react-hooks/exhaustive-deps */
import {
    Grid,
    Link as MUILink,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { globalStyleVars } from 'src/app/app';
import InputForm from 'src/app/components/InputForm';
import { useAuth } from 'src/app/contexts/authContext';
import { useOpenNotification } from 'src/app/hooks/useNotification';
import { saveToStorage } from 'src/app/services/localStorage.service';
import { AuthResponse } from 'src/app/types/auth.types';
import { isFormInvalid, notEmpty } from 'src/app/validation/yup.validation';
import * as yup from 'yup';
import { post } from '../../services/api.service';

interface Credentials {
    email: string;
    password: string;
}

type CredentialsErrors = Record<keyof Credentials, string>;
type CredentialsTouched = Record<keyof Credentials, boolean>;

const schema = yup.object().shape({
    email: yup.string().when('$isFieldTouched', notEmpty('Email')),
    password: yup.string().when('$isFieldTouched', notEmpty('Password')),
});

/**
 * UI component for the sign-in page.
 */
export default function LoginPage() {
    const theme = useTheme();

    const [credentials, setCredentials] = React.useState<Credentials>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = React.useState<CredentialsErrors>({
        email: '',
        password: '',
    });

    const [isFieldTouched, setIsFieldTouched] =
        React.useState<CredentialsTouched>({
            email: false,
            password: false,
        });

    const { authToken, user, role, setUser, setAuthToken } = useAuth();

    const openNotification = useOpenNotification();
    const navigate = useNavigate();

    const [loginButtonDisabled, setLoginButtonDisabled] = useState(false);

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

    const handleLogin = async () => {
        setLoginButtonDisabled(true);

        const { err, res } = await post('/api/auth/login', { ...credentials });

        if (err || !res) {
            openNotification(err || 'Error logging in', 'error');
            setLoginButtonDisabled(false);
            return;
        }

        const { authToken, user, refreshToken } = res as AuthResponse;

        setAuthToken(authToken);
        setUser(user);

        saveToStorage('authToken', authToken);
        saveToStorage('user', user);

        Cookies.set('refresh_token', refreshToken, {
            httpOnly: false,
            secure: true,
        });

        setLoginButtonDisabled(false);
    };

    React.useEffect(() => {
        if (authToken && user && role) {
            navigate(`/profile/${user.id}`);
        }
    }, [authToken, user, role]);

    return (
        <InputForm
            title="Log in"
            spacing={false}
            inputs={[
                <TextField
                    label="Email"
                    name="email"
                    value={credentials.email}
                    required
                    onChange={handleFieldsChange}
                    fullWidth
                    autoFocus
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email}
                />,
                <Stack
                    sx={{
                        textAlign: 'start',
                    }}
                >
                    <TextField
                        label="Password"
                        name="password"
                        value={credentials.password}
                        required
                        type="password"
                        onChange={handleFieldsChange}
                        fullWidth
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password}
                    />
                    <MUILink
                        to="/forgot-password"
                        underline="hover"
                        sx={{
                            textDecoration: 'none',
                            color: 'black',
                        }}
                        component={Link}
                    >
                        <Typography variant="bold-small">
                            Forgot Password?
                        </Typography>
                    </MUILink>
                </Stack>,
            ]}
            buttons={[
                {
                    text: 'Log In',
                    type: 'submit',
                    backgroundColor: globalStyleVars.blue,
                    borderColor: globalStyleVars.blue,
                    color: 'white',
                    disabled:
                        isFormInvalid(credentials, errors, isFieldTouched) ||
                        !Object.values(isFieldTouched).some(
                            (touched) => touched === true
                        ) ||
                        loginButtonDisabled,
                    onClick: handleLogin,
                },
            ]}
            bottomHelper={
                <Grid container sx={{ gap: '0.5rem', marginTop: '16px' }}>
                    <Typography>Don't have an account?</Typography>
                    <MUILink
                        to="/signup"
                        underline="hover"
                        sx={{
                            textDecoration: 'none',
                            color: 'black',
                        }}
                        component={Link}
                    >
                        <Typography variant="card">Sign Up</Typography>
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
