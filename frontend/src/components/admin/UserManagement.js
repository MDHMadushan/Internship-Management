import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Switch, Chip, IconButton, Box, Typography,
    CircularProgress, Avatar, Grid, InputAdornment, Fade,
    Tooltip, Snackbar, Alert, Card, CardContent, Container,
    LinearProgress, Badge, Grow
} from '@mui/material';
import {
    Add, Edit, Delete, Search, PersonAdd, Refresh,
    Email, Phone, School, Business, CheckCircle, Cancel,
    MoreVert, FilterList, People, Assignment, TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosConfig';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'INTERN',
        phone: '',
        department: '',
        university: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Failed to load users. Please ensure backend is running.', 'error');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                password: '',
                fullName: user.fullName,
                role: user.role,
                phone: user.phone || '',
                department: user.department || '',
                university: user.university || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: '',
                password: '',
                fullName: '',
                role: 'INTERN',
                phone: '',
                department: '',
                university: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await axios.put(`/admin/users/${editingUser.id}`, formData);
                showSnackbar('User updated successfully');
            } else {
                await axios.post('/admin/users', formData);
                showSnackbar('User created successfully');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to save user', 'error');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await axios.patch(`/admin/users/${userId}/status`);
            showSnackbar('User status updated');
            fetchUsers();
        } catch (error) {
            showSnackbar('Failed to update status', 'error');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`/admin/users/${userId}`);
                showSnackbar('User deleted successfully');
                fetchUsers();
            } catch (error) {
                showSnackbar('Failed to delete user', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = users.filter(u => u.active).length;
    const internCount = users.filter(u => u.role === 'INTERN').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Enhanced Stat Card Component (matching Dashboard)
    const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
        <Grow in timeout={500}>
            <Grid item xs={12} sm={6} md={3}>
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
                                {subtitle && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#94a3b8',
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        {subtitle}
                                    </Typography>
                                )}
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
                    {/* ========== HEADER ========== */}
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
                                👥 User Management
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Manage all interns and administrators
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchUsers}
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
                                startIcon={<PersonAdd />}
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
                                Add New Intern
                            </Button>
                        </Box>
                    </Box>

                    {/* ========== STATISTICS CARDS ========== */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <StatCard
                            icon={People}
                            title="Total Users"
                            value={users.length}
                            color="#1976d2"
                            subtitle="All registered users"
                        />
                        <StatCard
                            icon={CheckCircle}
                            title="Active Users"
                            value={activeCount}
                            color="#2e7d32"
                            subtitle={`${activeCount} active accounts`}
                        />
                        <StatCard
                            icon={School}
                            title="Interns"
                            value={internCount}
                            color="#ed6c02"
                            subtitle={`${internCount} interns enrolled`}
                        />
                        <StatCard
                            icon={Assignment}
                            title="Admins"
                            value={adminCount}
                            color="#9c27b0"
                            subtitle={`${adminCount} administrators`}
                        />
                    </Grid>

                    {/* ========== SEARCH BAR ========== */}
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
                            placeholder="🔍 Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                maxWidth: { xs: '100%', sm: 400 },
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
                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                                icon={<People />}
                                label={`${filteredUsers.length} users found`}
                                size="small"
                                sx={{
                                    bgcolor: '#e3f2fd',
                                    color: '#1976d2',
                                    fontWeight: 500
                                }}
                            />
                            <Tooltip title="Filter">
                                <IconButton size="small">
                                    <FilterList />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    {/* ========== USER TABLE ========== */}
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
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Role</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Department</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user, index) => (
                                    <Grow in timeout={300 + (index * 50)}>
                                        <TableRow
                                            key={user.id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: '#f5f8ff',
                                                    '& .action-buttons': {
                                                        opacity: 1
                                                    }
                                                },
                                                opacity: user.active ? 1 : 0.6,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{
                                                        bgcolor: user.active ? 'linear-gradient(135deg, #1976d2, #42a5f5)' : '#9e9e9e',
                                                        width: 44,
                                                        height: 44,
                                                        fontWeight: 600,
                                                        background: user.active
                                                            ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                                                            : 'linear-gradient(135deg, #9e9e9e, #bdbdbd)'
                                                    }}>
                                                        {user.fullName?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                                            {user.fullName}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            ID: {user.id?.substring(0, 8)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 500,
                                                        borderRadius: 2
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.department || 'Not Assigned'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 2,
                                                        borderColor: 'rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Switch
                                                        checked={user.active}
                                                        onChange={() => handleToggleStatus(user.id)}
                                                        color="success"
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: '#2e7d32',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: '#2e7d32',
                                                            },
                                                        }}
                                                    />
                                                    <Chip
                                                        label={user.active ? 'Active' : 'Inactive'}
                                                        color={user.active ? 'success' : 'error'}
                                                        size="small"
                                                        icon={user.active ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            borderRadius: 2,
                                                            fontWeight: 500,
                                                            height: 24
                                                        }}
                                                    />
                                                </Box>
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
                                                    <Tooltip title="Edit User">
                                                        <IconButton
                                                            onClick={() => handleOpenDialog(user)}
                                                            color="primary"
                                                            size="small"
                                                            sx={{
                                                                '&:hover': {
                                                                    background: 'rgba(25, 118, 210, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete User">
                                                        <IconButton
                                                            onClick={() => handleDelete(user.id)}
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                '&:hover': {
                                                                    background: 'rgba(211, 47, 47, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="More Options">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                '&:hover': {
                                                                    background: 'rgba(0,0,0,0.05)'
                                                                }
                                                            }}
                                                        >
                                                            <MoreVert fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </Grow>
                                ))}
                                {filteredUsers.length === 0 && (
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
                                                    <People sx={{ fontSize: 40, color: '#bdbdbd' }} />
                                                </Box>
                                                <Typography variant="h6" color="textSecondary">
                                                    No Users Found
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Click "Add New Intern" to create your first user
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={() => handleOpenDialog()}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Add New Intern
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* ========== FOOTER ========== */}
                    <Box sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        <Typography variant="caption" color="textSecondary">
                            Total Users: {users.length} | Active: {activeCount} | Interns: {internCount} | Admins: {adminCount}
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

            {/* ========== ADD/EDIT DIALOG ========== */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a237e 0%, #1976d2 100%)',
                    color: 'white',
                    py: 2
                }}>
                    {editingUser ? '✏️ Edit User' : '➕ Create New Intern'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonAdd sx={{ color: '#1976d2' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: '#1976d2' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        {!editingUser && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Phone"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone sx={{ color: '#1976d2' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Department"
                                fullWidth
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Business sx={{ color: '#1976d2' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="University"
                                fullWidth
                                value={formData.university}
                                onChange={(e) => setFormData({...formData, university: e.target.value})}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <School sx={{ color: '#1976d2' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                            }
                        }}
                    >
                        {editingUser ? 'Update' : 'Create'} User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== SNACKBAR ========== */}
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
        </Container>
    );
};

export default UserManagement;