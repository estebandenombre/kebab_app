import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-09-30.acacia', // Asegúrate de usar la versión de API correcta
});

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "eur", // Cambiado de "usd" a "eur"
            automatic_payment_methods: { enabled: true },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
