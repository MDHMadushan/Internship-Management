import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent,
    Container, Fade, CircularProgress, Divider, Chip,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Avatar, LinearProgress
} from '@mui/material';
import {
    Assessment, People, Assignment, Task, CheckCircle,
    Pending, Warning, TrendingUp, TrendingDown,
    Download, Print, BarChart, PieChart, School,
    CalendarToday, History, Timer, Refresh, Feedback  // ← ADDED
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch all data
            const [usersRes, projectsRes, tasksRes, logsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/projects'),
                axios.get('/admin/tasks'),
                axios.get('/admin/daily-logs/with-interns').catch(() => ({ data: [] }))
            ]);

            setUsers(usersRes.data || []);
            setProjects(projectsRes.data || []);
            setTasks(tasksRes.data || []);
            setLogs(logsRes.data || []);

            // Calculate stats
            const interns = usersRes.data.filter(u => u.role === 'INTERN');
            const admins = usersRes.data.filter(u => u.role === 'ADMIN');
            const activeInterns = interns.filter(u => u.active);
            const completedTasks = tasksRes.data.filter(t => t.status === 'COMPLETED');
            const pendingTasks = tasksRes.data.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
            const activeProjects = projectsRes.data.filter(p => p.status === 'ACTIVE');

            // Tasks by status
            const tasksByStatus = {
                todo: tasksRes.data.filter(t => t.status === 'TODO').length,
                inProgress: tasksRes.data.filter(t => t.status === 'IN_PROGRESS').length,
                submitted: tasksRes.data.filter(t => t.status === 'SUBMITTED').length,
                completed: tasksRes.data.filter(t => t.status === 'COMPLETED').length,
                revision: tasksRes.data.filter(t => t.status === 'REVISION_REQUIRED').length
            };

            setStats({
                totalUsers: usersRes.data.length,
                totalInterns: interns.length,
                activeInterns: activeInterns.length,
                totalAdmins: admins.length,
                totalProjects: projectsRes.data.length,
                activeProjects: activeProjects.length,
                totalTasks: tasksRes.data.length,
                completedTasks: completedTasks.length,
                pendingTasks: pendingTasks.length,
                tasksByStatus,
                totalLogs: logsRes.data.length,
                logsWithFeedback: logsRes.data.filter(l => l.log?.supervisorFeedback).length
            });

        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    const StatCard = ({ icon: Icon, title, value, color, subtitle, trend }) => (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                }
            }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                                {value}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="caption" color="textSecondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
                            <Icon />
                        </Avatar>
                    </Box>
                    {trend !== undefined && (
                        <Box display="flex" alignItems="center" mt={1}>
                            {trend > 0 ?
                                <TrendingUp sx={{ color: '#4caf50', fontSize: 16 }} /> :
                                <TrendingDown sx={{ color: '#f44336', fontSize: 16 }} />
                            }
                            <Typography variant="caption" color="textSecondary" ml={0.5}>
                                {Math.abs(trend)}% from last month
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );

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
                                📊 Reports & Analytics
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Overview of your internship program
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                icon={<CalendarToday />}
                                label={new Date().toLocaleDateString()}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchAllData}
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
                    <Grid container spacing={3}>
                        <StatCard
                            icon={People}
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            color="#1976d2"
                            subtitle={`${stats?.activeInterns || 0} active interns`}
                            trend={8}
                        />
                        <StatCard
                            icon={School}
                            title="Total Interns"
                            value={stats?.totalInterns || 0}
                            color="#2e7d32"
                            subtitle="All interns"
                            trend={12}
                        />
                        <StatCard
                            icon={Assignment}
                            title="Total Projects"
                            value={stats?.totalProjects || 0}
                            color="#ed6c02"
                            subtitle={`${stats?.activeProjects || 0} active`}
                            trend={5}
                        />
                        <StatCard
                            icon={Task}
                            title="Total Tasks"
                            value={stats?.totalTasks || 0}
                            color="#9c27b0"
                            subtitle={`${stats?.completedTasks || 0} completed`}
                            trend={15}
                        />
                        <StatCard
                            icon={CheckCircle}
                            title="Completed Tasks"
                            value={stats?.completedTasks || 0}
                            color="#2e7d32"
                            subtitle="Done ✓"
                            trend={20}
                        />
                        <StatCard
                            icon={Pending}
                            title="Pending Tasks"
                            value={stats?.pendingTasks || 0}
                            color="#ed6c02"
                            subtitle="Need attention"
                            trend={-5}
                        />
                    </Grid>

                    {/* Task Status Breakdown */}
                    <Paper sx={{ p: 3, mt: 4, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            📋 Task Status Breakdown
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label="TODO" color="default" />
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.totalTasks ? (stats.tasksByStatus.todo / stats.totalTasks * 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2">{stats?.tasksByStatus.todo || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label="IN PROGRESS" color="warning" />
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.totalTasks ? (stats.tasksByStatus.inProgress / stats.totalTasks * 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2">{stats?.tasksByStatus.inProgress || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label="COMPLETED" color="success" />
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.totalTasks ? (stats.tasksByStatus.completed / stats.totalTasks * 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2">{stats?.tasksByStatus.completed || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label="SUBMITTED" color="info" />
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.totalTasks ? (stats.tasksByStatus.submitted / stats.totalTasks * 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2">{stats?.tasksByStatus.submitted || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label="REVISION" color="error" />
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.totalTasks ? (stats.tasksByStatus.revision / stats.totalTasks * 100) : 0}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2">{stats?.tasksByStatus.revision || 0}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Daily Log Summary */}
                    <Paper sx={{ p: 3, mt: 4, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            📝 Daily Log Summary
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Box textAlign="center" p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    <History sx={{ fontSize: 40, color: '#1976d2' }} />
                                    <Typography variant="h4">{stats?.totalLogs || 0}</Typography>
                                    <Typography variant="caption" color="textSecondary">Total Logs</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box textAlign="center" p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    <Feedback sx={{ fontSize: 40, color: '#2e7d32' }} />
                                    <Typography variant="h4">{stats?.logsWithFeedback || 0}</Typography>
                                    <Typography variant="caption" color="textSecondary">With Feedback</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box textAlign="center" p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    <Timer sx={{ fontSize: 40, color: '#ed6c02' }} />
                                    <Typography variant="h4">
                                        {stats?.totalLogs ? Math.round(stats.logsWithFeedback / stats.totalLogs * 100) : 0}%
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">Feedback Rate</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Footer */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Report generated on {new Date().toLocaleString()}
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
                                    Live Data
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                v2.0.0
                            </Typography>
                        </Box>
                    </Box>

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

export default Reports;