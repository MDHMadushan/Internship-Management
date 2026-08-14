import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip,
    Badge,
    Tooltip,
    Collapse,
    alpha,
    useTheme
} from '@mui/material';
import {
    Dashboard,
    People,
    Assignment,
    Task,
    Logout,
    Person,
    Menu as MenuIcon,
    Settings,
    Notifications,
    Brightness4,
    Brightness7,
    ExpandLess,
    ExpandMore,
    Assessment,
    AccountCircle,
    Help,
    Storage,
    ChevronLeft,
    ChevronRight,
    Schedule,
    School,
    History,
    BarChart
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // ========== DYNAMIC MENU ITEMS BASED ON USER ROLE ==========
    const getMenuItems = () => {
        if (user?.role === 'ADMIN') {
            return [
                {
                    text: 'Dashboard',
                    icon: <Dashboard />,
                    path: '/dashboard',
                    description: 'Overview & stats'
                },
                {
                    text: 'Users',
                    icon: <People />,
                    path: '/users',
                    description: 'Manage interns'
                },
                {
                    text: 'Projects',
                    icon: <Assignment />,
                    path: '/projects',
                    description: 'Project management'
                },
                {
                    text: 'Tasks',
                    icon: <Task />,
                    path: '/tasks',
                    description: 'Task tracking'
                },
                {
                    text: 'Daily Logs',
                    icon: <History />,
                    path: '/daily-logs-admin',
                    description: 'View intern logs'
                },
                {
                    text: 'Reports',
                    icon: <Assessment />,
                    path: '/reports',
                    description: 'Analytics & insights'
                },
            ];
        } else if (user?.role === 'INTERN') {
            return [
                {
                    text: 'Dashboard',
                    icon: <Dashboard />,
                    path: '/intern-dashboard',
                    description: 'My overview'
                },
                {
                    text: 'My Projects',
                    icon: <Assignment />,
                    path: '/my-projects',
                    description: 'Assigned projects'
                },
                {
                    text: 'My Tasks',
                    icon: <Task />,
                    path: '/my-tasks',
                    description: 'Assigned tasks'
                },
                {
                    text: 'Daily Log',
                    icon: <Schedule />,
                    path: '/daily-logs',
                    description: 'Work log'
                },
            ];
        }
        // Default (if no role)
        return [
            {
                text: 'Dashboard',
                icon: <Dashboard />,
                path: '/dashboard',
                description: 'Overview'
            },
        ];
    };

    const menuItems = getMenuItems();

    // ========== HANDLERS ==========
    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    // ========== DRAWER WIDTHS ==========
    const drawerWidth = 280;
    const collapsedWidth = 80;

    // ========== ROLE-BASED COLOR ==========
    const getRoleColor = () => {
        if (user?.role === 'ADMIN') {
            return 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)';
        } else if (user?.role === 'INTERN') {
            return 'linear-gradient(135deg, #1a237e 0%, #0d47a1 30%, #1976d2 60%, #42a5f5 100%)';
        }
        return 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)';
    };

    const getSidebarGradient = () => {
        if (user?.role === 'ADMIN') {
            return 'linear-gradient(180deg, #0d47a1 0%, #1565c0 30%, #1976d2 60%, #1e88e5 100%)';
        } else if (user?.role === 'INTERN') {
            return 'linear-gradient(180deg, #1a237e 0%, #0d47a1 30%, #1976d2 60%, #42a5f5 100%)';
        }
        return 'linear-gradient(180deg, #0d47a1 0%, #1565c0 30%, #1976d2 60%, #1e88e5 100%)';
    };

    const getRoleBadgeColor = () => {
        if (user?.role === 'ADMIN') {
            return 'primary';
        }
        return 'success';
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* ========== APP BAR ========== */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: 1300,
                    background: getRoleColor(),
                    boxShadow: '0 4px 30px rgba(13, 71, 161, 0.3)'
                }}
            >
                <Toolbar sx={{ minHeight: '70px !important' }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{
                            mr: 2,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'rotate(90deg)'
                            }
                        }}
                    >
                        {drawerOpen ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>

                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20
                            }}
                        >
                            🎓
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            Internship Management
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Role Badge */}
                        <Chip
                            label={user?.role || 'User'}
                            size="small"
                            color={getRoleBadgeColor()}
                            sx={{
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                backdropFilter: 'blur(10px)',
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        />

                        <Tooltip title="Toggle Theme">
                            <IconButton
                                color="inherit"
                                onClick={() => setDarkMode(!darkMode)}
                                sx={{
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.15)'
                                    }
                                }}
                            >
                                {darkMode ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Notifications">
                            <IconButton
                                color="inherit"
                                sx={{
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.15)'
                                    }
                                }}
                            >
                                <Badge badgeContent={user?.role === 'ADMIN' ? 3 : 1} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Profile Settings">
                            <IconButton
                                onClick={handleMenu}
                                sx={{
                                    p: 0,
                                    ml: 1,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        border: '2px solid white',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Avatar sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    width: 40,
                                    height: 40,
                                    fontWeight: 600
                                }}>
                                    {user?.fullName?.charAt(0) || 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ========== PROFILE DROPDOWN MENU ========== */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: 3,
                        minWidth: 220,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Avatar sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 1,
                        bgcolor: '#1976d2',
                        fontSize: 24
                    }}>
                        {user?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {user?.email}
                    </Typography>
                    <Chip
                        label={user?.role || 'User'}
                        size="small"
                        color={user?.role === 'ADMIN' ? 'primary' : 'success'}
                        sx={{ mt: 1, fontWeight: 500 }}
                    />
                </Box>
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                    <AccountCircle sx={{ mr: 2, fontSize: 20 }} /> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                    <Settings sx={{ mr: 2, fontSize: 20 }} /> Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                    <Logout sx={{ mr: 2, fontSize: 20 }} /> Logout
                </MenuItem>
            </Menu>

            {/* ========== SIDEBAR DRAWER ========== */}
            <Drawer
                variant="permanent"
                open={drawerOpen}
                sx={{
                    width: drawerOpen ? drawerWidth : collapsedWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerOpen ? drawerWidth : collapsedWidth,
                        boxSizing: 'border-box',
                        mt: '70px',
                        height: 'calc(100vh - 70px)',
                        background: getSidebarGradient(),
                        borderRight: 'none',
                        boxShadow: '4px 0 30px rgba(13, 71, 161, 0.2)',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflowX: 'hidden',
                        color: 'white'
                    }
                }}
            >
                {/* User Profile Section */}
                <Box sx={{
                    p: drawerOpen ? 3 : 1.5,
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    transition: 'padding 0.3s ease'
                }}>
                    <Avatar sx={{
                        width: drawerOpen ? 70 : 45,
                        height: drawerOpen ? 70 : 45,
                        mx: 'auto',
                        mb: drawerOpen ? 1.5 : 0.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        fontSize: drawerOpen ? 28 : 18,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                        {user?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                    {drawerOpen && (
                        <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                                {user?.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, color: 'white' }}>
                                {user?.role || 'User'}
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Navigation Links */}
                <List sx={{ px: 1, pt: 2 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    minHeight: 48,
                                    cursor: 'pointer',
                                    background: isActive
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'transparent',
                                    backdropFilter: isActive ? 'blur(10px)' : 'none',
                                    border: isActive
                                        ? '1px solid rgba(255,255,255,0.2)'
                                        : '1px solid transparent',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.15)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '& .MuiListItemIcon-root': {
                                            transform: 'scale(1.1)'
                                        }
                                    },
                                    transition: 'all 0.3s ease',
                                    justifyContent: drawerOpen ? 'flex-start' : 'center',
                                    px: drawerOpen ? 2 : 1
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                        minWidth: drawerOpen ? 40 : 0,
                                        justifyContent: 'center',
                                        transition: 'transform 0.3s ease'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {drawerOpen && (
                                    <Box sx={{ ml: 1 }}>
                                        <ListItemText
                                            primary={item.text}
                                            secondary={item.description}
                                            sx={{
                                                '& .MuiTypography-root': {
                                                    color: isActive ? 'white' : 'rgba(255,255,255,0.7)'
                                                },
                                                '& .MuiTypography-secondary': {
                                                    color: 'rgba(255,255,255,0.4)',
                                                    fontSize: '0.65rem',
                                                    display: 'block'
                                                }
                                            }}
                                        />
                                        {isActive && (
                                            <Box sx={{
                                                position: 'absolute',
                                                right: 16,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: 'white',
                                                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                                            }} />
                                        )}
                                    </Box>
                                )}
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ flexGrow: 1 }} />

                {/* Bottom Section */}
                <Box sx={{
                    p: drawerOpen ? 2 : 1,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}>
                    {drawerOpen ? (
                        <>
                            <Box display="flex" justifyContent="center" gap={1} mb={1}>
                                <Chip
                                    icon={<Storage sx={{ fontSize: 14 }} />}
                                    label="System Online"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.3)',
                                        color: '#a5d6a7',
                                        border: '1px solid rgba(76, 175, 80, 0.2)'
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ opacity: 0.5, color: 'white' }}>
                                v2.0.0 • {new Date().getFullYear()}
                            </Typography>
                        </>
                    ) : (
                        <Tooltip title="System Online">
                            <Box sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#4caf50',
                                mx: 'auto',
                                boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)'
                            }} />
                        </Tooltip>
                    )}
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: '70px',
                    backgroundColor: '#f8f9fa',
                    minHeight: '100vh',
                    width: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)`,
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ml: 0
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;