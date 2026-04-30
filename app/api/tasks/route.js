import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/models/Task";
import { authMiddleware } from "@/middleware/auth";
import { requireRole } from "@/middleware/auth";

export const POST = requireRole("admin")(async (req)=>{
    try {
        await dbConnect();

        const{title, description, project, assignedTo, dueDate} = await req.json();
        if(!title || !project){
            return NextResponse.json({message:"Title and project are required", success:false}, {status:400})
        }

        const task = new Task({
            title,
            description,
            project,
            assignedTo,
            dueDate,
            createdBy: req.user.id,
        });

        await task.save();
        return NextResponse.json({message:"Task created successfully", success:true, task}, {status:201})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal Server Error", success:false}, {status:500})
    }
})

export const GET = authMiddleware(async (req) => {
  await dbConnect();

  const tasks = await Task.find({
    $or: [
      { assignedTo: req.user.id },
      { createdBy: req.user.id },
    ],
  })
    .populate("assignedTo", "name email")
    .populate("project", "name");

  return NextResponse.json({ tasks });
});