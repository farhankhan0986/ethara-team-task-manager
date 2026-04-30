"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck, NotebookPen, RotateCcw,
  CircleCheckBig, MessageSquareWarning, FolderOpen,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, dashRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/dashboard", { credentials: "include" }),
        ]);
        if (meRes.status === 401 || dashRes.status === 401) {
          router.push("/login");
          return;
        }
        setUser((await meRes.json()).user);
        setData(await dashRes.json());
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-16 px-5 flex flex-col gap-3">
        <div className="h-4 w-4/5 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-4 w-3/5 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-20 w-full mt-4 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      </div>
    );
  }

  if (error) {
    return <div className="max-w-4xl mx-auto mt-16 px-5"><p className="text-red-600 text-sm">{error}</p></div>;
  }

  const { stats, recentTasks, projects } = data || {};
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col gap-7">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, {user?.name || "there"}</h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your tasks today.</p>
        </div>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-3 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-3.5`}>
        {isAdmin && (
          <StatCard label="Total Projects" value={projects?.length} icon={<FolderOpen size={18}/>} bg="bg-violet-50" fg="text-violet-500"/>
        )}
        <StatCard label="Total Tasks" value={stats?.total} icon={<ClipboardCheck size={18}/>} bg="bg-indigo-50" fg="text-indigo-500"/>
        <StatCard label="Todo" value={stats?.todo} icon={<NotebookPen size={18}/>} bg="bg-amber-50" fg="text-amber-500"/>
        <StatCard label="In Progress" value={stats?.inProgress} icon={<RotateCcw size={18}/>} bg="bg-blue-50" fg="text-blue-500"/>
        <StatCard label="Completed" value={stats?.done} icon={<CircleCheckBig size={18}/>} bg="bg-emerald-50" fg="text-emerald-500"/>
        <StatCard label="Overdue" value={stats?.overdue} icon={<MessageSquareWarning size={18}/>} bg="bg-red-50" fg="text-red-500"/>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : ''} gap-4`}>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-gray-400 hover:text-gray-600 transition">View all →</Link>
          </div>
          {recentTasks?.length === 0 && <p className="text-xs text-gray-400 text-center py-5">No tasks yet.</p>}
          <div className="flex flex-col">
            {recentTasks?.map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.project?.name || "No project"}{t.dueDate && <> · Due {new Date(t.dueDate).toLocaleDateString()}</>}</p>
                </div>
                <StatusBadge status={t.status}/>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your Projects</h2>
              <Link href="/projects" className="text-xs text-gray-400 hover:text-gray-600 transition">View all →</Link>
            </div>
            {projects?.length === 0 && <p className="text-xs text-gray-400 text-center py-5">No projects yet.</p>}
            <div className="flex flex-col">
              {projects?.map((p) => (
                <div key={p._id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 grid place-items-center shrink-0"><FolderOpen size={16}/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.members?.length || 0} member{p.members?.length !== 1 ? "s" : ""}{p.description && <> · {p.description}</>}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, fg }) {
  return (
    <div className="flex items-center gap-3.5 bg-white border border-gray-200 rounded-xl px-4 py-4 hover:shadow-sm transition">
      <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${bg} ${fg}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value ?? "–"}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = { Todo: "bg-amber-100 text-amber-800", "In-Progress": "bg-blue-100 text-blue-800", Completed: "bg-emerald-100 text-emerald-800" };
  const lbl = { Todo: "Todo", "In-Progress": "In Progress", Completed: "Done" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls[status] || "bg-gray-100 text-gray-600"}`}>{lbl[status] || status}</span>;
}