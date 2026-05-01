"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function TasksPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        dueDate: "",
    });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [meRes, taskRes, projRes, userRes] = await Promise.all([
                    fetch("/api/auth/me", { credentials: "include" }),
                    fetch("/api/tasks", { credentials: "include" }),
                    fetch("/api/projects", { credentials: "include" }),
                    fetch("/api/users", { credentials: "include" }),
                ]);

                if (meRes.status === 401) { router.push("/login"); return; }

                const me = await meRes.json();
                setUser(me.user);
                setTasks((await taskRes.json()).tasks || []);
                setProjects((await projRes.json()).projects || []);
                setUsers((await userRes.json()).users || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

    const fetchTasks = async () => {
        const res = await fetch("/api/tasks", { credentials: "include" });
        setTasks((await res.json()).tasks || []);
    };

    const updateStatus = async (id, status) => {
        await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        fetchTasks();
    };

    const createTask = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.title || !form.project) {
            setFormError("Title and project are required");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || "Failed");
            }
            setForm({ title: "", description: "", project: "", assignedTo: "", dueDate: "" });
            setShowForm(false);
            fetchTasks();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const isAdmin = user?.role === "admin";

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-5 py-8">
                <p className="text-sm text-gray-500">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                )}
            </div>

            {showForm && isAdmin && (
                <form onSubmit={createTask} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">Create Task</h2>

                    {formError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{formError}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                                placeholder="Task title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Project *</label>
                            <select
                                value={form.project}
                                onChange={(e) => setForm({ ...form, project: e.target.value })}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                                required
                            >
                                <option value="">Select project</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Assign To</label>
                            <select
                                value={form.assignedTo}
                                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                            >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition resize-none"
                            rows={2}
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Task"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-500 text-sm hover:text-gray-700 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No tasks yet.</p>
            ) : (
                <>
                    <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium">Title</th>
                                    <th className="text-left px-4 py-3 font-medium">Description</th>
                                    <th className="text-left px-4 py-3 font-medium">Project</th>
                                    <th className="text-left px-4 py-3 font-medium">Assigned</th>
                                    <th className="text-left px-4 py-3 font-medium">Due</th>
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id} className="border-t border-gray-100 hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-3 text-gray-900 font-medium hover:text-blue-700 transition cursor-pointer" onClick={()=>router.push(`/tasks/${task._id}`)}>{task.title}</td>
                                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{task.description || "-"}</td>
                                        <td className="px-4 py-3 text-gray-500">{task.project?.name || "-"}</td>
                                        <td className="px-4 py-3 text-gray-500">{task.assignedTo?.name || "-"}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateStatus(task._id, e.target.value)}
                                                className="border border-gray-200 rounded-md px-2 py-1 text-xs outline-none focus:border-gray-400"
                                            >
                                                <option value="Todo">Todo</option>
                                                <option value="In-Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {tasks.map((task) => (
                            <div key={task._id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900 select-none" onClick={()=>router.push(`/tasks/${task._id}`)}>{task.title}</h3>
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateStatus(task._id, e.target.value)}
                                        className="border border-gray-200 rounded-md px-2 py-1 text-[11px] outline-none shrink-0"
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In-Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                {task.description && (
                                    <p className="text-xs text-gray-500">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                    <span>Project: <span className="text-gray-600">{task.project?.name || "-"}</span></span>
                                    <span>Assigned: <span className="text-gray-600">{task.assignedTo?.name || "-"}</span></span>
                                    {task.dueDate && (
                                        <span>Due: <span className="text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</span></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}