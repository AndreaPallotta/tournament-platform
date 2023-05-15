/* eslint-disable @typescript-eslint/no-empty-function */
import jwtDecode from 'jwt-decode';
import React from 'react';
import {
    getFromStorage,
    saveToStorage,
} from '../services/localStorage.service';
import { DecodedJWT } from '../types/auth.types';
import { Role } from '../types/enums';
import { User } from '../types/user.types';

interface AuthContextType {
    user: User | undefined;
    authToken: string | undefined;
    role: Role | undefined;
    setUser: (user: User | undefined) => void;
    setAuthToken: (authToken: string | undefined) => void;
    setRole: (role: Role | undefined) => void;
}

interface AuthContextProviderProps {
    children: React.ReactNode;
}

export const AuthContext = React.createContext<AuthContextType>({
    user: undefined,
    authToken: undefined,
    role: undefined,
    setUser: () => {},
    setAuthToken: () => {},
    setRole: () => {},
});

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    return context;
};

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
    children,
}: AuthContextProviderProps) => {
    const [user, setUser] = React.useState<User | undefined>(
        getFromStorage('user')
    );
    const [authToken, setAuthToken] = React.useState<string | undefined>(
        getFromStorage('authToken')
    );

    const [role, setRole] = React.useState<Role | undefined>(() => {
        const token = getFromStorage('authToken');

        if (!token) return undefined;
        const decoded = jwtDecode(token as string) as DecodedJWT;

        if (!decoded || !decoded.role) return undefined;
        return Role[decoded.role as keyof typeof Role];
    });

    React.useEffect(() => {
        const storedUser = getFromStorage('user');
        if (storedUser) setUser(storedUser as User);

        const token = getFromStorage('authToken');
        if (token) {
            const decoded = jwtDecode(token as string) as DecodedJWT;
            if (decoded && decoded.role) {
                setRole(Role[decoded.role as keyof typeof Role]);
            }
        }
    }, []);

    React.useEffect(() => {
        if (authToken) {
            saveToStorage('authToken', authToken);
            const decoded = jwtDecode(authToken as string) as DecodedJWT;
            if (decoded && decoded.role) {
                setRole(Role[decoded.role as keyof typeof Role]);
            }
        }
    }, [authToken]);

    React.useEffect(() => {
        if (user) saveToStorage('user', user);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{ user, authToken, role, setUser, setAuthToken, setRole }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
