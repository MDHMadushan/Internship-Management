import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, Avatar,
    CircularProgress, Chip, Divider, Button, Fade, Grow,
    IconButton, Tooltip, LinearProgress, Container, List,
    ListItem, ListItemText, ListItemIcon, ListItemAvatar
} from '@mui/material';
import {
    Dashboard, Assignment, CheckCircle, Pending, Warning,
    TrendingUp, Timer, ArrowForward, School, Work,
    DoneAll, Task, People, Refresh, MoreVert,
    CalendarToday, PlayArrow, Check, Close
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const InternDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Get dashboard stats
            const statsResponse = await axios.get('/intern/dashboard/stats');
            setStats(statsResponse.data);

            // Get tasks
            const tasksResponse = await axios.get('/intern/tasks');
            setTasks(tasksResponse.data || []);

            // Get projects
            const projectsResponse = await axios.get('/intern/projects');
            setProjects(projectsResponse.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                totalProjects: 0,
                activeProjects: 0,
                totalLogs: 0,
                recentTasks: []
            });
        } finally {
            setLoading(false);
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

    const getStatusIcon = (status) => {
        switch(status) {
            case 'COMPLETED': return <CheckCircle sx={{ fontSize: 16 }} />;
            case 'IN_PROGRESS': return <PlayArrow sx={{ fontSize: 16 }} />;
            case 'TODO': return <Pending sx={{ fontSize: 16 }} />;
            default: return <Warning sx={{ fontSize: 16 }} />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
        <Grow in timeout={500}>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                    height: '100%',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, #ffffff 0%, ${color}10 100%)`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 60px ${color}40`,
                        '& .stat-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                        }
                    }
                }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                            transition: 'all 0.6s ease',
                            pointerEvents: 'none'
                        }}
                    />

                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: color,
                                        fontSize: { xs: '2rem', sm: '2.5rem' },
                                        lineHeight: 1.2
                                    }}
                                >
                                    {value}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        mt: 0.5
                                    }}
                                >
                                    {title}
                                </Typography>
                            </Box>
                            <Box
                                className="stat-icon"
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background: `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Icon sx={{
                                    fontSize: 24,
                                    color: color
                                }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grow>
    );

    return (
        <Container maxWidth="xl">
            <Fade in timeout={300}>
                <Box>
                    {/* Welcome Section */}
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
                        <Box sx={{
                            position: 'absolute',
                            top: -80,
                            right: -30,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                👋 Welcome, {user?.fullName}!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Here's your internship dashboard
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                label="Intern Portal"
                                icon={<School />}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <Tooltip title="Refresh">
                                <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={fetchDashboardData}
                                >
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3}>
                        <StatCard
                            icon={Task}
                            title="Total Tasks"
                            value={stats?.totalTasks || 0}
                            color="#1976d2"
                        />
                        <StatCard
                            icon={CheckCircle}
                            title="Completed Tasks"
                            value={stats?.completedTasks || 0}
                            color="#2e7d32"
                        />
                        <StatCard
                            icon={Pending}
                            title="Pending Tasks"
                            value={stats?.pendingTasks || 0}
                            color="#ed6c02"
                        />
                        <StatCard
                            icon={Assignment}
                            title="Active Projects"
                            value={stats?.activeProjects || 0}
                            color="#7b1fa2"
                        />
                    </Grid>

                    {/* Quick Actions */}
                    <Grow in timeout={800}>
                        <Paper sx={{
                            p: 3,
                            mt: 4,
                            borderRadius: 4,
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                ⚡ Quick Actions
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Task />}
                                        onClick={() => navigate('/my-tasks')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 30px rgba(25, 118, 210, 0.4)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        View Tasks
                                    </Button>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Assignment />}
                                        onClick={() => navigate('/my-projects')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 30px rgba(46, 125, 50, 0.4)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        My Projects
                                    </Button>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<CalendarToday />}
                                        onClick={() => navigate('/daily-logs')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 30px rgba(237, 108, 2, 0.4)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Daily Log
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grow>

                    {/* My Projects */}
                    <Grow in timeout={1000}>
                        <Paper sx={{
                            p: 3,
                            mt: 4,
                            borderRadius: 4,
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    📁 My Projects
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/my-projects')}
                                >
                                    View All
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {projects.length > 0 ? (
                                <Grid container spacing={2}>
                                    {projects.slice(0, 3).map((project) => (
                                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                                            <Card sx={{
                                                borderRadius: 3,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                                                }
                                            }}>
                                                <CardContent>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {project.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" display="block">
                                                        {project.technology}
                                                    </Typography>
                                                    <Chip
                                                        label={project.status}
                                                        color={project.status === 'ACTIVE' ? 'success' : 'default'}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                    {project.deadline && (
                                                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                                                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography color="textSecondary" align="center" py={3}>
                                    No projects assigned yet
                                </Typography>
                            )}
                        </Paper>
                    </Grow>

                    {/* Recent Tasks */}
                    <Grow in timeout={1100}>
                        <Paper sx={{
                            p: 3,
                            mt: 4,
                            borderRadius: 4,
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    📋 Recent Tasks
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/my-tasks')}
                                >
                                    View All
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {tasks.length > 0 ? (
                                tasks.slice(0, 5).map((task) => (
                                    <Box
                                        key={task.id}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Chip
                                                icon={getStatusIcon(task.status)}
                                                label={task.status}
                                                color={getStatusColor(task.status)}
                                                size="small"
                                            />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {task.title}
                                                </Typography>
                                                {task.deadline && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Tooltip title="Update Status">
                                            <IconButton size="small" color="primary">
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="textSecondary" align="center" py={3}>
                                    No tasks assigned yet
                                </Typography>
                            )}
                        </Paper>
                    </Grow>

                    {/* Footer */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Typography variant="caption" color="textSecondary">
                                🟢 System Online
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Intern Portal v1.0
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Container>
    );
};

export default InternDashboard;