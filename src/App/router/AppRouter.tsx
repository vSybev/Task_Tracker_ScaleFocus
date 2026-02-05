import {Navigate, Route, Routes} from 'react-router-dom';
import {PrivateRoute} from './PrivateRoute';
import {LoginPage} from '../../Pages/LoginPage/LoginPage';
import {RegisterPage} from '../../Pages/RegisterPage/RegisterPage';
import {DashboardPage} from '../../Pages/DashboardPage/DashboardPage';
import {NotFoundPage} from '../../Pages/NotFoundPage/NotFoundPage';
import {AppLayout} from '../Layouts/AppLayout';

// (по желание) placeholder settings/profile страници
import {ProfilePage} from '../Ui/ProfilePage';
import {SettingsPage} from '../Ui/SettingsPage';
import {LandingRoute} from "./LandingRoute.tsx";
import {TasksPage} from "../../Pages/TasksPage/TaskPage.tsx";
import {GoalsPage} from "../../Pages/GoalsPage/GoalsPage.tsx";

export function AppRouter() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {/* ✅ Default landing */}
                <Route path="/" element={<LandingRoute />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                </Route>

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    );
}