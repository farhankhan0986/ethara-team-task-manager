import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/models/Task";
import { authMiddleware } from "@/middleware/auth";

export const GET = authMiddleware(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;

    const task = await Task.findById(id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return NextResponse.json({ message: "Task not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
});

export const PATCH = authMiddleware(async (req, { params }) => {
  await dbConnect();

  const { id } = await params;
  const { status } = await req.json();

  const task = await Task.findById(id);

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  if (
    task.assignedTo?.toString() !== req.user.id &&
    task.createdBy.toString() !== req.user.id
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  task.status = status || task.status;
  await task.save();

  return NextResponse.json({ success: true, task });
});