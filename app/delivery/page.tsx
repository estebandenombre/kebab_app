'use client';

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
    CircularProgress,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Add, Remove, Delete } from '@mui/icons-material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#933e36',
        },
        secondary: {
            main: '#e74c3c',
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
    const [loading, setLoading] = useState(false);
    const [schedulePickup, setSchedulePickup] = useState(false);
    const [pickupDateTime, setPickupDateTime] = useState('');

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

        // Aquí generamos el nuevo pedido
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
            pickupDateTime: schedulePickup ? pickupDateTime : undefined, // Cambiar a undefined en lugar de null
        };

        // Si el método de pago es tarjeta, redirigimos incluyendo todos los parámetros necesarios en la URL
        if (paymentMethod === 'tarjeta') {
            // Modificamos itemsSummary para incluir id y precio
            const itemsSummary = currentOrder.map(item =>
                `${item.id} (${item.name}): ${item.quantity} x ${item.price.toFixed(2)} €`
            ).join(', ');
            const total = newOrder.total; // Asegúrate de que esto se obtenga correctamente

            // Redirigir con todos los parámetros
            router.push(`/tarjeta?orderId=${newOrder.id}&total=${total}&customerName=${encodeURIComponent(customerName)}&customerPhone=${encodeURIComponent(customerPhone)}&notation=${encodeURIComponent(orderNotation)}&isDelivery=${encodeURIComponent(String(newOrder.isDelivery))}&pickupDateTime=${encodeURIComponent(pickupDateTime || '')}&items=${encodeURIComponent(itemsSummary)}`);
            return; // Evitamos continuar con la creación del pedido
        }

        // Si el método de pago no es tarjeta, procedemos a hacer el POST
        try {
            setLoading(true);
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOrder),
            });

            if (!response.ok) {
                throw new Error('Error creando el pedido');
            }

            const createdOrder = await response.json();
            router.push(`/efectivo?orderId=${createdOrder.data.id}`);
        } catch (error) {
            console.error('Error creando el pedido:', error);
            setSnackbarMessage('Error al crear el pedido');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };



    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <img
                            src="/logo.png"
                            alt="Logo de El Kebab de Iñaki"
                            style={{ width: '150px' }}
                        />
                    </Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ color: 'primary.main' }}
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
                            <Grid container spacing={2}>
                                {menuItems.map((item) => (
                                    <Grid item xs={12} sm={6} key={item.id}>
                                        <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                                            <CardContent sx={{ pb: 1 }}>
                                                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {item.description}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                                                    <Typography variant="h6" color="primary">
                                                        {item.price.toFixed(2)} €
                                                    </Typography>
                                                    <Button
                                                        size="medium"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => addItemToOrder(item)}
                                                        startIcon={<Add />}
                                                    >
                                                        Añadir
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Resumen de Pedido
                            </Typography>
                            <List>
                                {currentOrder.map((item) => (
                                    <ListItem key={item.id}>
                                        <ListItemText
                                            primary={`${item.name} (${item.quantity})`}
                                            secondary={`${(item.price * item.quantity).toFixed(2)} €`}
                                        />
                                        <IconButton edge="end" aria-label="add" onClick={() => addItemToOrder(item)}>
                                            <Add />
                                        </IconButton>
                                        <IconButton onClick={() => removeItemFromOrder(item.id)}>
                                            <Remove />
                                        </IconButton>
                                        <IconButton onClick={() => deleteItemFromOrder(item.id)}>
                                            <Delete />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" align="right">
                                Total: {calculateTotal(currentOrder)} €
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box component="form" sx={{ mt: 3 }}>
                                <TextField
                                    label="Nombre del Cliente"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Teléfono"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Observaciones"
                                    variant="outlined"
                                    fullWidth
                                    value={orderNotation}
                                    onChange={(e) => setOrderNotation(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <RadioGroup
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    row
                                    sx={{ mb: 2 }}
                                >
                                    <FormControlLabel value="efectivo" control={<Radio />} label="Pago en efectivo" />
                                    <FormControlLabel value="tarjeta" control={<Radio />} label="Pago con tarjeta" />
                                </RadioGroup>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={schedulePickup} onChange={(e) => setSchedulePickup(e.target.checked)} />}
                                        label="Programar recogida"
                                    />
                                    {schedulePickup && (
                                        <TextField
                                            label="Fecha y hora"
                                            variant="outlined"
                                            type="datetime-local"
                                            fullWidth
                                            value={pickupDateTime}
                                            onChange={(e) => setPickupDateTime(e.target.value)}
                                            sx={{ ml: 2 }}
                                        />
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmitOrder}
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Realizar Pedido'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                />
            </Container>
        </ThemeProvider>
    );
}
