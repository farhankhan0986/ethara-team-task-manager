"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setChecked(true);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/login");
  };

  const navLink = (href, label) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 rounded-md text-sm transition ${
          active
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1
              onClick={() => router.push(user ? "/dashboard" : "/")}
              className="text-lg font-semibold text-gray-900 cursor-pointer tracking-tight"
            >
              TeamTask
            </h1>

            {checked && user && (
              <nav className="hidden sm:flex items-center gap-1">
                {navLink("/dashboard", "Dashboard")}
                {navLink("/projects", "Projects")}
                {navLink("/tasks", "Tasks")}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {checked && user ? (
              <>
                <span className="text-xs text-gray-500 hidden md:inline">
                  {user.name}
                  {user.role === "admin" && (
                    <span className="ml-1.5 text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-500 hover:text-red-700 hover:border-red-400 transition text-xs"
                >
                  Logout
                </button>
              </>
            ) : checked ? (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-900 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition text-sm"
                >
                  Sign Up
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {checked && user && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            {[
              { href: "/dashboard", label: "Home" },
              { href: "/projects", label: "Projects" },
              { href: "/tasks", label: "Tasks" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] transition ${
                  pathname === href ? "text-gray-900 font-semibold" : "text-gray-400"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
