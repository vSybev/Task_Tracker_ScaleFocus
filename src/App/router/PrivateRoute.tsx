import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export function PrivateRoute() {
    const user = useAppSelector((s) => s.auth.user);
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}
