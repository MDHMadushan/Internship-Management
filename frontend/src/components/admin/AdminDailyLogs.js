import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Container, Fade, Tooltip, Snackbar, Alert,
    Card, CardContent, LinearProgress, MenuItem, FormControl,
    InputLabel, Select, Avatar, Grow, InputAdornment,
    CircularProgress, Divider, Tabs, Tab
} from '@mui/material';
import {
    Refresh, Search, FilterList, CalendarToday, Person,
    Feedback, CheckCircle, Pending, Warning, Send,
    History, Timeline, Assessment, Download, Close,
    Visibility, Timer  // ← ADDED Timer
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';

const AdminDailyLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState(null);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch logs with intern details
            const logsResponse = await axios.get('/admin/daily-logs/with-interns');
            setLogs(logsResponse.data || []);

            // Fetch stats
            const statsResponse = await axios.get('/admin/daily-logs/stats');
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            showSnackbar('Failed to load daily logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenFeedback = (log) => {
        setSelectedLog(log);
        setFeedbackText(log.supervisorFeedback || '');
        setOpenFeedbackDialog(true);
    };

    const handleCloseFeedback = () => {
        setOpenFeedbackDialog(false);
        setSelectedLog(null);
        setFeedbackText('');
    };

    const handleOpenView = (log) => {
        setSelectedLog(log);
        setOpenViewDialog(true);
    };

    const handleCloseView = () => {
        setOpenViewDialog(false);
        setSelectedLog(null);
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) {
            showSnackbar('Please enter feedback', 'error');
            return;
        }

        try {
            await axios.post(`/admin/daily-logs/${selectedLog.id}/feedback`, {
                feedback: feedbackText.trim()
            });
            showSnackbar('✅ Feedback added successfully', 'success');
            handleCloseFeedback();
            fetchData();
        } catch (error) {
            showSnackbar('❌ Failed to add feedback', 'error');
        }
    };

    const filteredLogs = logs.filter(item => {
        const log = item.log;
        const intern = item.intern;

        const searchMatch =
            intern?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            intern?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.completedWork?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.currentWork?.toLowerCase().includes(searchTerm.toLowerCase());

        let dateMatch = true;
        if (filterDate) {
            const logDate = new Date(log.date).toISOString().split('T')[0];
            dateMatch = logDate === filterDate;
        }

        return searchMatch && dateMatch;
    });

    const getStatusChip = (log) => {
        if (log.supervisorFeedback) {
            return <Chip label="Has Feedback" color="info" size="small" icon={<Feedback />} />;
        }
        return <Chip label="Pending Review" color="warning" size="small" icon={<Pending />} />;
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
                                📊 Daily Logs - Admin View
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Review and provide feedback on intern daily logs
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                icon={<History />}
                                label={`${logs.length} total logs`}
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

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="primary">{stats?.totalLogs || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">Total Logs</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="success.main">{stats?.logsToday || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">Today's Logs</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="warning.main">{stats?.internsWithLogs || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">Active Interns</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="secondary.main">{stats?.logsThisWeek || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">This Week</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Search and Filter */}
                    <Paper sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Box display="flex" gap={2} flexWrap="wrap" flex={1}>
                            <TextField
                                placeholder="🔍 Search by name, email, or work..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200, flex: 1 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                size="small"
                                sx={{ width: 150 }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setFilterDate('')}
                                startIcon={<Close />}
                            >
                                Clear
                            </Button>
                        </Box>
                        <Chip
                            icon={<FilterList />}
                            label={`${filteredLogs.length} logs found`}
                            sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500
                            }}
                        />
                    </Paper>

                    {/* Table */}
                    <TableContainer component={Paper} sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <Table>
                            <TableHead sx={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
                            }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Intern</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Completed Work</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Hours</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No daily logs found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((item, index) => {
                                        const log = item.log;
                                        const intern = item.intern;
                                        return (
                                            <Grow in timeout={300 + (index * 50)} key={log.id}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="body2">
                                                                {new Date(log.date).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Avatar sx={{ width: 30, height: 30, bgcolor: '#1976d2', fontSize: 14 }}>
                                                                {intern?.fullName?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2">{intern?.fullName || 'Unknown'}</Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {intern?.email || ''}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {log.completedWork.substring(0, 50)}
                                                            {log.completedWork.length > 50 ? '...' : ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${log.hoursWorked}h`}
                                                            size="small"
                                                            icon={<Timer sx={{ fontSize: 14 }} />}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(log)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="View Details">
                                                            <IconButton onClick={() => handleOpenView(log)} color="info" size="small">
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={log.supervisorFeedback ? 'Update Feedback' : 'Add Feedback'}>
                                                            <IconButton
                                                                onClick={() => handleOpenFeedback(log)}
                                                                color={log.supervisorFeedback ? 'primary' : 'warning'}
                                                                size="small"
                                                            >
                                                                <Feedback />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            </Grow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Footer */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Showing {filteredLogs.length} of {logs.length} logs
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                    </Box>

                    {/* View Dialog */}
                    <Dialog open={openViewDialog} onClose={handleCloseView} maxWidth="md" fullWidth>
                        <DialogTitle sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                            color: 'white',
                            py: 2
                        }}>
                            📋 Daily Log Details
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            {selectedLog && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedLog.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Completed Work</Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1">{selectedLog.completedWork}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Current Work</Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1">{selectedLog.currentWork}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Challenges</Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1">
                                                {selectedLog.challenges || 'No challenges reported'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">Hours Worked</Typography>
                                        <Chip label={`${selectedLog.hoursWorked} hours`} color="primary" />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">Plan for Tomorrow</Typography>
                                        <Typography variant="body1">{selectedLog.nextDayPlan}</Typography>
                                    </Grid>
                                    {selectedLog.supervisorFeedback && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="textSecondary">Supervisor Feedback</Typography>
                                            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb' }}>
                                                <Typography variant="body1">{selectedLog.supervisorFeedback}</Typography>
                                                {selectedLog.feedbackGivenBy && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        By: {selectedLog.feedbackGivenBy} on {new Date(selectedLog.feedbackDate).toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <Button onClick={handleCloseView}>Close</Button>
                            {selectedLog && !selectedLog.supervisorFeedback && (
                                <Button
                                    variant="contained"
                                    startIcon={<Feedback />}
                                    onClick={() => {
                                        handleCloseView();
                                        handleOpenFeedback(selectedLog);
                                    }}
                                >
                                    Add Feedback
                                </Button>
                            )}
                        </DialogActions>
                    </Dialog>

                    {/* Feedback Dialog */}
                    <Dialog open={openFeedbackDialog} onClose={handleCloseFeedback} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                            color: 'white',
                            py: 2
                        }}>
                            {selectedLog?.supervisorFeedback ? '✏️ Update Feedback' : '💬 Add Feedback'}
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            {selectedLog && (
                                <>
                                    <Typography variant="caption" color="textSecondary">
                                        Log from {selectedLog.intern?.fullName} on {new Date(selectedLog.date).toLocaleDateString()}
                                    </Typography>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 2,
                                        my: 2,
                                        maxHeight: 100,
                                        overflow: 'auto'
                                    }}>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Completed:</strong> {selectedLog.completedWork}
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        label="Feedback"
                                        multiline
                                        rows={4}
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        placeholder="Enter your feedback for the intern..."
                                        required
                                    />
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <Button onClick={handleCloseFeedback}>Cancel</Button>
                            <Button
                                onClick={handleSubmitFeedback}
                                variant="contained"
                                startIcon={<Send />}
                                sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                                    }
                                }}
                            >
                                {selectedLog?.supervisorFeedback ? 'Update' : 'Add'} Feedback
                            </Button>
                        </DialogActions>
                    </Dialog>

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
                </Box>
            </Fade>
        </Container>
    );
};

export default AdminDailyLogs;