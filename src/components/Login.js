import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import './Login.css';
import { useAuth } from '../context/AuthContext';

const Login = ({ open, onClose }) => {
    const { login, signup } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleView = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setFormData({
            name: '',
            email: '',
            password: ''
        });
    };

    const handleSubmit = async () => {
        setError('');
        if (!formData.email || !formData.password || (isSignUp && !formData.name)) {
            setError('Please fill all required fields.');
            return;
        }
        try {
            setSubmitting(true);
            if (isSignUp) {
                await signup({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                });
            } else {
                await login({
                    email: formData.email.trim(),
                    password: formData.password
                });
            }
            onClose?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            className="login-dialog"
        >
            <DialogContent className="login-content">
                <Typography variant="h4" className="welcome-text">
                    {isSignUp ? 'Create an Account' : 'Welcome Back!'}
                </Typography>

                <Box className="login-form">
                    {isSignUp && (
                        <Box className="input-group">
                            <Typography variant="body1" className="input-label">
                                Name
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                placeholder="Enter your name"
                                variant="outlined"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Box>
                    )}

                    <Box className="input-group">
                        <Typography variant="body1" className="input-label">
                            Email or Mobile Number
                        </Typography>
                        <TextField
                            fullWidth
                            name="email"
                            placeholder="Enter your email or mobile number"
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Box>

                    <Box className="input-group">
                        <Typography variant="body1" className="input-label">
                            Password
                        </Typography>
                        <TextField
                            fullWidth
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            variant="outlined"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </Box>

                    <Button 
                        variant="contained" 
                        fullWidth 
                        className="sign-in-button"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    {error ? (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    ) : null}
                </Box>

                <Typography variant="body1" className="divider-text">
                    Or continue with
                </Typography>

                <Box className="social-buttons">
                    <Button 
                        variant="contained" 
                        className="social-button gmail"
                        startIcon={<Google />}
                    >
                        Gmail
                    </Button>
                    <Button 
                        variant="contained" 
                        className="social-button facebook"
                    >
                        Facebook
                    </Button>
                    <Button 
                        variant="contained" 
                        className="social-button twitter"
                    >
                        X.com
                    </Button>
                </Box>

                <Box className="signup-prompt">
                    <Typography variant="body2">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <span 
                            className="signup-link" 
                            onClick={toggleView}
                            style={{ cursor: 'pointer' }}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </span>
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default Login; 
