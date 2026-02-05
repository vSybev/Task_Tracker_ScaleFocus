import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { HomePage } from '../../Pages/HomePage/HomePage';

export function LandingRoute() {
    const user = useAppSelector((s) => s.auth.user);

    if (user) return <Navigate to="/dashboard" replace />;
    return <HomePage />;
}
