"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMembers, setEditMembers] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, projRes, usersRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/projects", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
        ]);
        if (meRes.status === 401) { router.push("/login"); return; }
        setUser((await meRes.json()).user);
        setProjects((await projRes.json()).projects || []);
        setAllUsers((await usersRes.json()).users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects", { credentials: "include" });
    setProjects((await res.json()).projects || []);
  };

  const createProject = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Project name is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, members: selectedMembers }),
      });
      if (!res.ok) { throw new Error((await res.json()).message || "Failed"); }
      setName(""); setDescription(""); setSelectedMembers([]);
      setShowForm(false);
      fetchProjects();
    } catch (err) { setFormError(err.message); }
    finally { setCreating(false); }
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditMembers(project.members?.map(m => m._id) || []);
    setEditError("");
    setShowForm(false);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    if (!editName.trim()) { setEditError("Project name is required"); return; }
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${editingProject._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription, members: editMembers }),
      });
      if (!res.ok) { throw new Error((await res.json()).message || "Failed"); }
      setEditingProject(null);
      fetchProjects();
    } catch (err) { setEditError(err.message); }
    finally { setUpdating(false); }
  };

  const isAdmin = user?.role === "admin";

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-8"><p className="text-sm text-gray-500">Loading projects...</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingProject(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
          >
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <ProjectForm
          title="Create Project"
          name={name} setName={setName}
          description={description} setDescription={setDescription}
          selectedMembers={selectedMembers} setSelectedMembers={setSelectedMembers}
          allUsers={allUsers} currentUserId={user?.id}
          onSubmit={createProject}
          onCancel={() => setShowForm(false)}
          submitting={creating}
          submitLabel="Create Project"
          error={formError}
        />
      )}

      {editingProject && isAdmin && (
        <ProjectForm
          title={`Edit: ${editingProject.name}`}
          name={editName} setName={setEditName}
          description={editDescription} setDescription={setEditDescription}
          selectedMembers={editMembers} setSelectedMembers={setEditMembers}
          allUsers={allUsers} currentUserId={user?.id}
          onSubmit={saveEdit}
          onCancel={() => setEditingProject(null)}
          submitting={updating}
          submitLabel="Save Changes"
          error={editError}
        />
      )}

      {projects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">No projects yet.</p>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Members</th>
                  <th className="text-left px-4 py-3 font-medium">Your Role</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const isOwner = project.createdBy?._id === user?.id || project.createdBy === user?.id;
                  return (
                    <tr key={project._id} className="border-t border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 cursor-pointer hover:text-blue-600 text-gray-900 font-medium" onClick={() => router.push(`/projects/${project._id}`)}>{project.name}</td>
                      <td className="px-4 py-3 text-gray-500">{project.description || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {project.members?.map((m) => (
                            <span key={m._id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {m.name || m.email}
                            </span>
                          ))}
                          {(!project.members || project.members.length === 0) && "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isOwner ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {isOwner ? "Owner" : "Member"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <button onClick={() => openEditForm(project)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition">
                            <Pencil size={13} /> Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {projects.map((project) => {
              const isOwner = project.createdBy?._id === user?.id || project.createdBy === user?.id;
              return (
                <div key={project._id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isOwner ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {isOwner ? "Owner" : "Member"}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-500">{project.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {project.members?.map((m) => (
                      <span key={m._id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {m.name || m.email}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-400">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                      <button onClick={() => openEditForm(project)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition">
                        <Pencil size={13} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectForm({ title, name, setName, description, setDescription, selectedMembers, setSelectedMembers, allUsers, currentUserId, onSubmit, onCancel, submitting, submitLabel, error }) {
  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const otherUsers = allUsers.filter(u => u._id !== currentUserId);

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Project Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
            placeholder="e.g. Website Redesign" required />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
            placeholder="Optional description" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Members</label>
        <div className="border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
          {otherUsers.map((u) => (
            <label key={u._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm">
              <input type="checkbox" checked={selectedMembers.includes(u._id)}
                onChange={() => toggleMember(u._id)} className="rounded border-gray-300" />
              <span className="text-gray-700">{u.name}</span>
              <span className="text-xs text-gray-400">{u.email}</span>
            </label>
          ))}
          {otherUsers.length === 0 && <p className="text-xs text-gray-400 py-2 text-center">No other users</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 transition disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-500 text-sm hover:text-gray-700 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}