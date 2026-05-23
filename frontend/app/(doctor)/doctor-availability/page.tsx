"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Plus, Trash2, LogOut, ChevronLeft } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([
    { day_of_week: 1, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "DOCTOR") { router.push("/login"); return; }
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const u = getUser();
      const res = await api.get(`/doctors/${u?.user_id}/availability`);
      if (res.data.data.length > 0) setSlots(res.data.data);
    } catch {}
  };

  const addSlot = () => {
    setSlots([...slots, { day_of_week: 1, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await api.post("/doctors/availability", slots);
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/doctor-dashboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
            <ChevronLeft size={20} /> Dashboard
          </Link>
          <button onClick={logout} className="flex items-center gap-1 text-red-500 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Availability</h2>
        <p className="text-gray-500 mb-6">Define the days and hours you are available for appointments.</p>

        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
                <select value={slot.day_of_week}
                  onChange={(e) => updateSlot(index, "day_of_week", parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  {DAYS.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
                <input type="time" value={slot.start_time}
                  onChange={(e) => updateSlot(index, "start_time", e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <input type="time" value={slot.end_time}
                  onChange={(e) => updateSlot(index, "end_time", e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <div className="flex items-center gap-2">
                  <select value={slot.slot_duration_minutes}
                    onChange={(e) => updateSlot(index, "slot_duration_minutes", parseInt(e.target.value))}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-1">
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                  <button onClick={() => removeSlot(index)}
                    className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addSlot}
          className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          <Plus size={18} /> Add Another Day
        </button>

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            ✅ Availability saved successfully!
          </div>
        )}

        <button onClick={handleSave} disabled={loading}
          className="mt-6 w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
          {loading ? "Saving..." : "Save Availability"}
        </button>
      </div>
    </div>
  );
}