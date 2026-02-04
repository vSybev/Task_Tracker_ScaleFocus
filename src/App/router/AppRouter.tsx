import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

import { LoginPage } from '../../pages/LoginPage/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage/RegisterPage';
import { DashboardPage } from '../../pages/DashboardPage/DashboardPage';
import { NotFoundPage } from '../../pages/NotFoundPage/NotFoundPage';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}
