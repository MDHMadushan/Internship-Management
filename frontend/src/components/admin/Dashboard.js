import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, Avatar,
    CircularProgress, Chip, Divider, Button, Fade, Grow,
    IconButton, Tooltip, LinearProgress, Container
} from '@mui/material';
import {
    People, Assignment, CheckCircle, Pending, Warning,
    TrendingUp, TrendingDown, Timer, ArrowForward,
    School, Work, DoneAll, Add, Create, Task,
    Refresh, MoreVert, TrendingFlat, PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/dashboard/stats');
            setStats(response.data);

            // Sample activities - Replace with real data
            setActivities([
                {
                    id: 1,
                    title: 'John Doe submitted task: "Fix Login Bug"',
                    time: '2 hours ago',
                    status: 'pending',
                    user: 'John Doe'
                },
                {
                    id: 2,
                    title: 'Project "E-Commerce App" updated to In Progress',
                    time: '5 hours ago',
                    status: 'completed',
                    user: 'Admin'
                },
                {
                    id: 3,
                    title: 'Jane Smith joined the internship program',
                    time: '1 day ago',
                    status: 'completed',
                    user: 'Jane Smith'
                },
                {
                    id: 4,
                    title: 'Task "Database Schema Design" completed',
                    time: '2 days ago',
                    status: 'completed',
                    user: 'John Doe'
                },
            ]);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({
                activeInterns: 0,
                activeProjects: 0,
                pendingTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                totalInterns: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Add Intern',
            icon: <PersonAdd />,
            color: '#1976d2',
            path: '/users',
            description: 'Create new intern account'
        },
        {
            title: 'Create Project',
            icon: <Create />,
            color: '#2e7d32',
            path: '/projects',
            description: 'Start a new project'
        },
        {
            title: 'Assign Task',
            icon: <Task />,
            color: '#ed6c02',
            path: '/tasks',
            description: 'Assign task to intern'
        },
        {
            title: 'View Reports',
            icon: <TrendingUp />,
            color: '#9c27b0',
            path: '/reports',
            description: 'Analytics & insights'
        },
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    const StatCard = ({
                          icon: Icon,
                          title,
                          value,
                          color,
                          gradient,
                          subtitle,
                          trend,
                          trendLabel,
                          bgColor,
                          iconBgColor,
                          progressValue
                      }) => (
        <Grow in timeout={500}>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                    height: '100%',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    background: gradient || `linear-gradient(135deg, #ffffff 0%, ${bgColor || '#f8f9fa'} 100%)`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 60px ${color}40`,
                        '& .card-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                        },
                        '& .card-bg-shape': {
                            transform: 'scale(1.5) rotate(30deg)',
                        }
                    }
                }}>
                    <Box
                        className="card-bg-shape"
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                            transition: 'all 0.6s ease',
                            pointerEvents: 'none'
                        }}
                    />

                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                            <Box flex={1}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem',
                                        mb: 0.5
                                    }}
                                >
                                    {title}
                                </Typography>

                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: color,
                                        fontSize: { xs: '2rem', sm: '2.5rem' },
                                        lineHeight: 1.2,
                                        mb: 0.5
                                    }}
                                >
                                    {value}
                                </Typography>

                                {subtitle && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#94a3b8',
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>

                            <Box
                                className="card-icon"
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3,
                                    background: iconBgColor || `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    flexShrink: 0,
                                    ml: 2
                                }}
                            >
                                <Icon sx={{
                                    fontSize: 28,
                                    color: color,
                                    transition: 'all 0.3s ease'
                                }} />
                            </Box>
                        </Box>

                        {trend !== undefined && (
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mt={1.5}
                                sx={{
                                    pt: 1.5,
                                    borderTop: '1px solid rgba(0,0,0,0.06)'
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1,
                                        py: 0.3,
                                        borderRadius: 2,
                                        bgcolor: trend > 0 ? '#e8f5e9' : trend < 0 ? '#ffebee' : '#f5f5f5',
                                    }}
                                >
                                    {trend > 0 ?
                                        <TrendingUp sx={{ fontSize: 16, color: '#2e7d32' }} /> :
                                        trend < 0 ?
                                            <TrendingDown sx={{ fontSize: 16, color: '#c62828' }} /> :
                                            <TrendingFlat sx={{ fontSize: 16, color: '#757575' }} />
                                    }
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 600,
                                            color: trend > 0 ? '#2e7d32' : trend < 0 ? '#c62828' : '#757575'
                                        }}
                                    >
                                        {Math.abs(trend)}%
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    {trendLabel || 'from last month'}
                                </Typography>
                            </Box>
                        )}

                        {progressValue !== undefined && (
                            <Box mt={1.5}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progressValue}
                                    sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: `${color}20`,
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: color,
                                            borderRadius: 2
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grow>
    );

    return (
        <Container maxWidth="xl">
            <Fade in timeout={300}>
                <Box>
                    {/* ========== WELCOME SECTION ========== */}
                    <Box sx={{
                        mb: 4,
                        p: 4,
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
                            top: -100,
                            right: -50,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: -80,
                            left: -30,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                👋 Welcome back, {user?.fullName || 'Admin'}!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Here's what's happening with your internship program
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                label="Today"
                                icon={<Timer />}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <Tooltip title="Refresh">
                                <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={fetchDashboardStats}
                                >
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* ========== STATISTICS CARDS ========== */}
                    <Grid container spacing={3}>
                        <StatCard
                            icon={People}
                            title="Active Interns"
                            value={stats?.activeInterns || 0}
                            color="#1976d2"
                            gradient="linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)"
                            bgColor="#e3f2fd"
                            iconBgColor="#1976d220"
                            subtitle="Total interns enrolled"
                            trend={12}
                            trendLabel="from last month"
                            progressValue={65}
                        />
                        <StatCard
                            icon={Assignment}
                            title="Active Projects"
                            value={stats?.activeProjects || 0}
                            color="#2e7d32"
                            gradient="linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)"
                            bgColor="#e8f5e9"
                            iconBgColor="#2e7d3220"
                            subtitle="Currently running"
                            trend={5}
                            trendLabel="from last month"
                            progressValue={45}
                        />
                        <StatCard
                            icon={Pending}
                            title="Pending Tasks"
                            value={stats?.pendingTasks || 0}
                            color="#ed6c02"
                            gradient="linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)"
                            bgColor="#fff3e0"
                            iconBgColor="#ed6c0220"
                            subtitle="Need attention"
                            trend={-8}
                            trendLabel="from last month"
                            progressValue={30}
                        />
                        <StatCard
                            icon={CheckCircle}
                            title="Completed Tasks"
                            value={stats?.completedTasks || 0}
                            color="#2e7d32"
                            gradient="linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)"
                            bgColor="#e8f5e9"
                            iconBgColor="#2e7d3220"
                            subtitle="Done ✓"
                            trend={15}
                            trendLabel="from last month"
                            progressValue={80}
                        />
                        <StatCard
                            icon={Warning}
                            title="Overdue Tasks"
                            value={stats?.overdueTasks || 0}
                            color="#d32f2f"
                            gradient="linear-gradient(135deg, #ffffff 0%, #ffebee 100%)"
                            bgColor="#ffebee"
                            iconBgColor="#d32f2f20"
                            subtitle="Urgent action needed!"
                            trend={20}
                            trendLabel="from last month"
                            progressValue={15}
                        />
                        <StatCard
                            icon={School}
                            title="Total Interns"
                            value={stats?.totalInterns || 0}
                            color="#7b1fa2"
                            gradient="linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)"
                            bgColor="#f3e5f5"
                            iconBgColor="#7b1fa220"
                            subtitle="All time"
                            trend={0}
                            trendLabel="no change"
                            progressValue={100}
                        />
                    </Grid>

                    {/* ========== QUICK ACTIONS ========== */}
                    <Grow in timeout={800}>
                        <Paper sx={{
                            p: 4,
                            mt: 4,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 300,
                                height: 300,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(25, 118, 210, 0.03) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }} />
                            <Box sx={{
                                position: 'absolute',
                                bottom: -150,
                                left: -100,
                                width: 400,
                                height: 400,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(46, 125, 50, 0.03) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                                            ⚡ Quick Actions
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Perform common tasks with one click
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label="4 actions available"
                                        size="small"
                                        sx={{
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 500
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={3}>
                                    {quickActions.map((action, index) => (
                                        <Grid item xs={12} sm={6} md={3} key={action.title}>
                                            <Box
                                                onClick={() => navigate(action.path)}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: `0 4px 20px ${action.color}40`,
                                                    '&:hover': {
                                                        transform: 'translateY(-8px) scale(1.02)',
                                                        boxShadow: `0 12px 40px ${action.color}60`,
                                                        '& .action-icon': {
                                                            transform: 'scale(1.2) rotate(5deg)'
                                                        },
                                                        '& .action-shape': {
                                                            transform: 'scale(1.5) rotate(30deg)'
                                                        }
                                                    },
                                                    '&:active': {
                                                        transform: 'scale(0.95)'
                                                    },
                                                    height: '100%',
                                                    minHeight: 120,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <Box
                                                    className="action-shape"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -30,
                                                        right: -30,
                                                        width: 100,
                                                        height: 100,
                                                        borderRadius: '50%',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        transition: 'all 0.5s ease',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                                <Box
                                                    className="action-shape"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: -20,
                                                        left: -20,
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: '50%',
                                                        background: 'rgba(255,255,255,0.08)',
                                                        transition: 'all 0.5s ease 0.1s',
                                                        pointerEvents: 'none'
                                                    }}
                                                />

                                                <Box
                                                    className="action-icon"
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: 2,
                                                        background: 'rgba(255,255,255,0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mb: 1.5,
                                                        transition: 'all 0.3s ease',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    {React.cloneElement(action.icon, {
                                                        sx: { fontSize: 28 }
                                                    })}
                                                </Box>

                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '1rem',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {action.title}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        opacity: 0.8,
                                                        mt: 0.5,
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {action.description || `Click to ${action.title.toLowerCase()}`}
                                                </Typography>

                                                <Box sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 3,
                                                    background: 'rgba(255,255,255,0.2)'
                                                }}>
                                                    <Box sx={{
                                                        width: `${(index + 1) * 25}%`,
                                                        height: '100%',
                                                        background: 'rgba(255,255,255,0.5)',
                                                        borderRadius: '0 2px 2px 0',
                                                        transition: 'width 2s ease'
                                                    }} />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{
                                    mt: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    p: 2,
                                    bgcolor: 'rgba(0,0,0,0.02)',
                                    borderRadius: 2
                                }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: '#4caf50',
                                            animation: 'pulse 2s infinite'
                                        }} />
                                        <Typography variant="caption" color="textSecondary">
                                            All systems ready
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">
                                        💡 Tip: Hover over actions for more options
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grow>

                    {/* ========== ENHANCED RECENT ACTIVITY ========== */}
                    <Grow in timeout={1000}>
                        <Paper sx={{
                            p: 0,
                            mt: 4,
                            borderRadius: 4,
                            border: '1px solid rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {/* Header with Gradient */}
                            <Box sx={{
                                p: 3,
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: 20 }}>📊</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                                            Recent Activity
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Latest updates from your internship program
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Chip
                                        label={`${activities.length} activities`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 500
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        endIcon={<ArrowForward />}
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1976d2',
                                            '&:hover': {
                                                background: 'rgba(25, 118, 210, 0.08)'
                                            }
                                        }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                            </Box>

                            {/* Activity List */}
                            {activities.length > 0 ? (
                                <Box sx={{ p: 2 }}>
                                    {activities.map((activity, index) => (
                                        <Grow
                                            key={activity.id || index}
                                            in={true}
                                            timeout={500 + (index * 100)}
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    mb: 1.5,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid rgba(0,0,0,0.04)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        transform: 'translateX(8px)',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                                        border: '1px solid rgba(25, 118, 210, 0.2)',
                                                        '& .activity-actions': {
                                                            opacity: 1
                                                        }
                                                    },
                                                    '&:last-child': {
                                                        mb: 0
                                                    }
                                                }}
                                            >
                                                {/* Status Bar on Left */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 4,
                                                    background: activity.status === 'pending'
                                                        ? 'linear-gradient(180deg, #ed6c02, #ff9800)'
                                                        : 'linear-gradient(180deg, #2e7d32, #66bb6a)',
                                                    borderRadius: '0 2px 2px 0'
                                                }} />

                                                {/* Activity Content */}
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        background: activity.status === 'pending'
                                                            ? 'linear-gradient(135deg, #fff3e0, #ffe0b2)'
                                                            : 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {activity.status === 'pending' ?
                                                            <Pending sx={{ color: '#ed6c02', fontSize: 24 }} /> :
                                                            <DoneAll sx={{ color: '#2e7d32', fontSize: 24 }} />
                                                        }
                                                    </Box>

                                                    <Box flex={1}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                                            {activity.title}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <Timer sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {activity.time}
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={activity.status === 'pending' ? 'Pending Review' : 'Completed'}
                                                                size="small"
                                                                color={activity.status === 'pending' ? 'warning' : 'success'}
                                                                sx={{
                                                                    height: 22,
                                                                    fontSize: '0.6rem',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                            {activity.user && (
                                                                <Chip
                                                                    label={`👤 ${activity.user}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        height: 22,
                                                                        fontSize: '0.6rem',
                                                                        borderColor: 'rgba(0,0,0,0.1)'
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                {/* Actions */}
                                                <Box
                                                    className="activity-actions"
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 0.5,
                                                        opacity: { xs: 1, sm: 0 },
                                                        transition: 'opacity 0.3s ease'
                                                    }}
                                                >
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" sx={{ color: '#1976d2' }}>
                                                            <MoreVert fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Mark as Read">
                                                        <IconButton size="small" sx={{ color: '#2e7d32' }}>
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Grow>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: 32 }}>📭</Typography>
                                    </Box>
                                    <Typography variant="h6" color="textSecondary">
                                        No Recent Activity
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Activities will appear here when interns start working
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Refresh />}
                                        onClick={fetchDashboardStats}
                                    >
                                        Refresh
                                    </Button>
                                </Box>
                            )}

                            {/* Footer */}
                            <Box sx={{
                                p: 2,
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                                background: '#fafafa',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 1
                            }}>
                                <Typography variant="caption" color="textSecondary">
                                    Showing {activities.length} recent activities
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
                                            Live updates
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Updated {new Date().toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grow>

                    {/* ========== FOOTER ========== */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date().toLocaleString()}
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Typography variant="caption" color="textSecondary">
                                🟢 System Online
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                v2.0.0
                            </Typography>
                        </Box>
                    </Box>

                    {/* Pulse Animation */}
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

export default Dashboard;