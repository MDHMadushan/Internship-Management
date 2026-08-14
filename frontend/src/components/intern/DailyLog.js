import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, Grid,
    Container, Fade, Snackbar, Alert, CircularProgress,
    Divider, Chip, Grow, InputAdornment, IconButton  // ← ADDED IconButton
} from '@mui/material';
import {
    Send, Refresh, Timer, Assignment, CheckCircle,
    Schedule, Warning, History, Feedback,
    CalendarToday, Delete
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';

const DailyLog = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [logs, setLogs] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        completedWork: '',
        currentWork: '',
        challenges: '',
        hoursWorked: 0,
        nextDayPlan: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const todayResponse = await axios.get('/intern/daily-logs/today');
            setTodayStatus(todayResponse.data);

            const logsResponse = await axios.get('/intern/daily-logs');
            setLogs(logsResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.completedWork.trim()) {
            showSnackbar('Please describe what you completed today', 'error');
            return;
        }
        if (!formData.currentWork.trim()) {
            showSnackbar('Please describe your current work', 'error');
            return;
        }
        if (!formData.nextDayPlan.trim()) {
            showSnackbar('Please describe your plan for tomorrow', 'error');
            return;
        }
        if (formData.hoursWorked <= 0) {
            showSnackbar('Please enter valid hours worked', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/intern/daily-logs', formData);
            showSnackbar('✅ Daily log submitted successfully! 🎉', 'success');
            setFormData({
                completedWork: '',
                currentWork: '',
                challenges: '',
                hoursWorked: 0,
                nextDayPlan: ''
            });
            fetchData();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit log';
            showSnackbar(`❌ ${message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                await axios.delete(`/intern/daily-logs/${logId}`);
                showSnackbar('✅ Log deleted successfully', 'success');
                fetchData();
            } catch (error) {
                showSnackbar('❌ Failed to delete log', 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Fade in timeout={300}>
                <Box>
                    {/* Header */}
                    <Box sx={{
                        mb: 4,
                        p: 3,
                        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 30%, #1976d2 60%, #42a5f5 100%)',
                        borderRadius: 4,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                📝 Daily Work Log
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Track your daily progress and challenges
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            {todayStatus?.hasSubmitted ? (
                                <Chip
                                    icon={<CheckCircle />}
                                    label="Today's log submitted ✅"
                                    color="success"
                                    sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.3)',
                                        color: 'white',
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            ) : (
                                <Chip
                                    icon={<Warning />}
                                    label="Today's log not submitted"
                                    color="warning"
                                    sx={{
                                        bgcolor: 'rgba(255, 193, 7, 0.3)',
                                        color: 'white',
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            )}
                            <Chip
                                icon={<History />}
                                label={`${logs.length} logs total`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchData}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        background: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>

                    {/* Two Column Layout: Form + Recent Logs */}
                    <Grid container spacing={3}>
                        {/* Left Column - Submit Log Form */}
                        <Grid item xs={12} md={5}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    {todayStatus?.hasSubmitted ? '📌 Today\'s Log Submitted' : '📝 Submit Today\'s Log'}
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                {todayStatus?.hasSubmitted ? (
                                    <Alert severity="success" sx={{ mb: 3 }}>
                                        You have already submitted a log for today.
                                    </Alert>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="What did you complete today?"
                                                    multiline
                                                    rows={2}
                                                    value={formData.completedWork}
                                                    onChange={(e) => setFormData({...formData, completedWork: e.target.value})}
                                                    required
                                                    placeholder="Describe the tasks you completed today..."
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="What are you currently working on?"
                                                    multiline
                                                    rows={2}
                                                    value={formData.currentWork}
                                                    onChange={(e) => setFormData({...formData, currentWork: e.target.value})}
                                                    required
                                                    placeholder="Describe your current work in progress..."
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Challenges / Blockers"
                                                    multiline
                                                    rows={2}
                                                    value={formData.challenges}
                                                    onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                                                    placeholder="Any challenges or blockers you faced..."
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Hours Worked"
                                                    value={formData.hoursWorked}
                                                    onChange={(e) => setFormData({...formData, hoursWorked: parseInt(e.target.value) || 0})}
                                                    required
                                                    inputProps={{ min: 0, max: 24 }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Plan for Tomorrow"
                                                    value={formData.nextDayPlan}
                                                    onChange={(e) => setFormData({...formData, nextDayPlan: e.target.value})}
                                                    required
                                                    placeholder="What are your plans for tomorrow?"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button
                                                    fullWidth
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={submitting}
                                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 30px rgba(25, 118, 210, 0.4)',
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {submitting ? 'Submitting...' : 'Submit Daily Log'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                )}
                            </Paper>
                        </Grid>

                        {/* Right Column - Recent Logs FULL WIDTH */}
                        <Grid item xs={12} md={7}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid rgba(0,0,0,0.06)',
                                minHeight: 400
                            }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        📊 Recent Logs
                                        <Chip
                                            label={`${logs.length} entries`}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                {logs.length > 0 ? (
                                    <Box>
                                        {logs.slice(0, 10).map((log, index) => (
                                            <Grow in timeout={300 + (index * 50)} key={log.id}>
                                                <Box sx={{
                                                    mb: 2,
                                                    p: 2.5,
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(0,0,0,0.06)',
                                                    bgcolor: '#fafafa',
                                                    width: '100%'
                                                }}>
                                                    {/* Date & Badges */}
                                                    <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                                                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {new Date(log.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </Typography>
                                                        <Chip
                                                            label={`${log.hoursWorked}h`}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                        {log.supervisorFeedback && (
                                                            <Chip
                                                                label="✅ Feedback"
                                                                size="small"
                                                                color="info"
                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                            />
                                                        )}
                                                        <Box flex={1} />
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteLog(log.id)}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Completed Work */}
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        ✅ {log.completedWork}
                                                    </Typography>

                                                    {/* Current Work */}
                                                    <Typography variant="body2" color="textSecondary">
                                                        🔄 {log.currentWork}
                                                    </Typography>

                                                    {/* Challenges - if exists */}
                                                    {log.challenges && (
                                                        <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                                                            ⚠️ {log.challenges}
                                                        </Typography>
                                                    )}

                                                    {/* Plan for Tomorrow */}
                                                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                                        📅 Tomorrow: {log.nextDayPlan}
                                                    </Typography>

                                                    {/* Feedback - if exists */}
                                                    {log.supervisorFeedback && (
                                                        <Box sx={{
                                                            mt: 1,
                                                            p: 1.5,
                                                            bgcolor: '#e3f2fd',
                                                            borderRadius: 1,
                                                            border: '1px solid #bbdefb'
                                                        }}>
                                                            <Typography variant="caption" color="primary">
                                                                💬 {log.supervisorFeedback}
                                                            </Typography>
                                                            {log.feedbackGivenBy && (
                                                                <Typography variant="caption" color="textSecondary" display="block">
                                                                    By: {log.feedbackGivenBy}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grow>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box textAlign="center" py={4}>
                                        <Typography color="textSecondary">No logs submitted yet</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Footer */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Total Logs: {logs.length} | This Month: {logs.filter(log =>
                            new Date(log.date).getMonth() === new Date().getMonth()
                        ).length}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </Fade>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DailyLog;