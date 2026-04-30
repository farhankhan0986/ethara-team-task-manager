import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
    try {
        await dbConnect();

        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ message: "All fields are required", success: false }, { status: 400 })
        }

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ message: "User not found", success: false }, { status: 404 })

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return NextResponse.json({ message: "Invalid password", success: false }, { status: 400 })

        const token = signToken({ id: user._id, name: user.name, email: user.email, role: user.role });

        const response = NextResponse.json({ message: "User logged in successfully", success: true }, { status: 200 });

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