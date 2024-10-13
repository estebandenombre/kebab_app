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
    customerName?: string; // Campo para el nombre del cliente
    customerPhone?: string; // Campo para el teléfono del cliente
    pickupDateTime?: string; // Nuevo campo para la fecha y hora de recogida (opcional)
    isDelivery?: boolean; // Campo para indicar si es entrega a domicilio
    paid: boolean; // Nuevo campo para indicar si el pedido ha sido pagado
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
    pickupDateTime: { type: String, required: false }, // Nuevo campo para la fecha y hora de recogida
    isDelivery: { type: Boolean, required: true }, // Campo para indicar si es entrega a domicilio
    paid: { type: Boolean, required: true, default: false }, // Nuevo campo para indicar si el pedido ha sido pagado, con valor por defecto en `false`
});

// Modelo de Mongoose
const PedidoModel = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);

export default PedidoModel;
