import dotenv from "dotenv";
dotenv.config({quiet:true});
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("Please provide MONGO_URI in the environment variables");

let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = { conn: null, promise: null};
}

export async function dbConnect(){
    if(cached.conn) return cached.conn;

    if(!cached.promise){
        cached.promise = mongoose.connect(MONGO_URI).then((mongoose)=>{
            console.log('MongoDB connected');
            return mongoose;
        })
    }

    cached.conn = await cached.promise;
    return cached.conn;
}