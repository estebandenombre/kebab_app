'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    TextField,
    IconButton,
    Divider,
    Snackbar,
    Card,
    CardContent,
    CardActions,
    Avatar,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Add, Remove, Delete, ShoppingCart, LocalDining, CreditCard, Money } from '@mui/icons-material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#933e36',
        },
        secondary: {
            main: '#e74c3c',
        },
        background: {
            default: '#f5f5f5',
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
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
}

interface OrderItem extends MenuItem {
    quantity: number;
}

const menuItems: MenuItem[] = [
    { id: 'k1', name: 'Kebab de Pollo', price: 5.50, description: 'Delicioso kebab de pollo con verduras frescas' },
    { id: 'k2', name: 'Kebab de Ternera', price: 6.00, description: 'Sabroso kebab de ternera con salsa especial' },
    { id: 'k3', name: 'Falafel', price: 5.00, description: 'Croquetas de garbanzos con especias orientales' },
    { id: 'd1', name: 'Durum de Pollo', price: 6.50, description: 'Wrap de pollo con verduras y salsas' },
    { id: 'd2', name: 'Durum de Ternera', price: 7.00, description: 'Wrap de ternera con verduras y salsas' },
    { id: 's1', name: 'Ensalada Kebab', price: 4.50, description: 'Ensalada fresca con trozos de kebab' },
    { id: 'b1', name: 'Bebida', price: 1.50, description: 'Refresco a elegir' },
];

export default function DeliveryOrderPage() {
    const router = useRouter();
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotation, setOrderNotation] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carga

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

        if (!customerName || !customerPhone || !paymentMethod) {
            setSnackbarMessage('Por favor, completa todos los campos requeridos.');
            setSnackbarOpen(true);
            return;
        }

        const newOrder = {
            id: `ORD-${Date.now()}`,
            items: currentOrder,
            total: calculateTotal(currentOrder),
            status: 'pendiente',
            timestamp: new Date().toISOString(),
            notation: orderNotation,
            customerName,
            customerPhone,
            paymentMethod,
            isDelivery: true,
        };

        try {
            setLoading(true); // Activar carga
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

            const createdOrder = await response.json();

            if (paymentMethod === 'tarjeta') {
                router.push('/tarjeta');
            } else {
                router.push(`/efectivo?orderId=${createdOrder.data.id}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setSnackbarMessage('Error al crear el pedido');
            setSnackbarOpen(true);
        } finally {
            setLoading(false); // Desactivar carga
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <img
                            src="/logo.png" // Ruta de la imagen
                            alt="Logo de El Kebab de Iñaki"
                            style={{ width: '150px' }} // Ajusta el tamaño según sea necesario
                        />
                    </Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ color: 'primary.main' }} // Cambia el color a uno de la paleta o usa un valor hex
                    >
                        El Kebab de Iñaki
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Menú
                            </Typography>
                            <Grid container spacing={3}>
                                {menuItems.map((item) => (
                                    <Grid item xs={12} sm={6} key={item.id}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" component="div">
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {item.description}
                                                </Typography>
                                                <Typography variant="h6" color="primary">
                                                    {item.price.toFixed(2)} €
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => addItemToOrder(item)}
                                                    startIcon={<Add />}
                                                >
                                                    Añadir
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Tu Pedido
                            </Typography>
                            {currentOrder.length > 0 ? (
                                <List>
                                    {currentOrder.map((item) => (
                                        <ListItem key={item.id} disablePadding sx={{ mb: 2 }}>
                                            <ListItemText
                                                primary={item.name}
                                                secondary={`${item.price.toFixed(2)} € x ${item.quantity}`}
                                            />
                                            <Box>
                                                <IconButton size="small" onClick={() => removeItemFromOrder(item.id)}>
                                                    <Remove />
                                                </IconButton>
                                                <Typography component="span" sx={{ mx: 1 }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton size="small" onClick={() => addItemToOrder(item)}>
                                                    <Add />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => deleteItemFromOrder(item.id)} sx={{ ml: 1 }}>
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mb: 2 }}>
                                        <ShoppingCart />
                                    </Avatar>
                                    <Typography variant="body1" color="text.secondary">
                                        Tu carrito está vacío
                                    </Typography>
                                </Box>
                            )}
                            {currentOrder.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Total: {calculateTotal(currentOrder)} €
                                    </Typography>
                                </>
                            )}
                            <TextField
                                fullWidth
                                label="Tu Nombre"
                                variant="outlined"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Tu Teléfono"
                                variant="outlined"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Notas adicionales"
                                variant="outlined"
                                value={orderNotation}
                                onChange={(e) => setOrderNotation(e.target.value)}
                                margin="normal"
                                multiline
                                rows={3}
                            />
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                Método de Pago
                            </Typography>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <FormControlLabel
                                    value="tarjeta"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CreditCard sx={{ mr: 1 }} />
                                            Tarjeta
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="efectivo"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Money sx={{ mr: 1 }} />
                                            Efectivo
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                onClick={handleSubmitOrder}
                                disabled={currentOrder.length === 0 || !paymentMethod || loading} // Desactivar botón mientras se carga
                                sx={{ mt: 2 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocalDining />}
                            >
                                {loading ? 'Procesando...' : 'Realizar Pedido'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </ThemeProvider>
    );
}
