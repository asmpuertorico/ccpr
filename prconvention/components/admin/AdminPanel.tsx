"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/lib/events";

type Props = { initialEvents: EventItem[] };

export default function AdminPanel({ initialEvents }: Props) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<EventItem>>({});

  const filtered = useMemo(() => {
    if (!query) return events;
    const q = query.toLowerCase();
    return events.filter((e) =>
      [e.name, e.planner, e.date, e.time].some((f) => f.toLowerCase().includes(q))
    );
  }, [events, query]);

  // Load latest events from API to avoid server/client memory divergence
  useEffect(() => {
    fetch('/api/events').then(r=>r.json()).then((data)=>{
      if(Array.isArray(data?.events)) setEvents(data.events);
    }).catch(()=>{});
    if (editingId) {
      const e = events.find((x) => x.id === editingId);
      if (e) setForm(e);
    } else {
      setForm({});
    }
  }, [editingId]);

  async function createOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name || "",
      planner: form.planner || "",
      date: form.date || "",
      time: form.time || "",
      image: form.image || "",
      ticketsUrl: form.ticketsUrl || "",
      description: form.description || "",
    };
    if (!editingId) {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = (await res.json()) as EventItem;
        setEvents((prev) => [...prev, created]);
        setForm({});
      }
      return;
    }
    const res = await fetch(`/api/events/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = (await res.json()) as EventItem;
      setEvents((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditingId(null);
      setForm({});
    }
  }

  async function remove(id: string) {
    const target = events.find((e) => e.id === id);
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((x) => x.id !== id));
      if (target?.image?.startsWith("/images/events/")) {
        const rel = target.image.replace("/images/events/", "");
        fetch(`/api/uploads/${rel}`, { method: "DELETE" });
      }
    }
  }

  async function exportJson() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "events.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: data }),
    });
    if (res.ok) setEvents(data);
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={createOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex items-center gap-3">
          <input id="import-url" placeholder="Paste event URL (Eventbrite, etc.)" className="flex-1 border border-ink/20 rounded-md px-3 py-2" />
          <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={async()=>{
            const el = document.getElementById('import-url') as HTMLInputElement | null;
            const url = el?.value?.trim();
            if(!url) return;
            const res = await fetch('/api/import-event', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url }) });
            if(res.ok){
              const data = await res.json();
              const ev = data.event || {};
              setForm({
                ...form,
                name: ev.name || form.name,
                description: ev.description || form.description,
                date: ev.date || form.date,
                time: ev.time || form.time,
                image: ev.image || form.image,
                planner: ev.planner || form.planner,
                ticketsUrl: ev.ticketsUrl || form.ticketsUrl,
              });
            } else {
              alert('Unable to import from URL');
            }
          }}>Import from Website</button>
        </div>
        <input value={form.name || ""} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Event name" className="border border-ink/20 rounded-md px-3 py-2" required />
        <input value={form.planner || ""} onChange={(e)=>setForm({...form, planner:e.target.value})} placeholder="Planner" className="border border-ink/20 rounded-md px-3 py-2" required />
        <input value={form.date || ""} onChange={(e)=>setForm({...form, date:e.target.value})} type="date" className="border border-ink/20 rounded-md px-3 py-2" required />
        <input value={form.time || ""} onChange={(e)=>setForm({...form, time:e.target.value})} type="time" className="border border-ink/20 rounded-md px-3 py-2" required />
        <div className="flex items-center gap-3 md:col-span-2">
          <input value={form.image || ""} onChange={(e)=>setForm({...form, image:e.target.value})} placeholder="/images/..." className="flex-1 border border-ink/20 rounded-md px-3 py-2" />
          <label className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-ink/20 rounded-md cursor-pointer">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
              const file = e.target.files?.[0];
              if(!file) return;
              if(file.size > 8*1024*1024){ alert('Max file size is 8MB'); return; }
              const fd = new FormData();
              fd.append('file', file);
              const res = await fetch('/api/uploads', { method:'POST', body: fd });
              if(res.ok){
                const data = await res.json();
                setForm({...form, image: data.path});
              } else {
                alert('Upload failed');
              }
            }} />
          </label>
          <button type="button" className="text-sm border px-3 py-2 rounded-md" onClick={async()=>{
            if(!form.image) return;
            // If image is remote (http/https), copy it into local storage
            if(/^https?:\/\//i.test(form.image)){
              const res = await fetch('/api/uploads/fetch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url: form.image }) });
              if(res.ok){
                const data = await res.json();
                setForm({...form, image: data.path});
              } else {
                alert('Copy failed');
              }
            }
          }}>Copy to Storage</button>
        </div>
        <input value={form.ticketsUrl || ""} onChange={(e)=>setForm({...form, ticketsUrl:e.target.value})} placeholder="Tickets URL" className="border border-ink/20 rounded-md px-3 py-2 md:col-span-2" />
        <textarea value={form.description || ""} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Description" className="border border-ink/20 rounded-md px-3 py-2 md:col-span-2" rows={3} />
        <div className="flex gap-3 md:col-span-2">
          <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm">{editingId ? "Save" : "Create"}</button>
          {editingId && (
            <button type="button" onClick={()=>{setEditingId(null); setForm({});}} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
          )}
          <button type="button" onClick={exportJson} className="rounded-md bg-black text-white px-4 py-2 text-sm">Export JSON</button>
          <label className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-ink/20 rounded-md cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) importJson(f);}} />
          </label>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search events..." className="border border-ink/20 rounded-md px-3 py-2 w-64" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={async()=>{
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async () => {
                const file = input.files?.[0];
                if(!file) return;
                const form = new FormData();
                form.append('file', file);
                form.append('dryRun', 'false');
                const res = await fetch('/api/import-csv', { method:'POST', body: form });
                if(res.ok){
                  alert('CSV import finished'); location.reload();
                } else {
                  const t = await res.text(); alert('Import failed: '+t);
                }
              };
              input.click();
            }}
          >
            Import CSV
          </button>

          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={async()=>{
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async () => {
                const file = input.files?.[0];
                if(!file) return;
                const form = new FormData();
                form.append('file', file);
                form.append('dryRun', 'true');
                form.append('limit', '5');
                const res = await fetch('/api/import-csv', { method:'POST', body: form });
                const j = await res.json();
                alert('Preview '+j.count+' items. Check console for details.');
                console.log('CSV preview', j);
              };
              input.click();
            }}
          >
            Preview CSV
          </button>
        </div>
      </div>

      <div className="border border-ink/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Planner</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-ink/10">
                <td className="p-2">{e.name}</td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">{e.time}</td>
                <td className="p-2">{e.planner}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={()=>setEditingId(e.id)} className="rounded-md border px-2 py-1">Edit</button>
                  <button onClick={()=>remove(e.id)} className="rounded-md border px-2 py-1 text-sun">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


