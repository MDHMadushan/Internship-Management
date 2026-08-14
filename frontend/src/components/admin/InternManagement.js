import React, { useState } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Chip, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const InternManagement = () => {
    // Fake data for testing purposes (Connect to Spring Boot later)
    const [interns, setInterns] = useState([
        { id: 1, fullName: 'John Doe', email: 'john@test.com', department: 'IT', active: true },
        { id: 2, fullName: 'Jane Smith', email: 'jane@test.com', department: 'HR', active: true },
        { id: 3, fullName: 'Bob Johnson', email: 'bob@test.com', department: 'Finance', active: false },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingIntern, setEditingIntern] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', department: '' });

    const handleOpenDialog = (intern = null) => {
        setEditingIntern(intern);
        setFormData(intern || { fullName: '', email: '', department: '' });
        setOpenDialog(true);
    };

    const handleSave = () => {
        if (editingIntern) {
            setInterns(interns.map(i => i.id === editingIntern.id ? { ...i, ...formData } : i));
        } else {
            setInterns([...interns, { ...formData, id: Date.now(), active: true }]);
        }
        setOpenDialog(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this intern?")) {
            setInterns(interns.filter(i => i.id !== id));
        }
    };

    const filteredInterns = interns.filter(intern =>
        intern.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Intern Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                    Add New Intern
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Email</b></TableCell>
                            <TableCell><b>Department</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInterns.map((intern) => (
                            <TableRow key={intern.id}>
                                <TableCell>{intern.fullName}</TableCell>
                                <TableCell>{intern.email}</TableCell>
                                <TableCell>{intern.department}</TableCell>
                                <TableCell>
                                    <Chip label={intern.active ? "Active" : "Inactive"} color={intern.active ? "success" : "error"} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpenDialog(intern)}><Edit /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(intern.id)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{editingIntern ? 'Edit Intern' : 'Add New Intern'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Full Name" fullWidth variant="outlined" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} sx={{ mb: 2 }} />
                    <TextField margin="dense" label="Email Address" type="email" fullWidth variant="outlined" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={{ mb: 2 }} />
                    <TextField margin="dense" label="Department" fullWidth variant="outlined" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InternManagement;