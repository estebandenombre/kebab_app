import mongoose from 'mongoose';

interface PedidoItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

interface Pedido {
    id: string;
    items: PedidoItem[];
    total: string;
    status: 'pendiente' | 'preparando' | 'listo'; // Cambiado a español
    timestamp: string;
}

const pedidoSchema = new mongoose.Schema<Pedido>({
    id: { type: String, required: true },
    items: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    total: { type: String, required: true },
    status: { type: String, enum: ['pendiente', 'preparando', 'listo'], required: true }, // Cambiado a español
    timestamp: { type: String, required: true },
});

const PedidoModel = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);

export default PedidoModel;
