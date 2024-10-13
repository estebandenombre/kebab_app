import connect from '@/lib/db'; // Conexión a la base de datos
import PedidoModel from '@/lib/modals/pedido'; // Modelo de pedido
import { NextResponse } from 'next/server';

// GET request: Obtener un pedido por ID
export const GET = async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        await connect(); // Conectar a la base de datos

        const { id } = params;

        // Buscar el pedido en la base de datos por su ID
        const pedido = await PedidoModel.findOne({ id });

        // Si no se encuentra el pedido, devolver un error 404
        if (!pedido) {
            return NextResponse.json(
                { message: 'Pedido no encontrado' },
                { status: 404 }
            );
        }

        // Devolver el pedido en formato JSON
        return NextResponse.json(
            {
                message: 'Pedido recuperado con éxito',
                data: pedido,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error recuperando el pedido:', error.message);
            return NextResponse.json(
                { error: `Error recuperando el pedido: ${error.message}` },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'Error desconocido' },
            { status: 500 }
        );
    }
};
