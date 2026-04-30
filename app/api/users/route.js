import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { authMiddleware } from "@/middleware/auth";

export const GET = authMiddleware(async (req) => {
  await dbConnect();

  const users = await User.find({}, "name email role").sort({ name: 1 });

  return NextResponse.json({ users });
});
