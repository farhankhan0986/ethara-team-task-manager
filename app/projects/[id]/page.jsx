"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setProject(data.project);
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-sm text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-sm text-gray-500">Project not found.</div>;
  }

  const statusColor = {
    Todo: "bg-amber-100 text-amber-800",
    "In-Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => router.push("/projects")}
        className="text-gray-400 hover:text-gray-700 text-sm transition"
      >
        ← Back to projects
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div>
          <h2 className="text-xs text-gray-400 mb-2">Members</h2>
          <div className="flex flex-wrap gap-2">
            {project.members?.map((m) => (
              <div key={m._id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[11px] font-semibold shrink-0">
                  {m.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-none">{m.name}</p>
                  <p className="text-[11px] text-gray-400">{m.email}</p>
                </div>
              </div>
            ))}
            {(!project.members || project.members.length === 0) && (
              <p className="text-xs text-gray-400">No members</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Tasks ({tasks.length})</h2>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-5">No tasks in this project yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.assignedTo?.name || "Unassigned"}
                    {task.dueDate && <> · Due {new Date(task.dueDate).toLocaleDateString()}</>}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
                  {task.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}