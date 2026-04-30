import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Project from "@/models/Project";
import { authMiddleware } from "@/middleware/auth";
import { requireRole } from "@/middleware/auth";

export const POST = requireRole("admin")(async (req) => {
    try {
        await dbConnect();

        const { name, description, members } = await req.json();
        if (!name) {
            return NextResponse.json({ message: "Project name is required", success: false }, { status: 400 });
        }

        const memberIds = [...new Set([req.user.id, ...(members || [])])];

        const project = new Project({
            name: name,
            description: description,
            createdBy: req.user.id,
            members: memberIds
        });

        await project.save();
        return NextResponse.json({ message: "Project created successfully", success: true, project }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
})

export const GET = authMiddleware(async (req)=>{
    try {
        await dbConnect();
        const projects = await Project.find({
            $or: [
                { createdBy: req.user.id },
                { members: req.user.id }
            ]
        }).populate("members", "name email").populate("createdBy", "name email")
        return NextResponse.json({ message: "Projects fetched successfully", success: true, projects }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
})