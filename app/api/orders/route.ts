import connect from '@/lib/db'; // Conexión a la base de datos
import PedidoModel from '@/lib/modals/pedido'; // Modelo de pedido
import { NextResponse } from 'next/server';

// Define la estructura de los datos de un pedido
interface Pedido {
    id?: string; // El ID puede no estar presente en la creación
    items: Array<{ id: string; quantity: number; price: number }>;
    total: string;
    status: string;
    timestamp: string;
}

// GET request: Obtener todos los pedidos o filtrados por algún criterio
export const GET = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        const { searchParams } = new URL(request.url);
        const filters: Record<string, string> = Object.fromEntries(searchParams.entries());

        // Recuperar los pedidos de la base de datos según los filtros
        const pedidos = await PedidoModel.find(filters).exec();

        // Responder con los datos obtenidos
        return NextResponse.json({
            message: "Pedidos recuperados con éxito",
            data: pedidos,
        }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error recuperando pedidos:", error.message);
            return NextResponse.json({ error: "Error recuperando pedidos: " + error.message }, { status: 500 });
        }
    }
};

// POST request: Crear un nuevo pedido
export const POST = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos
        const data: Pedido = await request.json();

        // Validar los campos requeridos
        const { items, total, status, timestamp } = data;

        if (!items || !Array.isArray(items) || items.length === 0 || !total || !status || !timestamp) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        // Crear un nuevo pedido con los datos recibidos
        const newPedido = new PedidoModel({
            id: data.id,  // Asegúrate de proporcionar un ID o generarlo automáticamente
            items,
            total,
            status,
            timestamp,
        });

        // Guardar el nuevo pedido en la base de datos
        await newPedido.save();

        // Responder con éxito y con los datos guardados
        return NextResponse.json({
            message: "Pedido creado con éxito",
            data: newPedido,
        }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error guardando el pedido:", error.message);
            return NextResponse.json({ error: "Error guardando el pedido: " + error.message }, { status: 500 });
        }
    }
};

// PUT request: Actualizar un pedido existente
export const PUT = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        const updateData: Partial<Pedido> = await request.json(); // Obtener los datos del cuerpo de la solicitud

        // Validar los campos requeridos
        if (!updateData.id || !updateData.status) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        // Actualizar el pedido utilizando el ID proporcionado
        const updatedPedido = await PedidoModel.findOneAndUpdate(
            { id: updateData.id }, // Buscar por ID
            { status: updateData.status }, // Actualizar solo el campo 'status'
            { new: true }
        );

        if (!updatedPedido) {
            return NextResponse.json({ message: "Pedido no encontrado para actualizar" }, { status: 404 });
        }

        // Responder con el pedido actualizado
        return NextResponse.json({ message: "Pedido actualizado con éxito", data: updatedPedido }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error actualizando el pedido:", error.message);
            return NextResponse.json({ message: "Error actualizando el pedido" }, { status: 500 });
        }
    }
};

// DELETE request: Eliminar un pedido existente
export const DELETE = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Se requiere un ID para eliminar el pedido" }, { status: 400 });
        }

        // Eliminar el pedido utilizando el ID proporcionado
        const deletedPedido = await PedidoModel.findOneAndDelete({ id: id });

        if (!deletedPedido) {
            return NextResponse.json({ message: "Pedido no encontrado para eliminar" }, { status: 404 });
        }

        // Responder con éxito
        return NextResponse.json({ message: "Pedido eliminado con éxito", data: deletedPedido }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error eliminando el pedido:", error.message);
            return NextResponse.json({ message: "Error eliminando el pedido", status: 500 });
        }
    }
};
