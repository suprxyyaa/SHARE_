"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Upload, Share2, XCircle, LogOut, ChevronLeft } from "lucide-react";

export default function RecordsPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [shareForm, setShareForm] = useState({ doctor_id: "", expires_at: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files/mine");
      setFiles(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post("/files", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchFiles();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (fileId: string) => {
    setError("");
    try {
      await api.post(`/files/${fileId}/share`, {
        doctor_id: shareForm.doctor_id,
        expires_at: new Date(shareForm.expires_at).toISOString(),
      });
      alert("File shared successfully!");
      setSharing(null);
      setShareForm({ doctor_id: "", expires_at: "" });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Share failed");
    }
  };

  const handleRevoke = async (fileId: string) => {
    if (!confirm("Revoke all access to this file?")) return;
    try {
      await api.post(`/files/${fileId}/revoke`);
      alert("Access revoked");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Revoke failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
            <ChevronLeft size={20} /> Dashboard
          </Link>
          <button onClick={logout} className="flex items-center gap-1 text-red-500 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Medical Records</h2>
          <label className={`bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-indigo-700 flex items-center gap-2 ${uploading ? "opacity-50" : ""}`}>
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload File"}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload}
              disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 text-sm">
            🔒 Your files are stored privately. Only you can see them unless you explicitly share with a doctor.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file: any) => (
              <div key={file.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {(file.size_bytes / 1024).toFixed(1)} KB ·{" "}
                        {new Date(file.uploaded_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={file.cloudinary_url} target="_blank" rel="noreferrer"
                      className="text-indigo-600 hover:underline text-sm">View</a>
                    <button onClick={() => setSharing(sharing === file.id ? null : file.id)}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200">
                      <Share2 size={14} /> Share
                    </button>
                    <button onClick={() => handleRevoke(file.id)}
                      className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200">
                      <XCircle size={14} /> Revoke
                    </button>
                  </div>
                </div>

                {sharing === file.id && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 border">
                    <p className="text-sm font-medium text-gray-700 mb-3">Share with a Doctor</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input placeholder="Doctor ID (UUID)"
                        value={shareForm.doctor_id}
                        onChange={(e) => setShareForm({ ...shareForm, doctor_id: e.target.value })}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="datetime-local" value={shareForm.expires_at}
                        onChange={(e) => setShareForm({ ...shareForm, expires_at: e.target.value })}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button onClick={() => handleShare(file.id)}
                      className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                      Confirm Share
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