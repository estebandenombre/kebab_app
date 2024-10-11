'use client'

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    AppBar,
    Toolbar,
    Tabs,
    Tab,
    Snackbar,
    TextField,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    CheckCircle,
    AccessTime,
    LocalShipping,
    Info,
    Add,
    Remove,
    Delete,
    FastfoodOutlined,
    RestaurantMenu,
    Kitchen,
    DeliveryDining,
    Archive,
    Warning as WarningIcon,
} from '@mui/icons-material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#933e36',
        },
        secondary: {
            main: '#e74c3c',
        },
        error: {
            main: '#c0392b',
        },
        warning: {
            main: '#f39c12',
        },
        info: {
            main: '#3498db',
        },
        success: {
            main: '#27ae60',
        },
        background: {
            default: '#ecf0f1',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#7f8c8d',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

interface MenuItem {
    id: string;
    name: string;
    price: number;
}

interface OrderItem extends MenuItem {
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: string;
    status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
    timestamp: string;
    notation?: string;
}

const menuItems: MenuItem[] = [
    { id: 'k1', name: 'Kebab de Pollo', price: 5.50 },
    { id: 'k2', name: 'Kebab de Ternera', price: 6.00 },
    { id: 'k3', name: 'Falafel', price: 5.00 },
    { id: 'd1', name: 'Durum de Pollo', price: 6.50 },
    { id: 'd2', name: 'Durum de Ternera', price: 7.00 },
    { id: 's1', name: 'Ensalada Kebab', price: 4.50 },
    { id: 'b1', name: 'Bebida', price: 1.50 },
];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [orderNotation, setOrderNotation] = useState('');
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        fetchOrders();
        const intervalId = setInterval(fetchOrders, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Error fetching orders');
            }
            const data = await response.json();
            setOrders(data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setSnackbarMessage('Error al cargar los pedidos');
            setSnackbarOpen(true);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const addItemToOrder = (item: MenuItem) => {
        const existingItem = currentOrder.find((orderItem) => orderItem.id === item.id);
        if (existingItem) {
            setCurrentOrder(currentOrder.map((orderItem) =>
                orderItem.id === item.id
                    ? { ...orderItem, quantity: orderItem.quantity + 1 }
                    : orderItem
            ));
        } else {
            setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
        }
    };

    const removeItemFromOrder = (itemId: string) => {
        const existingItem = currentOrder.find((orderItem) => orderItem.id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            setCurrentOrder(currentOrder.map((orderItem) =>
                orderItem.id === itemId
                    ? { ...orderItem, quantity: orderItem.quantity - 1 }
                    : orderItem
            ));
        } else {
            setCurrentOrder(currentOrder.filter((orderItem) => orderItem.id !== itemId));
        }
    };

    const deleteItemFromOrder = (itemId: string) => {
        setCurrentOrder(currentOrder.filter((orderItem) => orderItem.id !== itemId));
    };

    const calculateTotal = (items: OrderItem[]) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const handleSubmitOrder = async () => {
        if (currentOrder.length === 0) {
            setSnackbarMessage('Por favor, añade items al pedido.');
            setSnackbarOpen(true);
            return;
        }

        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            items: currentOrder,
            total: calculateTotal(currentOrder),
            status: 'pendiente',
            timestamp: new Date().toISOString(),
            notation: orderNotation,
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOrder),
            });

            if (!response.ok) {
                throw new Error('Error creating order');
            }

            const data = await response.json();
            setOrders([...orders, data.data]);
            setCurrentOrder([]);
            setOrderNotation('');
            setActiveTab(1);
            setSnackbarMessage('Pedido creado con éxito');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error creating order:', error);
            setSnackbarMessage('Error al crear el pedido');
            setSnackbarOpen(true);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: 'pendiente' | 'preparando' | 'listo' | 'entregado') => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Error updating order status');
            }

            const updatedOrder = await response.json();
            setOrders(orders.map(order =>
                order.id === orderId ? updatedOrder.data : order
            ));
            setSnackbarMessage(`Pedido actualizado con éxito`);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error updating order status:', error);
            setSnackbarMessage('Error al actualizar el estado del pedido');
            setSnackbarOpen(true);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders?id=${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error cancelling order');
            }

            setOrders(orders.filter(order => order.id !== orderId));
            setSnackbarMessage('Pedido cancelado y eliminado con éxito');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error cancelling order:', error);
            setSnackbarMessage('Error al cancelar el pedido');
            setSnackbarOpen(true);
        }
    };

    const handleOpenDialog = (order: Order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const getTimeDifference = (timestamp: string) => {
        const orderTime = new Date(timestamp);
        const currentTime = new Date();
        const diffMinutes = Math.round((currentTime.getTime() - orderTime.getTime()) / 60000);
        return `${diffMinutes} min`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente':
                return 'error';
            case 'preparando':
                return 'warning';
            case 'listo':
                return 'success';
            case 'entregado':
                return 'info';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendiente':
                return <FastfoodOutlined />;
            case 'preparando':
                return <AccessTime />;
            case 'listo':
                return <CheckCircle />;
            case 'entregado':
                return <LocalShipping />;
            default:
                return <></>;
        }
    };
    // Estado para manejar el filtro activo
    const [activeFilter, setActiveFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('all');
    // Función para manejar la selección de filtros predefinidos
    const handleFilter = (filter: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
        const now = new Date();
        let start: Date;
        let end: Date;

        switch (filter) {
            case 'today':
                start = new Date();
                start.setUTCHours(0, 0, 0, 0); // Hoy a las 00:00:00 UTC
                end = new Date();
                end.setUTCHours(23, 59, 59, 999); // Hoy a las 23:59:59 UTC
                break;

            case 'yesterday':
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - 1); // Ayer
                start.setUTCHours(0, 0, 0, 0); // Ayer a las 00:00:00 UTC
                end = new Date(now);
                end.setUTCDate(now.getUTCDate() - 1); // Ayer
                end.setUTCHours(23, 59, 59, 999); // Ayer a las 23:59:59 UTC
                break;

            case 'week':
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - now.getUTCDay()); // Domingo
                start.setUTCHours(0, 0, 0, 0); // Inicio de la semana

                end = new Date(now);
                end.setUTCDate(now.getUTCDate() + (6 - now.getUTCDay())); // Sábado
                end.setUTCHours(23, 59, 59, 999); // Fin de la semana
                break;

            case 'month':
                start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); // Primer día del mes
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)); // Último día del mes
                end.setUTCHours(23, 59, 59, 999);
                break;

            case 'all':
            default:
                setActiveFilter('all');
                setStartDate("");
                setEndDate("");
                return; // En caso de que el filtro sea 'all', no hacemos nada más
        }

        setStartDate(start.toISOString()); // Mantener el formato ISO para comparación
        setEndDate(end.toISOString());
        setActiveFilter(filter); // Actualiza el filtro activo
    };

    // Filtrar órdenes basado en fechas
    const filteredOrders = activeFilter === 'all'
        ? orders.filter(order => order.status === 'entregado') // Muestra todos los pedidos entregados
        : orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            const isInRange =
                (!startDate || orderDate >= new Date(startDate)) &&
                (!endDate || orderDate <= new Date(endDate));
            return order.status === 'entregado' && isInRange;
        });


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            El Kebab de Iñaki
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ overflowX: 'auto' }}
                >
                    <Tab icon={<RestaurantMenu />} label="Nuevo Pedido" />
                    <Tab icon={<Kitchen />} label="Cocina" />
                    <Tab icon={<DeliveryDining />} label="Pedidos Listos" />
                    <Tab icon={<Archive />} label="Pedidos Entregados" />
                </Tabs>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Menú
                                    </Typography>
                                    <List>
                                        {menuItems.map((item) => (
                                            <ListItem key={item.id} disablePadding>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`${item.price.toFixed(2)} €`}
                                                />
                                                <IconButton edge="end" aria-label="add" onClick={() => addItemToOrder(item)}>
                                                    <Add />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Pedido Actual
                                    </Typography>
                                    <List>
                                        {currentOrder.map((item) => (
                                            <ListItem key={item.id}>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`${item.price.toFixed(2)} € x ${item.quantity}`}
                                                />
                                                <IconButton edge="end" aria-label="add" onClick={() => addItemToOrder(item)}>
                                                    <Add />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="remove" onClick={() => removeItemFromOrder(item.id)}>
                                                    <Remove />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="delete" onClick={() => deleteItemFromOrder(item.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6">
                                        Total: {calculateTotal(currentOrder)} €
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Notación del pedido"
                                        variant="outlined"
                                        value={orderNotation}
                                        onChange={(e) => setOrderNotation(e.target.value)}
                                        margin="normal"
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleSubmitOrder}
                                        disabled={currentOrder.length === 0}
                                        sx={{ mt: 2 }}
                                    >
                                        Enviar Pedido
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                    {activeTab === 1 && (
                        <Grid container spacing={3}>
                            {orders.filter(order => order.status !== 'listo' && order.status !== 'entregado').map((order) => (
                                <Grid item xs={12} md={6} lg={4} key={order.id}>
                                    <Card elevation={3}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" component="h2">
                                                    Pedido: {order.id}
                                                </Typography>
                                                <Chip
                                                    icon={getStatusIcon(order.status)}
                                                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    color={getStatusColor(order.status)}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Hora: {new Date(order.timestamp).toLocaleTimeString()}

                                            </Typography>
                                            {order.notation && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)', p: 1, borderRadius: 1 }}>
                                                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {order.notation}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 1 }} />
                                            <List dense>
                                                {order.items.map((item) => (
                                                    <ListItem key={item.id} disablePadding>
                                                        <ListItemText
                                                            primary={`${item.quantity}x ${item.name}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                Total: {order.total} €
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => updateOrderStatus(order.id, 'preparando')}
                                                disabled={order.status !== 'pendiente'}
                                                fullWidth
                                            >
                                                Preparando
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => updateOrderStatus(order.id, 'listo')}
                                                disabled={order.status === 'listo'}
                                                fullWidth
                                            >
                                                Listo
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleCancelOrder(order.id)}
                                                fullWidth
                                            >
                                                Cancelar
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {activeTab === 2 && (
                        <Grid container spacing={3}>
                            {orders.filter(order => order.status === 'listo').map((order) => (
                                <Grid item xs={12} sm={6} md={4} key={order.id}>
                                    <Card elevation={3}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" component="h2">
                                                    Pedido: {order.id}
                                                </Typography>
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Listo"
                                                    color="success"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Listo hace: {getTimeDifference(order.timestamp)}
                                                </Typography>
                                            </Box>
                                            {order.notation && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)', p: 1, borderRadius: 1 }}>
                                                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {order.notation}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 1 }} />
                                            <List dense>
                                                {order.items.slice(0, 2).map((item) => (
                                                    <ListItem key={item.id} disablePadding>
                                                        <ListItemText
                                                            primary={`${item.quantity}x ${item.name}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <ListItem disablePadding>
                                                        <ListItemText
                                                            primary={`... y ${order.items.length - 2} más`}
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                Total: {order.total} €
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'space-between' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                startIcon={<LocalShipping />}
                                                onClick={() => updateOrderStatus(order.id, 'entregado')}
                                            >
                                                Entregar
                                            </Button>
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => handleOpenDialog(order)}
                                            >
                                                <Info />
                                            </IconButton>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleCancelOrder(order.id)}
                                            >
                                                Cancelar
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {activeTab === 3 && (
                        <>
                            {/* Filtros de fecha */}
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleFilter('today')}
                                        sx={{ mr: 1, bgcolor: activeFilter === 'today' ? 'primary.main' : 'transparent', color: activeFilter === 'today' ? 'white' : 'inherit' }}
                                    >
                                        Hoy
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleFilter('week')}
                                        sx={{ mr: 1, bgcolor: activeFilter === 'week' ? 'primary.main' : 'transparent', color: activeFilter === 'week' ? 'white' : 'inherit' }}
                                    >
                                        Semana
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleFilter('month')}
                                        sx={{ mr: 1, bgcolor: activeFilter === 'month' ? 'primary.main' : 'transparent', color: activeFilter === 'month' ? 'white' : 'inherit' }}
                                    >
                                        Mes
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleFilter('all')}
                                        sx={{ mr: 1, bgcolor: activeFilter === 'all' ? 'primary.main' : 'transparent', color: activeFilter === 'all' ? 'white' : 'inherit' }}
                                    >
                                        Todos
                                    </Button>
                                </Box>

                            </Box>

                            <Grid container spacing={3}>
                                {filteredOrders.map((order) => (
                                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                                        <Card elevation={3}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="h6" component="h2">
                                                        Pedido: {order.id}
                                                    </Typography>
                                                    <Chip
                                                        icon={<LocalShipping />}
                                                        label="Entregado"
                                                        color="info"
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Entregado: {new Date(order.timestamp).toLocaleString()}
                                                </Typography>
                                                {order.notation && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)', p: 1, borderRadius: 1 }}>
                                                        <WarningIcon color="warning" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.notation}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <Divider sx={{ my: 1 }} />
                                                <List dense>
                                                    {order.items.map((item) => (
                                                        <ListItem key={item.id} disablePadding>
                                                            <ListItemText
                                                                primary={`${item.quantity}x ${item.name}`}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                    Total: {order.total} €
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}


                </Container>
            </Box>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Detalles del Pedido {selectedOrder?.id}</DialogTitle>
                <DialogContent>
                    <List>
                        {selectedOrder?.items.map((item) => (
                            <ListItem key={item.id}>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`Cantidad: ${item.quantity}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                        Total: {selectedOrder?.total} €
                    </Typography>
                    {selectedOrder?.notation && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Notación: {selectedOrder.notation}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </ThemeProvider>
    );
}