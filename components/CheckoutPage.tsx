import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    useStripe,
    useElements,
    PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";

interface CheckoutPageProps {
    amount: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const searchParams = useSearchParams();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const totalParam = searchParams.get('total');
    const orderId = searchParams.get('orderId');
    const customerName = searchParams.get('customerName');
    const customerPhone = searchParams.get('customerPhone');
    const notation = searchParams.get('notation');
    const isDelivery = searchParams.get('isDelivery');
    const pickupDateTime = searchParams.get('pickupDateTime');
    const itemsParam = searchParams.get('items'); // Obtener los items de los parámetros

    useEffect(() => {
        if (amount > 0) {
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Error en la creación del PaymentIntent');
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    } else {
                        setErrorMessage("No se pudo obtener el clientSecret");
                    }
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                });
        } else {
            setErrorMessage("El monto no es válido.");
        }
    }, [amount]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setErrorMessage("Stripe no está disponible. Inténtalo de nuevo más tarde.");
            setLoading(false);
            return;
        }

        const { error: submitError } = await elements.submit();

        if (submitError) {
            setLoading(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,

            confirmParams: {
                return_url: `http://192.168.1.37:3000/ticket?orderId=${encodeURIComponent(orderId!)}&total=${encodeURIComponent(totalParam!)}&customerName=${encodeURIComponent(customerName!)}&customerPhone=${encodeURIComponent(customerPhone!)}&notation=${encodeURIComponent(notation!)}&isDelivery=${encodeURIComponent(isDelivery!)}&pickupDateTime=${encodeURIComponent(pickupDateTime!)}&items=${encodeURIComponent(itemsParam!)}` // Incluir items aquí
            },
        });

        if (error) {
            setErrorMessage(error.message);
        }

        setLoading(false);
    };

    if (!clientSecret || !stripe || !elements) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                    role="status"
                >
                    <span className="sr-only">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-md shadow-md max-w-md mx-auto mt-8"
        >
            {clientSecret && <PaymentElement className="mb-4" />}

            {errorMessage && (
                <div className="text-red-500 mb-4 text-center">{errorMessage}</div>
            )}

            <button
                disabled={!stripe || loading}
                className="text-white w-full py-3 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
            >
                {!loading ? `Pagar ${amount.toFixed(2)}€` : "Procesando..."}
            </button>
        </form>
    );
};

export default CheckoutPage;
