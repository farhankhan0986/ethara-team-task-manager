import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { authMiddleware } from "@/middleware/auth";

export const GET = authMiddleware(async (req) => {
  await dbConnect();
  const userId = req.user.id;
  const [tasks, projects] = await Promise.all([
    Task.find({
      $or: [{ assignedTo: userId }, { createdBy: userId }],
    })
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 }),
    Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate("members", "name email")
      .sort({ createdAt: -1 }),
  ]);

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "Todo").length;
  const inProgress = tasks.filter((t) => t.status === "In-Progress").length;
  const done = tasks.filter((t) => t.status === "Completed").length;

  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "Completed"
  ).length;

  return NextResponse.json({
    stats: { total, todo, inProgress, done, overdue },
    recentTasks: tasks.slice(0, 8),
    projects,
  });
});