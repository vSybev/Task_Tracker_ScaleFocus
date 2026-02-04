import { Button, Container, Stack, TextField, Typography, Alert } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { loginWithEmail } from '../../app/store/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Required'),
    password: yup.string().min(6, 'Min 6 chars').required('Required'),
});

export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, status, error } = useAppSelector((s) => s.auth);

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={2}>
                <Typography variant="h4">Login</Typography>
                {error && <Alert severity="error">{error}</Alert>}

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        await dispatch(loginWithEmail(values));
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
                                    Sign in
                                </Button>

                                <Typography variant="body2">
                                    No account? <Link to="/register">Register</Link>
                                </Typography>
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Stack>
        </Container>
    );
}
