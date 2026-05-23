"use client";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText, Search, LogOut, User } from "lucide-react";

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "PATIENT") { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">MedShare</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm flex items-center gap-1">
              <User size={16} /> {user.email}
            </span>
            <button onClick={logout}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back 👋
        </h2>
        <p className="text-gray-500 mb-8">What would you like to do today?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/search"
            className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
              <Search className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Find a Doctor</h3>
            <p className="text-gray-500 text-sm mt-1">Search and book appointments with verified doctors</p>
          </Link>

          <Link href="/appointments"
            className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <Calendar className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">My Appointments</h3>
            <p className="text-gray-500 text-sm mt-1">View and manage your upcoming appointments</p>
          </Link>

          <Link href="/records"
            className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <FileText className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Medical Records</h3>
            <p className="text-gray-500 text-sm mt-1">Upload and manage your private medical files</p>
          </Link>
        </div>
      </div>
    </div>
  );
}