import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Avatar,
    Link,
    CircularProgress
} from '@mui/material';
import { LockOutlined, Email, Person } from '@mui/icons-material';

const Login = () => {
    const [email, setEmail] = useState('admin@test.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard', { replace: true });
        } else {
            setError(result.error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{
                            m: 1,
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56
                        }}>
                            <LockOutlined />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                            Internship Management
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Sign in to your account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Typography variant="body2" color="textSecondary" align="center">
                            Demo Credentials
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 2,
                            bgcolor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            mt: 1
                        }}>
                            <Typography variant="caption" color="textSecondary">
                                admin@test.com / admin123
                            </Typography>
                        </Box>
                    </form>
                </Paper>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
                    © 2026 Internship Management System v1.0
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;