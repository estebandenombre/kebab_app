import { Schema, model, models } from 'mongoose';

const TicketSchema = new Schema(
    {
        companyName: {
            type: String,
            required: true,
        },
        tradeName: {
            type: String,
            required: true,
        },
        cifNif: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        province: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        phone: {
            type: String, // Campo de contacto
        },
        email: {
            type: String, // Campo de contacto
            required: true,
        },
        website: {
            type: String, // Campo de contacto
        },
        showTax: {
            type: Boolean,
            default: true,
        },
        logo: {
            type: String,
            default: '',
        },
        footerMessage: {
            type: String,
            default: '',
        },
        dateTime: {  // Añadir el campo `dateTime`
            type: Date, // Cambia a Date para asegurarte de que se maneje correctamente
            required: true, // Campo requerido
        }
    },
    {
        timestamps: true, // Agrega timestamps de createdAt y updatedAt
    }
);

const Ticket = models.Ticket || model('Ticket', TicketSchema);
export default Ticket;
