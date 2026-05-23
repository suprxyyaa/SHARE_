"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getUser, logout } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User, Video, MapPin, Clock, LogOut, ChevronLeft } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [booking, setBooking] = useState({
    scheduled_at: "", consultation_type: "VIDEO", notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/login");
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const [docRes, availRes] = await Promise.all([
        api.get(`/doctors/${id}`),
        api.get(`/doctors/${id}/availability`),
      ]);
      setDoctor(docRes.data.data);
      setAvailability(availRes.data.data);
    } catch { router.push("/search"); }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/appointments", {
        doctor_id: id,
        scheduled_at: new Date(booking.scheduled_at).toISOString(),
        consultation_type: booking.consultation_type,
        notes: booking.notes,
      });
      if (res.data.data.meeting_link) setMeetingLink(res.data.data.meeting_link);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Requested!</h2>
        <p className="text-gray-500 mb-4">Your appointment request has been sent. The doctor will confirm shortly.</p>
        {meetingLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700 font-medium mb-2">Video Meeting Link:</p>
            <a href={meetingLink} target="_blank" rel="noreferrer"
              className="text-blue-600 underline text-sm break-all">{meetingLink}</a>
          </div>
        )}
        <Link href="/payment"
          className="block bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 mb-3">
          Proceed to Payment
        </Link>
        <Link href="/appointments" className="text-indigo-600 hover:underline text-sm">
          View My Appointments
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/search" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
            <ChevronLeft size={20} /> Back to Search
          </Link>
          <button onClick={logout} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-indigo-600" size={36} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">Dr. {doctor.full_name}</h2>
              <p className="text-indigo-600 font-medium">{doctor.specialty}</p>
              <p className="text-gray-500 mt-2">{doctor.bio}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <span className="text-green-600 font-semibold text-lg">₹{doctor.consultation_fee}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  doctor.consultation_type === "VIDEO"
                    ? "bg-blue-100 text-blue-600"
                    : doctor.consultation_type === "IN_PERSON"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-purple-100 text-purple-600"
                }`}>
                  {doctor.consultation_type === "BOTH" ? "Video & In-Person" : doctor.consultation_type}
                </span>
                {doctor.gender && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {doctor.gender}
                  </span>
                )}
              </div>
              {doctor.clinic_address && (
                <div className="flex items-center gap-2 mt-3 text-gray-500">
                  <MapPin size={16} />
                  <span className="text-sm">{doctor.clinic_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        {availability.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} /> Available Days
            </h3>
            <div className="flex flex-wrap gap-2">
              {availability.map((slot: any) => (
                <span key={slot.id}
                  className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  {DAYS[slot.day_of_week]} · {slot.start_time} – {slot.end_time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Book Appointment</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input type="datetime-local" value={booking.scheduled_at}
                onChange={(e) => setBooking({ ...booking, scheduled_at: e.target.value })}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
              <select value={booking.consultation_type}
                onChange={(e) => setBooking({ ...booking, consultation_type: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {(doctor.consultation_type === "VIDEO" || doctor.consultation_type === "BOTH") && (
                  <option value="VIDEO">Video Call</option>
                )}
                {(doctor.consultation_type === "IN_PERSON" || doctor.consultation_type === "BOTH") && (
                  <option value="IN_PERSON">In Person</option>
                )}
              </select>
            </div>
            <textarea value={booking.notes} placeholder="Any notes for the doctor (optional)"
              onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {loading ? "Booking..." : `Book for ₹${doctor.consultation_fee}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}