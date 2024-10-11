'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Receipt, Download } from '@mui/icons-material';
import jsPDF from 'jspdf';
import logo from '../../public/logo.png'; // Importar el logo

// Definición de la paleta de colores
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
});

// Interfaces de TypeScript
interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: string;
    customerName: string;
    customerPhone: string;
    notation?: string;
}

// Información ficticia del restaurante
const restaurantInfo = {
    name: 'El Kebab de Iñaki',
    address: 'C/ Conde Altea n°57',
    phone: '+34 912 345 678',
};

export default function CashPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId) {
            fetchOrder(orderId);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const fetchOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Error fetching order');
            }
            const data = await response.json();
            setOrder(data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async () => {
        if (!order) return;

        const doc = new jsPDF();
        const margin = 20;
        const yStart = margin + 10;

        // Cargar el logo y agregarlo al PDF
        const logoImg = await loadImage(logo.src) as HTMLImageElement; // Asegúrate de que sea un HTMLImageElement
        doc.addImage(logoImg, 'PNG', margin, yStart, 40, 40); // Ajustar el tamaño y posición del logo

        // Agregar la información del restaurante al recibo
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor('#933e36');
        doc.text(restaurantInfo.name, margin, yStart + 50); // Ajustar la posición

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#555');
        doc.text(restaurantInfo.address, margin, yStart + 60);
        doc.text(`Teléfono: ${restaurantInfo.phone}`, margin, yStart + 70);

        // Agregar detalles del pedido
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor('#933e36');
        doc.text('Recibo de Pedido', margin, yStart + 90);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#2c3e50');
        doc.text(`ID de Pedido: ${order.id}`, margin, yStart + 100);
        doc.text(`Nombre: ${order.customerName}`, margin, yStart + 110);
        doc.text(`Teléfono: ${order.customerPhone}`, margin, yStart + 120);

        // Agregar línea divisoria
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yStart + 130, 190 - margin, yStart + 130); // Línea horizontal

        // Agregar lista de artículos
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor('#933e36');
        doc.text('Artículos:', margin, yStart + 140);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor('#2c3e50');

        order.items.forEach((item, index) => {
            const itemPosition = yStart + 150 + index * 10; // Ajustar posición
            doc.text(
                `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€`,
                margin,
                itemPosition
            );
        });

        const finalYPosition = yStart + 150 + order.items.length * 10 + 10;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor('#933e36');
        doc.text(`Total: ${order.total}€`, margin, finalYPosition);

        if (order.notation) {
            doc.setFont('Helvetica', 'normal');
            doc.setTextColor('#555');
            doc.text(`Notas: ${order.notation}`, margin, finalYPosition + 10);
        }

        doc.setFontSize(10);
        doc.setTextColor('#555');
        doc.text('Gracias por su compra. ¡Esperamos verle de nuevo!', margin, finalYPosition + 30);

        // Descargar el PDF
        doc.save(`recibo_${order.id}.pdf`);
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Cargando...
                </Typography>
            </Box>
        );
    }

    if (!order) {
        return <Typography variant="h6" color="error">Error al cargar el pedido.</Typography>;
    }

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100px', marginRight: '10px' }} />
                        <Typography variant="h4" component="h1" color="primary.main">
                            Resumen del Pedido
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            mb: 3,
                            p: 3,
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                            backgroundColor: 'rgba(147, 62, 54, 0.1)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        <Typography variant="h5" gutterBottom sx={{ color: '#933e36' }}>
                            {restaurantInfo.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555' }}>
                            {restaurantInfo.address}
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#555' }}>
                            Teléfono: {restaurantInfo.phone}
                        </Typography>
                    </Box>

                    <Typography variant="h5" gutterBottom>
                        ID de Pedido: {order.id}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Por favor, presente este ID en la caja para realizar el pago en efectivo.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Detalles del Pedido:
                    </Typography>
                    <List sx={{ borderRadius: 2 }}>
                        {order.items.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <ListItemText
                                    primary={`${item.name} x${item.quantity}`}
                                    secondary={`${(item.price * item.quantity).toFixed(2)}€`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Total: {order.total}€
                    </Typography>
                    {order.notation && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Notas: {order.notation}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Download />}
                        onClick={handleDownloadReceipt}
                        sx={{ mt: 3 }}
                    >
                        Descargar Recibo
                    </Button>
                </Paper>
            </Container>
        </ThemeProvider>
    );
}
