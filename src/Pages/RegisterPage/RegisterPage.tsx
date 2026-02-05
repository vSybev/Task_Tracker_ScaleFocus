import { Alert, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { clearMessages, registerWithEmail } from '../../app/store/authSlice';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Required'),
    password: yup.string().min(6, 'Min 6 chars').required('Required'),
});

export function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, status, error, info } = useAppSelector((s) => s.auth);

    useEffect(() => {
        dispatch(clearMessages());
    }, [dispatch]);

    useEffect(() => {
        // ако Supabase не изисква email confirm -> user ще стане non-null и ще те пренасочи
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={2}>
                <Typography variant="h4">Register</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {info && <Alert severity="info">{info}</Alert>}

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        await dispatch(registerWithEmail(values)).unwrap();
                    }}
                >
                    {({ values, handleChange, handleSubmit, touched, errors }) => (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    value={values.email}
                                    onChange={handleChange}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                />
                                <TextField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                />
                                <Button type="submit" variant="contained" disabled={status === 'loading'}>
                                    Create account
                                </Button>

                                <Typography variant="body2">
                                    Already have an account? <RouterLink to="/login">Login</RouterLink>
                                </Typography>
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Stack>
        </Container>
    );
}
