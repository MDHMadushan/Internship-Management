import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Container, Fade, Tooltip, Snackbar, Alert,
    Card, CardContent, MenuItem, FormControl, InputLabel,
    Select, Avatar, Grow, InputAdornment, CircularProgress
} from '@mui/material';
import {
    Add, Edit, Delete, Refresh, Assignment, DateRange,
    Code, Schedule, CheckCircle, Pending, Warning,
    MoreVert, Search, FilterList, People, PersonAdd,
    Business, Folder
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';
import InternAssignmentDialog from './InternAssignmentDialog';

const ProjectManagement = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        technology: '',
        status: 'ACTIVE',
        deadline: '',
        assignedInternIds: []
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/projects');
            setProjects(response.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            showSnackbar('Failed to load projects', 'error');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                description: project.description || '',
                technology: project.technology || '',
                status: project.status || 'ACTIVE',
                deadline: project.deadline ? project.deadline.split('T')[0] : '',
                assignedInternIds: project.assignedInternIds || []
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                description: '',
                technology: '',
                status: 'ACTIVE',
                deadline: '',
                assignedInternIds: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProject(null);
    };

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!formData.name.trim()) {
                showSnackbar('Project name is required', 'error');
                return;
            }

            const data = {
                name: formData.name.trim(),
                description: formData.description || '',
                technology: formData.technology || '',
                status: formData.status || 'ACTIVE',
                createdBy: user?.email || 'admin'
            };

            // Add deadline if present
            if (formData.deadline) {
                data.deadline = formData.deadline + 'T00:00:00';
            }

            console.log('📤 Creating project with data:', data);

            let response;
            if (editingProject) {
                response = await axios.put(`/admin/projects/${editingProject.id}`, data);
                showSnackbar('✅ Project updated successfully');
            } else {
                response = await axios.post('/admin/projects', data);
                showSnackbar('✅ Project created successfully');
            }

            console.log('📥 Response:', response.data);

            handleCloseDialog();
            fetchProjects();
        } catch (error) {
            console.error('❌ Error saving project:', error);

            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                showSnackbar(`❌ ${error.response.data?.message || error.response.statusText}`, 'error');
            } else if (error.request) {
                showSnackbar('❌ No response from server. Is backend running?', 'error');
            } else {
                showSnackbar(`❌ ${error.message}`, 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`/admin/projects/${id}`);
                showSnackbar('✅ Project deleted');
                fetchProjects();
            } catch (error) {
                showSnackbar('❌ Failed to delete', 'error');
            }
        }
    };

    const handleManageInterns = (project) => {
        setSelectedProject(project);
        setAssignmentDialogOpen(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            'PLANNING': 'default',
            'ACTIVE': 'success',
            'COMPLETED': 'primary',
            'ON_HOLD': 'warning'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PLANNING': '📋',
            'ACTIVE': '🚀',
            'COMPLETED': '✅',
            'ON_HOLD': '⏸️'
        };
        return icons[status] || '📌';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PLANNING': 'Planning',
            'ACTIVE': 'Active',
            'COMPLETED': 'Completed',
            'ON_HOLD': 'On Hold'
        };
        return labels[status] || status;
    };

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technology?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
    const planningCount = projects.filter(p => p.status === 'PLANNING').length;
    const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
    const onHoldCount = projects.filter(p => p.status === 'ON_HOLD').length;

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
                                📁 Project Management
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Manage all projects and assignments
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchProjects}
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
                                Create New Project
                            </Button>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="primary">{projects.length}</Typography>
                                    <Typography variant="body2" color="textSecondary">Total Projects</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="success.main">{activeCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Active Projects</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="warning.main">{planningCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Planning</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #ffebee 100%)' }}>
                                <CardContent>
                                    <Typography variant="h4" color="error.main">{onHoldCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">On Hold</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Search */}
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
                        <TextField
                            fullWidth
                            placeholder="🔍 Search by name, technology, or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                maxWidth: { xs: '100%', sm: 500 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Chip
                            icon={<FilterList />}
                            label={`${filteredProjects.length} projects found`}
                            size="small"
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
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Project Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Technology</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Deadline</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Interns</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProjects.map((project, index) => (
                                    <Grow in timeout={300 + (index * 50)} key={project.id}>
                                        <TableRow
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: '#f5f8ff',
                                                    '& .action-buttons': {
                                                        opacity: 1
                                                    }
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                                        {project.name}
                                                    </Typography>
                                                    {project.description && (
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            {project.description.substring(0, 60)}...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<Code sx={{ fontSize: 14 }} />}
                                                    label={project.technology || 'Not Specified'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 2,
                                                        borderColor: 'rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<span>{getStatusIcon(project.status)}</span>}
                                                    label={getStatusLabel(project.status)}
                                                    color={getStatusColor(project.status)}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <DateRange sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<People />}
                                                    onClick={() => handleManageInterns(project)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        borderColor: '#1976d2',
                                                        color: '#1976d2'
                                                    }}
                                                >
                                                    {project.assignedInternIds?.length || 0} Assigned
                                                </Button>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box
                                                    className="action-buttons"
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: 0.5,
                                                        opacity: { xs: 1, sm: 0 },
                                                        transition: 'opacity 0.3s ease'
                                                    }}
                                                >
                                                    <Tooltip title="Edit Project">
                                                        <IconButton
                                                            onClick={() => handleOpenDialog(project)}
                                                            color="primary"
                                                            size="small"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Project">
                                                        <IconButton
                                                            onClick={() => handleDelete(project.id)}
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Manage Interns">
                                                        <IconButton
                                                            onClick={() => handleManageInterns(project)}
                                                            color="success"
                                                            size="small"
                                                        >
                                                            <PersonAdd fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </Grow>
                                ))}
                                {filteredProjects.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
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
                                                    <Folder sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                                </Box>
                                                <Typography variant="h6" color="textSecondary">
                                                    No Projects Found
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Click "Create New Project" to get started!
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={() => handleOpenDialog()}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Create New Project
                                                </Button>
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
                            Total Projects: {projects.length} | Active: {activeCount} | Planning: {planningCount} | On Hold: {onHoldCount}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#4caf50',
                                    animation: 'pulse 2s infinite'
                                }} />
                                <Typography variant="caption" color="textSecondary">
                                    Live
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                Last updated: {new Date().toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Fade>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                    color: 'white',
                    py: 2
                }}>
                    {editingProject ? '✏️ Edit Project' : '➕ Create New Project'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Project Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Assignment sx={{ color: '#1976d2' }} />
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
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Technology Stack"
                                fullWidth
                                value={formData.technology}
                                onChange={(e) => setFormData({...formData, technology: e.target.value})}
                                placeholder="e.g., React, Spring Boot, MongoDB"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    label="Status"
                                >
                                    <MenuItem value="PLANNING">📋 Planning</MenuItem>
                                    <MenuItem value="ACTIVE">🚀 Active</MenuItem>
                                    <MenuItem value="ON_HOLD">⏸️ On Hold</MenuItem>
                                    <MenuItem value="COMPLETED">✅ Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Deadline"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.deadline}
                                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name.trim()}
                        sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                            }
                        }}
                    >
                        {editingProject ? 'Update' : 'Create'} Project
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Intern Assignment Dialog */}
            <InternAssignmentDialog
                open={assignmentDialogOpen}
                onClose={() => {
                    setAssignmentDialogOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
                onUpdate={fetchProjects}
                type="project"
            />

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

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </Container>
    );
};

export default ProjectManagement;