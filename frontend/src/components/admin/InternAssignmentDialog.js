import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, ListItemAvatar,
    Avatar, Chip, Button, Typography, Box,
    IconButton, Tooltip, Divider, Alert, CircularProgress,
    TextField, InputAdornment, Paper
} from '@mui/material';
import {
    Add, PersonAdd, CheckCircle,
    Cancel, Search, Refresh, Close, Email, Business
} from '@mui/icons-material';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const InternAssignmentDialog = ({
                                    open,
                                    onClose,
                                    project,
                                    onUpdate,
                                    type = 'project'
                                }) => {
    const [allInterns, setAllInterns] = useState([]);
    const [assignedInterns, setAssignedInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open, project]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (type === 'project') {
                if (!project || !project.id) {
                    setError('Project ID is missing');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`/admin/projects/${project.id}/details`);
                const data = response.data;

                setAssignedInterns(data.assignedInterns || []);
                setAllInterns(data.allInterns || []);
            } else {
                if (!project || !project.id) {
                    setError('Task ID is missing');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`/admin/tasks/${project.id}/details`);
                const data = response.data;
                setTask(data.task);

                if (data.assignedIntern) {
                    setAssignedInterns([data.assignedIntern]);
                } else {
                    setAssignedInterns([]);
                }
                setAllInterns(data.allInterns || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);

            if (error.response) {
                setError(`Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                setError('No response from server. Please check if backend is running.');
            } else {
                setError(`Error: ${error.message}`);
            }
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignIntern = async (intern) => {
        if (type === 'project') {
            if (assignedInterns.some(i => i.id === intern.id)) {
                toast.info('Intern already assigned to this project');
                return;
            }

            setSubmitting(true);
            try {
                await axios.post(`/admin/projects/${project.id}/assign-interns`, {
                    internIds: [intern.id]
                });
                setAssignedInterns([...assignedInterns, intern]);
                toast.success(`${intern.fullName} assigned to project`);
                onUpdate();
            } catch (error) {
                console.error('Assignment error:', error);
                toast.error(error.response?.data?.message || 'Failed to assign intern');
            } finally {
                setSubmitting(false);
            }
        } else {
            if (assignedInterns.length > 0) {
                toast.info('Task already assigned to someone');
                return;
            }

            setSubmitting(true);
            try {
                await axios.put(`/admin/tasks/${project.id}/assign/${intern.id}`);
                setAssignedInterns([intern]);
                toast.success(`${intern.fullName} assigned to task`);
                onUpdate();
            } catch (error) {
                console.error('Assignment error:', error);
                toast.error(error.response?.data?.message || 'Failed to assign intern');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handleRemoveIntern = async (intern) => {
        setSubmitting(true);
        try {
            if (type === 'project') {
                await axios.delete(`/admin/projects/${project.id}/remove-intern/${intern.id}`);
                setAssignedInterns(assignedInterns.filter(i => i.id !== intern.id));
                toast.success(`${intern.fullName} removed from project`);
                onUpdate();
            } else {
                await axios.delete(`/admin/tasks/${project.id}/unassign`);
                setAssignedInterns([]);
                toast.success('Task unassigned');
                onUpdate();
            }
        } catch (error) {
            console.error('Removal error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove intern');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInterns = allInterns.filter(intern =>
        intern.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableInterns = filteredInterns.filter(intern =>
        !assignedInterns.some(i => i.id === intern.id)
    );

    const getTitle = () => {
        if (type === 'project') {
            return 'Manage Project Interns';
        }
        return 'Assign Task to Intern';
    };

    const getSubtitle = () => {
        if (type === 'project') {
            return project?.name || 'Project';
        }
        return task?.title || 'Task';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                color: 'white',
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <PersonAdd />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {getTitle()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {getSubtitle()}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={fetchData}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                ) : (
                    <>
                        {/* Assigned Interns */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f8ff', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                                {type === 'project' ? '👥 Assigned Interns' : '👤 Assigned Intern'}
                                <Chip
                                    label={assignedInterns.length}
                                    size="small"
                                    sx={{ ml: 1, bgcolor: '#1976d2', color: 'white' }}
                                />
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {assignedInterns.length > 0 ? (
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {assignedInterns.map((intern) => (
                                        <Chip
                                            key={intern.id}
                                            avatar={<Avatar sx={{ bgcolor: '#1976d2' }}>{intern.fullName?.charAt(0)}</Avatar>}
                                            label={intern.fullName}
                                            onDelete={() => handleRemoveIntern(intern)}
                                            deleteIcon={<Cancel />}
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                p: 0.5,
                                                '& .MuiChip-label': { fontWeight: 500 },
                                                borderColor: '#1976d2'
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
                                    {type === 'project' ? 'No interns assigned to this project' : 'No intern assigned to this task'}
                                </Typography>
                            )}
                        </Paper>

                        {/* Search */}
                        <TextField
                            fullWidth
                            placeholder="🔍 Search interns by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Available Interns */}
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            📋 Available Interns
                            <Chip
                                label={availableInterns.length}
                                size="small"
                                sx={{ ml: 1, bgcolor: '#e0e0e0' }}
                            />
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {allInterns.length === 0 && !searchTerm ? (
                            <Alert severity="info">
                                No interns found in the system.
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => window.location.href = '/users'}
                                    sx={{ ml: 1 }}
                                >
                                    Create Intern
                                </Button>
                            </Alert>
                        ) : (
                            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {availableInterns.length > 0 ? (
                                    availableInterns.map((intern) => (
                                        <ListItem
                                            key={intern.id}
                                            secondaryAction={
                                                <Tooltip title={type === 'project' ? 'Assign to project' : 'Assign to task'}>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleAssignIntern(intern)}
                                                        disabled={submitting || (type === 'task' && assignedInterns.length > 0)}
                                                        color="primary"
                                                        sx={{
                                                            bgcolor: '#e3f2fd',
                                                            '&:hover': { bgcolor: '#bbdefb' }
                                                        }}
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                mb: 0.5,
                                                '&:hover': { bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: '#1976d2' }}>
                                                    {intern.fullName?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={intern.fullName}
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <Email sx={{ fontSize: 14 }} />
                                                            {intern.email}
                                                        </Box>
                                                        {intern.department && (
                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <Business sx={{ fontSize: 14 }} />
                                                                {intern.department}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <Chip
                                                label={intern.active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={intern.active ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Box textAlign="center" py={3}>
                                        <Typography color="textSecondary">
                                            {searchTerm ? 'No interns found matching your search' : 'All interns are already assigned'}
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <Button onClick={onClose}>Close</Button>
                <Button
                    onClick={fetchData}
                    variant="outlined"
                    startIcon={<Refresh />}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InternAssignmentDialog;