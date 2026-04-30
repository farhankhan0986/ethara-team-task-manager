import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth";

export const GET = authMiddleware(async (req) => {
    return NextResponse.json({ user: req.user });
});