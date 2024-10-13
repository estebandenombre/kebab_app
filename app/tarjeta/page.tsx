'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // Asegúrate de importar Suspense
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
    CircularProgress,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Skeleton,
} from "@mui/material";
import { ShoppingCart, CreditCard } from '@mui/icons-material';
import CheckoutPage from "@/components/CheckoutPage";

// Verifica la clave pública de Stripe
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

function TarjetaPage() {
    const searchParams = useSearchParams();
    const [orderTotal, setOrderTotal] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        const total = searchParams.get('total');

        // Si el total está disponible en los parámetros, se establece aquí
        if (total) {
            const parsedTotal = parseFloat(total);
            if (!isNaN(parsedTotal)) {
                setOrderTotal(parsedTotal);
                createPaymentIntent(parsedTotal);
            } else {
                setErrorMessage("El total del pedido no es válido");
                setIsLoading(false);
            }
        } else {
            setErrorMessage("No se encontró el total en la URL");
            setIsLoading(false);
        }
    }, [searchParams]);

    const createPaymentIntent = async (total: number) => {
        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: total * 100 }), // Convertir a centavos
            });
            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                setErrorMessage("Error al obtener el clientSecret");
            }
        } catch (error) {
            console.error("Error fetching payment intent:", error);
            setErrorMessage("Error al crear el pago");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card elevation={3} sx={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                    <CardHeader
                        title={
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h4" component="h1" fontWeight="bold">
                                    Pago
                                </Typography>
                            </Box>
                        }
                    />
                    <CardContent>
                        {isLoading ? (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <CircularProgress />
                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                    Cargando...
                                </Typography>
                            </Box>
                        ) : errorMessage ? (
                            <Typography variant="h6" color="error" align="center">
                                {errorMessage}
                            </Typography>
                        ) : (
                            <>
                                {orderTotal !== null ? (
                                    <Typography variant="h5" align="center" gutterBottom>
                                        Total a pagar: <Box component="span" fontWeight="bold" color="primary.main">{orderTotal.toFixed(2)}€</Box>
                                    </Typography>
                                ) : (
                                    <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 2 }} />
                                )}
                                {clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutPage amount={orderTotal ? orderTotal : 0} />
                                    </Elements>
                                ) : (
                                    <Box sx={{ my: 4 }}>
                                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                                        <Skeleton variant="rectangular" height={56} />
                                    </Box>
                                )}

                                <Box display="flex" alignItems="center" justifyContent="center" mt={3}>
                                    <CreditCard fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Pago seguro con Stripe
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </ThemeProvider>
    );
}

// Envuelve el componente en un Suspense
export default function TarjetaPageWrapper() {
    return (
        <Suspense fallback={<CircularProgress color="primary" />}>
            <TarjetaPage />
        </Suspense>
    );
}
