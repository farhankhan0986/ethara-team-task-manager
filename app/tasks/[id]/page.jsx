"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${params.id}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setTask(data.task);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-sm text-gray-500">Loading task...</div>;
  }

  if (!task) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-sm text-gray-500">Task not found.</div>;
  }

  const statusColor = {
    Todo: "bg-amber-100 text-amber-800",
    "In-Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => router.push("/tasks")}
        className="text-gray-400 hover:text-gray-700 text-sm transition"
      >
        ← Back to tasks
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex justify-between items-start gap-3">
          <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-700 transition" onClick={() => router.push(`/tasks/${task._id}`)}>{task.title}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
            {task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Project</p>
            <p className="text-sm font-medium text-gray-900">{task.project?.name || "No project"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
            <p className="text-sm font-medium text-gray-900">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Created By</p>
            <p className="text-sm font-medium text-gray-900">{task.createdBy?.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {task.assignedTo && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Assigned To</h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-sm font-semibold shrink-0">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{task.assignedTo.name}</p>
              <p className="text-xs text-gray-400">{task.assignedTo.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}