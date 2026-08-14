import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Container, Snackbar, Alert,
    CircularProgress, MenuItem, FormControl, InputLabel, Select,
    Tooltip, Grow, InputAdornment, Fade
} from '@mui/material';
import {
    Add, Edit, Delete, Refresh, Task as TaskIcon,
    CheckCircle, Pending, Warning, DateRange, PriorityHigh
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';
import InternAssignmentDialog from './InternAssignmentDialog';

const TaskManagement = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        deadline: '',
        projectId: '',
        assignedTo: ''
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/tasks');
            console.log('✅ Tasks fetched:', response.data);
            setTasks(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching tasks:', error);
            showSnackbar('Failed to load tasks', 'error');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'TODO',
                priority: task.priority || 'MEDIUM',
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                projectId: task.projectId || '',
                assignedTo: task.assignedTo || ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'TODO',
                priority: 'MEDIUM',
                deadline: '',
                projectId: '',
                assignedTo: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTask(null);
    };

    const handleManageIntern = (task) => {
        setSelectedTask(task);
        setAssignmentDialogOpen(true);
    };

    // ========== CREATE TASK - FIXED DATE FORMAT ==========
    const handleSubmit = async () => {
        // Validate title
        if (!formData.title || !formData.title.trim()) {
            showSnackbar('❌ Task title is required', 'error');
            return;
        }

        try {
            // Build data object
            const data = {
                title: formData.title.trim(),
                description: formData.description || '',
                status: formData.status || 'TODO',
                priority: formData.priority || 'MEDIUM',
                createdBy: user?.email || 'admin'
            };

            // 🔧 FIX: Send date in simple format (YYYY-MM-DDTHH:MM:SS)
            if (formData.deadline) {
                data.deadline = formData.deadline + 'T00:00:00';
            }

            // Add projectId if present
            if (formData.projectId && formData.projectId.trim()) {
                data.projectId = formData.projectId.trim();
            }

            // Add assignedTo if present
            if (formData.assignedTo && formData.assignedTo.trim()) {
                data.assignedTo = formData.assignedTo.trim();
            }

            console.log('📤 Sending task data:', JSON.stringify(data, null, 2));

            let response;
            if (editingTask) {
                response = await axios.put(`/admin/tasks/${editingTask.id}`, data);
                showSnackbar('✅ Task updated successfully');
            } else {
                response = await axios.post('/admin/tasks', data);
                showSnackbar('✅ Task created successfully');
            }

            console.log('📥 Response:', response.data);

            // Close dialog and refresh
            handleCloseDialog();
            await fetchTasks();

        } catch (error) {
            console.error('❌ Error saving task:', error);

            // Show detailed error
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                showSnackbar(`❌ Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`, 'error');
            } else if (error.request) {
                console.error('No response:', error.request);
                showSnackbar('❌ No response from server. Is backend running?', 'error');
            } else {
                console.error('Error:', error.message);
                showSnackbar(`❌ ${error.message}`, 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Delete this task?')) {
            try {
                await axios.delete(`/admin/tasks/${id}`);
                showSnackbar('✅ Task deleted');
                fetchTasks();
            } catch (error) {
                showSnackbar('❌ Failed to delete', 'error');
            }
        }
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

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'success',
            'MEDIUM': 'info',
            'HIGH': 'warning',
            'CRITICAL': 'error'
        };
        return colors[priority] || 'default';
    };

    const filteredTasks = tasks.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                📋 Task Management
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Manage all tasks and assignments
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
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
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.3)'
                                    }
                                }}
                            >
                                Create New Task
                            </Button>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h4" color="primary">{tasks.length}</Typography>
                                <Typography variant="body2" color="textSecondary">Total Tasks</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h4" color="warning.main">{todoCount + inProgressCount}</Typography>
                                <Typography variant="body2" color="textSecondary">In Progress</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h4" color="success.main">{completedCount}</Typography>
                                <Typography variant="body2" color="textSecondary">Completed</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h4" color="error.main">
                                    {tasks.filter(t => t.status === 'REVISION_REQUIRED').length}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">Revision Required</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Search */}
                    <Paper sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <TextField
                            fullWidth
                            placeholder="🔍 Search by title or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ maxWidth: { xs: '100%', sm: 400 } }}
                            size="small"
                        />
                        <Chip
                            label={`${filteredTasks.length} tasks found`}
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                        />
                    </Paper>

                    {/* Table */}
                    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Deadline</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No tasks found. Create your first task!</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <TableRow key={task.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {task.title}
                                                </Typography>
                                                {task.description && (
                                                    <Typography variant="caption" color="textSecondary" display="block">
                                                        {task.description.substring(0, 50)}...
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={task.status || 'TODO'}
                                                    color={getStatusColor(task.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={task.priority || 'MEDIUM'}
                                                    color={getPriorityColor(task.priority)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {task.assignedTo ? (
                                                    <Chip
                                                        label="Assigned"
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleManageIntern(task)}
                                                        sx={{ color: '#ed6c02', borderColor: '#ed6c02' }}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleOpenDialog(task)} color="primary" size="small">
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleDelete(task.id)} color="error" size="small">
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Assign Intern">
                                                    <IconButton onClick={() => handleManageIntern(task)} color="success" size="small">
                                                        <Add />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Footer */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Total: {tasks.length} | Completed: {completedCount} | In Progress: {inProgressCount} | Todo: {todoCount}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                    </Box>

                    {/* Create/Edit Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                            color: 'white',
                            py: 2
                        }}>
                            {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Task Title"
                                        fullWidth
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                        placeholder="Enter task title"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TaskIcon sx={{ color: '#1976d2' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Enter task description (optional)"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            label="Status"
                                        >
                                            <MenuItem value="TODO">📋 TODO</MenuItem>
                                            <MenuItem value="IN_PROGRESS">⏳ IN PROGRESS</MenuItem>
                                            <MenuItem value="SUBMITTED">📤 SUBMITTED</MenuItem>
                                            <MenuItem value="COMPLETED">✅ COMPLETED</MenuItem>
                                            <MenuItem value="REVISION_REQUIRED">🔄 REVISION REQUIRED</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                            label="Priority"
                                        >
                                            <MenuItem value="LOW">🟢 LOW</MenuItem>
                                            <MenuItem value="MEDIUM">🟡 MEDIUM</MenuItem>
                                            <MenuItem value="HIGH">🟠 HIGH</MenuItem>
                                            <MenuItem value="CRITICAL">🔴 CRITICAL</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Deadline"
                                        type="date"
                                        fullWidth
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <DateRange sx={{ color: '#1976d2' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Project ID (Optional)"
                                        fullWidth
                                        value={formData.projectId}
                                        onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                                        placeholder="Enter project ID"
                                        helperText="Leave empty if not linked to a project"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={!formData.title.trim()}
                                sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                                    }
                                }}
                            >
                                {editingTask ? 'Update' : 'Create'} Task
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Intern Assignment Dialog */}
                    <InternAssignmentDialog
                        open={assignmentDialogOpen}
                        onClose={() => {
                            setAssignmentDialogOpen(false);
                            setSelectedTask(null);
                        }}
                        project={selectedTask}
                        onUpdate={fetchTasks}
                        type="task"
                    />

                    {/* Snackbar */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={4000}
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

export default TaskManagement;