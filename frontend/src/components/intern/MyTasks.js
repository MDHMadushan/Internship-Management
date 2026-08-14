import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Container, Fade, Tooltip, Snackbar, Alert,
    Card, CardContent, LinearProgress, MenuItem, FormControl,
    InputLabel, Select, Avatar, Grow, InputAdornment,
    CircularProgress
} from '@mui/material';
import {
    Refresh, CheckCircle, Pending, Warning, Task,
    MoreVert, Search, FilterList, PlayArrow, Schedule,
    Assignment, Done, Close
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';

const MyTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/intern/tasks');
            setTasks(response.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showSnackbar('Failed to load tasks', 'error');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleUpdateStatus = async () => {
        if (!selectedTask || !newStatus) return;

        try {
            await axios.put(`/intern/tasks/${selectedTask.id}/status`, {
                status: newStatus
            });
            showSnackbar('Task status updated successfully');
            setOpenDialog(false);
            fetchTasks();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleOpenDialog = (task) => {
        setSelectedTask(task);
        setNewStatus(task.status);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTask(null);
        setNewStatus('');
    };

    const getStatusColor = (status) => {
        const colors = {
            'TODO': 'default',
            'IN_PROGRESS': 'warning',
            'SUBMITTED': 'info',
            'REVISION_REQUIRED': 'error',
            'COMPLETED': 'success'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'COMPLETED': return <CheckCircle sx={{ fontSize: 16 }} />;
            case 'IN_PROGRESS': return <PlayArrow sx={{ fontSize: 16 }} />;
            case 'SUBMITTED': return <Schedule sx={{ fontSize: 16 }} />;
            case 'REVISION_REQUIRED': return <Warning sx={{ fontSize: 16 }} />;
            default: return <Pending sx={{ fontSize: 16 }} />;
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'success',
            'MEDIUM': 'info',
            'HIGH': 'warning',
            'CRITICAL': 'error'
        };
        return colors[priority] || 'default';
    };

    const todoCount = tasks.filter(t => t.status === 'TODO').length;
    const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

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
                                📋 My Tasks
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Track and update your assigned tasks
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchTasks}
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
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)' }}>
                                <CardContent>
                                    <Typography variant="h3" color="primary">{tasks.length}</Typography>
                                    <Typography variant="body2" color="textSecondary">Total Tasks</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)' }}>
                                <CardContent>
                                    <Typography variant="h3" color="warning.main">{todoCount + inProgressCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Pending Tasks</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)' }}>
                                <CardContent>
                                    <Typography variant="h3" color="success.main">{completedCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Completed Tasks</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tasks Table */}
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
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Task</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Priority</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Deadline</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map((task, index) => (
                                    <Grow in timeout={300 + (index * 50)}>
                                        <TableRow
                                            key={task.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#f5f8ff' },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                                        {task.title}
                                                    </Typography>
                                                    {task.description && (
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            {task.description.substring(0, 60)}...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(task.status)}
                                                    label={task.status?.replace('_', ' ') || 'TODO'}
                                                    color={getStatusColor(task.status)}
                                                    size="small"
                                                    sx={{ borderRadius: 2, fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={task.priority || 'MEDIUM'}
                                                    color={getPriorityColor(task.priority)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Update Status">
                                                    <IconButton
                                                        onClick={() => handleOpenDialog(task)}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </Grow>
                                ))}
                                {tasks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                                <Box sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    background: '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Task sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                                </Box>
                                                <Typography variant="h6" color="textSecondary">
                                                    No Tasks Assigned
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    You don't have any tasks yet. Check back later!
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Footer */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Total: {tasks.length} | Completed: {completedCount} | Pending: {todoCount + inProgressCount}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </Fade>

            {/* Update Status Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                    color: 'white',
                    py: 2
                }}>
                    Update Task Status
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Task: <strong>{selectedTask?.title}</strong>
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="TODO">📋 TODO</MenuItem>
                            <MenuItem value="IN_PROGRESS">⏳ IN PROGRESS</MenuItem>
                            <MenuItem value="SUBMITTED">📤 SUBMITTED</MenuItem>
                            <MenuItem value="COMPLETED">✅ COMPLETED</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleUpdateStatus}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                            }
                        }}
                    >
                        Update Status
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
        </Container>
    );
};

export default MyTasks;