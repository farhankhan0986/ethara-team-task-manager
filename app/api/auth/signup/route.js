import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
    try {
        await dbConnect();

        const { name, email, password, role } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ message: "All fields are required", success: false }, { status: 400 })
        }

        const exists = await User.findOne({ email });
        if (exists) return NextResponse.json({ message: "User already exists", success: false }, { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        const token = signToken({ id: user._id, name: user.name, email: user.email, role: user.role });

        const response = NextResponse.json({ message: "User created successfully", success: true }, { status: 201 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}