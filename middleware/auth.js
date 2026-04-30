import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const authMiddleware = (handler) => {
  return async (req, ...args) => {
    try {
      const token = req.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { message: "Unauthorized", success: false },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { message: "Invalid token", success: false },
          { status: 401 }
        );
      }

      req.user = decoded;

      return handler(req, ...args);
    } catch (error) {
      return NextResponse.json(
        { message: "Auth error", success: false },
        { status: 500 }
      );
    }
  };
};

export const requireRole = (role) => (handler) =>
  authMiddleware(async (req, ...args) => {
    if (req.user.role !== role) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }
    return handler(req, ...args);
  });