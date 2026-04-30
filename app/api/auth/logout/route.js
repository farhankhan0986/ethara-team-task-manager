import { NextResponse } from "next/server";

export const POST = async () => {
  const response = NextResponse.json({
    message: "Logged out successfully",
    success: true,
  });

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
};