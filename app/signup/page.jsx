'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Sign Up</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your team and tasks</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 cursor-pointer text-white py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-900 cursor-pointer font-medium">
            Log In
          </Link>
        </p>
      </section>
    </main>
  );
}