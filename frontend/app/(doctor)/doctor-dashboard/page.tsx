"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User, LogOut, CheckCircle, XCircle } from "lucide-react";

const statusColors: any = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-100 text-gray-700",
};

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "DOCTOR") { router.push("/login"); return; }
    setUser(u);
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/mine");
      setAppointments(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, action: "confirm" | "cancel") => {
    try {
      await api.put(`/appointments/${id}/${action}`);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">MedShare — Doctor</h1>
          <div className="flex items-center gap-4">
            <Link href="/doctor-availability"
              className="flex items-center gap-1 text-indigo-600 hover:underline text-sm">
              <Clock size={16} /> Set Availability
            </Link>
            <button onClick={logout} className="flex items-center gap-1 text-red-500 text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Dashboard</h2>
        <p className="text-gray-500 mb-8">Manage your appointments</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No appointments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt: any) => (
              <div key={appt.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[appt.status]}`}>
                        {appt.status}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {appt.consultation_type === "VIDEO" ? "🎥 Video" : "🏥 In Person"}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800">
                      {new Date(appt.scheduled_at).toLocaleString("en-IN", {
                        dateStyle: "full", timeStyle: "short"
                      })}
                    </p>
                    {appt.notes && (
                      <p className="text-gray-500 text-sm mt-1">Patient notes: {appt.notes}</p>
                    )}
                    {appt.meeting_link && (
                      <a href={appt.meeting_link} target="_blank" rel="noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                        🔗 Join Meeting
                      </a>
                    )}
                  </div>
                  <p className="text-green-600 font-semibold">₹{appt.payment_amount}</p>
                </div>
                {appt.status === "PENDING" && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => updateStatus(appt.id, "confirm")}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200">
                      <CheckCircle size={16} /> Confirm
                    </button>
                    <button onClick={() => updateStatus(appt.id, "cancel")}
                      className="flex items-center gap-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
                      <XCircle size={16} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}