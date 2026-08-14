import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Container, Fade, Tooltip, Snackbar, Alert,
    Card, CardContent, LinearProgress, MenuItem, FormControl,
    InputLabel, Select, Avatar, Grow, InputAdornment,
    CircularProgress, CardActions, Divider
} from '@mui/material';
import {
    Refresh, Assignment, DateRange, Code, Business,
    Schedule, CheckCircle, Pending, Warning, MoreVert,
    Search, FilterList, People, Launch, School,
    Task, Close, Visibility, Info
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const MyProjects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/intern/projects');
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

    const handleViewDetails = (project) => {
        setSelectedProject(project);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetails = () => {
        setOpenDetailsDialog(false);
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technology?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                📁 My Projects
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Projects assigned to you
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                icon={<Assignment />}
                                label={`${projects.length} projects`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
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
                        </Box>
                    </Box>

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
                            placeholder="🔍 Search projects by name, technology, or status..."
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

                    {/* Project Cards */}
                    {filteredProjects.length > 0 ? (
                        <Grid container spacing={3}>
                            {filteredProjects.map((project, index) => (
                                <Grow in timeout={300 + (index * 50)} key={project.id}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{
                                            borderRadius: 4,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                                            },
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                                            {project.name}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                            <Chip
                                                                icon={<Code sx={{ fontSize: 14 }} />}
                                                                label={project.technology || 'Not Specified'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                icon={<span>{getStatusIcon(project.status)}</span>}
                                                                label={getStatusLabel(project.status)}
                                                                color={getStatusColor(project.status)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Tooltip title="More options">
                                                        <IconButton size="small">
                                                            <MoreVert />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                {project.description && (
                                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                                        {project.description}
                                                    </Typography>
                                                )}

                                                <Box display="flex" alignItems="center" gap={2} mt={2}>
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <DateRange sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Task />}
                                                    onClick={() => navigate('/my-tasks')}
                                                    sx={{ color: '#1976d2' }}
                                                >
                                                    View Tasks
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleViewDetails(project)}
                                                    sx={{ color: '#2e7d32' }}
                                                >
                                                    View Details
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                </Grow>
                            ))}
                        </Grid>
                    ) : (
                        <Paper sx={{
                            p: 6,
                            borderRadius: 4,
                            textAlign: 'center',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
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
                                    <Assignment sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                </Box>
                                <Typography variant="h6" color="textSecondary">
                                    No Projects Assigned
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    You haven't been assigned to any projects yet.
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* Footer */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Total Projects: {projects.length}
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

                    {/* ========== VIEW DETAILS DIALOG ========== */}
                    <Dialog
                        open={openDetailsDialog}
                        onClose={handleCloseDetails}
                        maxWidth="md"
                        fullWidth
                    >
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
                                <Info />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Project Details
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {selectedProject?.name}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={handleCloseDetails} sx={{ color: 'white' }}>
                                <Close />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 3 }}>
                            {selectedProject && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Project Name</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {selectedProject.name}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1">
                                                {selectedProject.description || 'No description provided'}
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">Technology</Typography>
                                        <Chip
                                            label={selectedProject.technology || 'Not Specified'}
                                            icon={<Code />}
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                        <Chip
                                            icon={<span>{getStatusIcon(selectedProject.status)}</span>}
                                            label={getStatusLabel(selectedProject.status)}
                                            color={getStatusColor(selectedProject.status)}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Deadline</Typography>
                                        <Typography variant="body1">
                                            {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'No deadline set'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Assigned Interns</Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <People />
                                            <Typography variant="body1">
                                                {selectedProject.assignedInternIds?.length || 0} intern(s) assigned
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider />
                                        <Box display="flex" gap={2} sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Task />}
                                                onClick={() => {
                                                    handleCloseDetails();
                                                    navigate('/my-tasks');
                                                }}
                                            >
                                                View Tasks
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Close />}
                                                onClick={handleCloseDetails}
                                            >
                                                Close
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}
                        </DialogContent>
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

                    <style>
                        {`
                            @keyframes pulse {
                                0% { opacity: 1; }
                                50% { opacity: 0.5; }
                                100% { opacity: 1; }
                            }
                        `}
                    </style>
                </Box>
            </Fade>
        </Container>
    );
};

export default MyProjects;