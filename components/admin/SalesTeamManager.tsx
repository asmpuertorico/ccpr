"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import {
  Plus,
  Pencil,
  Trash2,
  Link,
  Download,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  QrCode,
  X,
} from "lucide-react";
import { useCSRF } from "./useCSRF";
import { useToast } from "./Toast";
import SalesRepForm, { type SalesRepFormData } from "./SalesRepForm";
import type { SalesRep } from "@/lib/db/schema";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "https://prconvention.com";

function profileUrl(slug: string) {
  return `${SITE_URL}/en/team/${slug}`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        status === "active"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active" ? "bg-green-500" : "bg-neutral-400"
        }`}
      />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

function QRModal({ rep, onClose }: { rep: SalesRep; onClose: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const url = profileUrl(rep.slug);

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${rep.firstName}-${rep.lastName}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-5">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            QR Code — {rep.firstName} {rep.lastName}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={canvasRef} className="p-4 bg-white rounded-xl border border-neutral-200">
          <QRCodeCanvas value={url} size={200} includeMargin level="H" />
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center break-all">{url}</p>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Link className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function RepCard({
  rep,
  onEdit,
  onDelete,
  onToggleStatus,
  onShowQR,
}: {
  rep: SalesRep;
  onEdit: (rep: SalesRep) => void;
  onDelete: (rep: SalesRep) => void;
  onToggleStatus: (rep: SalesRep) => void;
  onShowQR: (rep: SalesRep) => void;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-[4/3] relative bg-neutral-100 dark:bg-neutral-800">
        {rep.image ? (
          <Image src={rep.image} alt={`${rep.firstName} ${rep.lastName}`} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {rep.firstName[0]}{rep.lastName[0]}
              </span>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={rep.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {rep.firstName} {rep.lastName}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{rep.title}</p>
        </div>

        <div className="space-y-1.5">
          {rep.email && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{rep.email}</span>
            </div>
          )}
          {(rep.mobile || rep.phone) && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{rep.mobile || rep.phone}</span>
            </div>
          )}
          {rep.region && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{rep.region}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onShowQR(rep)}
            title="View QR Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
          <a
            href={profileUrl(rep.slug)}
            target="_blank"
            rel="noopener noreferrer"
            title="View Public Profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Link className="w-3.5 h-3.5" />
            View
          </a>
          <button
            onClick={() => onToggleStatus(rep)}
            title={rep.status === "active" ? "Deactivate" : "Activate"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {rep.status === "active" ? (
              <UserX className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onEdit(rep)}
            title="Edit"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(rep)}
            title="Delete"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalesTeamManager() {
  const { fetchWithCSRF } = useCSRF();
  const { showToast } = useToast();
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRep, setEditingRep] = useState<SalesRep | null>(null);
  const [saving, setSaving] = useState(false);
  const [qrRep, setQrRep] = useState<SalesRep | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  async function fetchReps() {
    try {
      const res = await fetch("/api/sales-reps");
      const data = await res.json();
      setReps(data.salesReps || []);
    } catch {
      showToast({ type: "error", title: "Failed to load sales reps" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReps();
  }, []);

  async function uploadImage(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    form.append("optimize", "true");
    form.append("targetWidth", "600");
    form.append("targetHeight", "600");

    const res = await fetchWithCSRF("/api/uploads", { method: "POST", body: form });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  }

  async function handleSave(data: SalesRepFormData, imageFile: File | null) {
    setSaving(true);
    try {
      let imageUrl = data.image;

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        if (!uploaded) {
          showToast({ type: "error", title: "Image upload failed" });
          setSaving(false);
          return;
        }
        imageUrl = uploaded;
      }

      const payload = { ...data, image: imageUrl };

      if (editingRep) {
        const res = await fetchWithCSRF(`/api/sales-reps/${editingRep.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setReps((prev) => prev.map((r) => (r.slug === editingRep.slug ? updated.salesRep : r)));
        showToast({ type: "success", title: "Sales rep updated" });
      } else {
        const res = await fetchWithCSRF("/api/sales-reps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        setReps((prev) => [created.salesRep, ...prev]);
        showToast({ type: "success", title: "Sales rep created" });
      }

      setShowForm(false);
      setEditingRep(null);
    } catch {
      showToast({ type: "error", title: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rep: SalesRep) {
    if (!confirm(`Delete ${rep.firstName} ${rep.lastName}? This cannot be undone.`)) return;
    try {
      const res = await fetchWithCSRF(`/api/sales-reps/${rep.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReps((prev) => prev.filter((r) => r.slug !== rep.slug));
      showToast({ type: "success", title: "Sales rep deleted" });
    } catch {
      showToast({ type: "error", title: "Failed to delete" });
    }
  }

  async function handleToggleStatus(rep: SalesRep) {
    const newStatus = rep.status === "active" ? "inactive" : "active";
    try {
      const res = await fetchWithCSRF(`/api/sales-reps/${rep.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setReps((prev) => prev.map((r) => (r.slug === rep.slug ? updated.salesRep : r)));
      showToast({ type: "success", title: `Rep ${newStatus === "active" ? "activated" : "deactivated"}` });
    } catch {
      showToast({ type: "error", title: "Failed to update status" });
    }
  }

  const filtered = reps.filter((r) => {
    if (filter === "active") return r.status === "active";
    if (filter === "inactive") return r.status === "inactive";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Sales Team</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage sales rep profiles and their shareable QR business cards.
          </p>
        </div>
        <button
          onClick={() => { setEditingRep(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sales Rep
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              filter === f
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              ({f === "all" ? reps.length : reps.filter((r) => r.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">No sales reps found</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            {filter !== "all" ? "Try changing the filter." : "Add your first sales rep to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((rep) => (
            <RepCard
              key={rep.id}
              rep={rep}
              onEdit={(r) => { setEditingRep(r); setShowForm(true); }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onShowQR={(r) => setQrRep(r)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <SalesRepForm
          rep={editingRep}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingRep(null); }}
          saving={saving}
        />
      )}

      {/* QR modal */}
      {qrRep && <QRModal rep={qrRep} onClose={() => setQrRep(null)} />}
    </div>
  );
}
