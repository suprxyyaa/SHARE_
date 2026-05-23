"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Video, User, Star, LogOut } from "lucide-react";

export default function SearchPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialty: "", consultation_type: "", gender: "",
  });
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/login");
  }, [router]);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialty) params.append("specialty", filters.specialty);
      if (filters.consultation_type) params.append("consultation_type", filters.consultation_type);
      if (filters.gender) params.append("gender", filters.gender);
      const res = await api.get(`/doctors?${params.toString()}`);
      setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">MedShare</Link>
          <button onClick={logout} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Find a Doctor</h2>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Specialty (e.g. Cardiologist)"
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select value={filters.consultation_type}
              onChange={(e) => setFilters({ ...filters, consultation_type: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Types</option>
              <option value="VIDEO">Video</option>
              <option value="IN_PERSON">In Person</option>
            </select>
            <select value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <button onClick={search}
              className="bg-indigo-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Search size={18} /> Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Searching doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No doctors found. Try different filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc: any) => (
              <Link href={`/doctor/${doc.user_id}`} key={doc.user_id}
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Dr. {doc.full_name}</h3>
                    <p className="text-indigo-600 text-sm">{doc.specialty}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{doc.bio}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">₹{doc.consultation_fee}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.consultation_type === "VIDEO"
                      ? "bg-blue-100 text-blue-600"
                      : doc.consultation_type === "IN_PERSON"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-purple-100 text-purple-600"
                  }`}>
                    {doc.consultation_type === "BOTH" ? "Video & In-Person" : doc.consultation_type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}