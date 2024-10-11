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
    status: 'pendiente' | 'preparando' | 'listo';
    timestamp: string;
    notation?: string; // Campo de notas
    customerName: string; // Nuevo campo para el nombre del cliente
    customerPhone: string; // Nuevo campo para el teléfono del cliente
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
    status: { type: String, enum: ['pendiente', 'preparando', 'listo'], required: true },
    timestamp: { type: String, required: true },
    notation: { type: String, required: false }, // Campo de notas
    customerName: { type: String, required: false }, // Campo para el nombre del cliente
    customerPhone: { type: String, required: false }, // Campo para el teléfono del cliente
});

// Modelo de Mongoose
const PedidoModel = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);

export default PedidoModel;
