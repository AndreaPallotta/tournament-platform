import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';
import App from './app/app';
import DynamicRouteElement from './app/components/DynamicRoute';
import ProtectedRouteElement from './app/components/ProtectedRoute';
import AuthContextProvider from './app/contexts/authContext';
import { DynRoutesProvider } from './app/hooks/useDynRoutes';
import { NotificationProvider } from './app/hooks/useNotification';
import AardvarkGamesPage from './app/pages/aardvark/AardvarkGamesPage';
import LoginPage from './app/pages/auth/LoginPage';
import SignupPage from './app/pages/auth/SignupPage';
import BrochurePage from './app/pages/BrochurePage';
import GameInfoPage from './app/pages/game/GameInfoPage';
import AdminDashboard from './app/pages/management/AdminDashboard';
import ParticipantSearchPage from './app/pages/management/ParticipantSearchPage';
import NotFoundPage from './app/pages/NotFoundPage';
import CreateTeamPage from './app/pages/team/CreateTeamPage';
import TeamPage from './app/pages/team/TeamPage';
import CreateTournamentPage from './app/pages/tournament/CreateTournamentPage';
import TournamentPage from './app/pages/tournament/TournamentPage';
import TournamentRulesPage from './app/pages/tournament/TournamentRulesPage';
import CreateUniversityPage from './app/pages/university/CreateUniversityPage';
import UniversityPage from './app/pages/university/UniversityPage';
import UserProfilePage from './app/pages/user/UserProfilePage';
import { Role } from './app/types/enums';
import './style.css';

const browserRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index={true} element={<BrochurePage />} />
            <Route path="about" element={<GameInfoPage />} />
            <Route path="rules" element={<TournamentRulesPage />} />
            <Route path="aardvark" element={<AardvarkGamesPage />} />
            <Route path="participants" element={<ParticipantSearchPage />} />
            <Route path="not_found" element={<NotFoundPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route
                path="admin"
                element={
                    <ProtectedRouteElement
                        element={<AdminDashboard />}
                        minRole={Role.ADMIN}
                    />
                }
            />
            <Route
                path="profile/:id"
                element={
                    <DynamicRouteElement
                        model="user"
                        element={<UserProfilePage />}
                    />
                }
            />
            <Route
                path="team/:name"
                element={
                    <DynamicRouteElement model="team" element={<TeamPage />} />
                }
            />
            <Route
                path="team/create"
                element={
                    <ProtectedRouteElement
                        element={<CreateTeamPage />}
                        minRole={Role.REGISTERED_USER}
                    />
                }
            />
            <Route path="tournament" element={<TournamentPage />} />
            <Route
                path="tournament/:name"
                element={
                    <DynamicRouteElement
                        model="tournament"
                        element={<TournamentPage />}
                    />
                }
            />
            <Route
                path="tournament/create"
                element={
                    <ProtectedRouteElement
                        element={<CreateTournamentPage />}
                        minRole={Role.AARDVARK_TOURNAMENT_MOD}
                    />
                }
            />
            <Route path="college" element={<UniversityPage />} />
            <Route
                path="college/:name"
                element={
                    <DynamicRouteElement
                        model="college"
                        element={<UniversityPage />}
                    />
                }
            />
            <Route
                path="college/create"
                element={
                    <ProtectedRouteElement
                        element={<CreateUniversityPage />}
                        minRole={Role.UNIVERSITY_MARKETING_MOD}
                    />
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StrictMode>
        <NotificationProvider duration={5000}>
            <AuthContextProvider>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DynRoutesProvider>
                        <RouterProvider router={browserRouter} />
                    </DynRoutesProvider>
                </LocalizationProvider>
            </AuthContextProvider>
        </NotificationProvider>
    </StrictMode>
);
