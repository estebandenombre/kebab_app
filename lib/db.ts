import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
        console.log("Database is already connected");
        return;
    }

    if (connectionState === 2) {
        console.log("Database is connecting");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI!, {
            dbName: 'next14-mongodb-restapi',
            bufferCommands: true,
        });
        console.log("Connected");
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log("Error: ", err.message);
            throw new Error(`Error connecting to MongoDB: ${err.message}`);
        } else {
            console.log("Error: ", err);
            throw new Error("An unexpected error occurred while connecting to MongoDB.");
        }
    }
};

export default connect;
