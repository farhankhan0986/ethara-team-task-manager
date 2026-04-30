import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { authMiddleware, requireRole } from "@/middleware/auth";

export const GET = authMiddleware(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;

    const project = await Project.findById(id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!project) {
      return NextResponse.json({ message: "Project not found", success: false }, { status: 404 });
    }

    const tasks = await Task.find({ project: id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, project, tasks });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
});

export const PUT = requireRole("admin")(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const { name, description, members } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Project name is required", success: false }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found", success: false }, { status: 404 });
    }

    const memberIds = [...new Set([req.user.id, ...(members || [])])];
    project.name = name;
    project.description = description;
    project.members = memberIds;
    await project.save();

    const updated = await Project.findById(id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    return NextResponse.json({ message: "Project updated successfully", success: true, project: updated });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
});
