"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"

interface Inquiry {
  id: number
  full_name: string
  email: string
  phone: string
  service_type: string
  event_date: string | null
  message: string
  status: string
  created_at: string | null
}

interface Package {
  id: number
  name: string
  price: number
}

interface ConvertForm {
  client_name: string
  client_email: string
  client_phone: string
  package_id: number | ""
  event_date: string
  event_location: string
  total_price: number | ""
  deposit_paid: boolean
  notes: string
}

const STATUS_BADGES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-700",
  contacted: "bg-yellow-100 text-yellow-800",
  converted: "bg-green-100 text-green-800",
  dismissed: "bg-red-100 text-red-700",
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [converting, setConverting] = useState<Inquiry | null>(null)
  const [form, setForm] = useState<ConvertForm>({
    client_name: "",
    client_email: "",
    client_phone: "",
    package_id: "",
    event_date: "",
    event_location: "",
    total_price: "",
    deposit_paid: false,
    notes: "",
  })
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [inqRes, pkgRes] = await Promise.all([
        adminApi.get("/admin/inquiries"),
        adminApi.get("/admin/packages"),
      ])
      setInquiries(inqRes.data)
      setPackages(pkgRes.data)
    } catch {
      setError("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const patchStatus = async (id: number, status: string) => {
    try {
      const res = await adminApi.patch(`/admin/inquiries/${id}`, { status })
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: res.data.status } : i))
    } catch {
      alert("Failed to update status")
    }
  }

  const openConvert = (inquiry: Inquiry) => {
    setConverting(inquiry)
    setSubmitError("")
    setForm({
      client_name: inquiry.full_name || "",
      client_email: inquiry.email || "",
      client_phone: inquiry.phone || "",
      package_id: "",
      event_date: inquiry.event_date || "",
      event_location: "",
      total_price: "",
      deposit_paid: false,
      notes: "",
    })
  }

  const submitConvert = async () => {
    if (!converting) return
    setSubmitting(true)
    setSubmitError("")
    try {
      await adminApi.post(`/admin/inquiries/${converting.id}/convert`, {
        ...form,
        package_id: form.package_id === "" ? null : Number(form.package_id),
        total_price: form.total_price === "" ? 0 : Number(form.total_price),
      })
      setInquiries(prev => prev.map(i => i.id === converting.id ? { ...i, status: "converted" } : i))
      setConverting(null)
    } catch (e: any) {
      setSubmitError(e?.response?.data?.detail || "Failed to convert inquiry")
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (s: string | null) => s ? new Date(s).toLocaleDateString() : "—"

  if (loading) return <div className="p-8 text-gray-500">Loading inquiries...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inquiries</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {["Name","Email","Phone","Event Type","Event Date","Status","Created At","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No inquiries found</td></tr>
            )}
            {inquiries.map(inq => (
              <tr key={inq.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{inq.full_name || "—"}</td>
                <td className="px-4 py-3">{inq.email || "—"}</td>
                <td className="px-4 py-3">{inq.phone || "—"}</td>
                <td className="px-4 py-3 capitalize">{inq.service_type || "—"}</td>
                <td className="px-4 py-3">{inq.event_date || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[inq.status] || "bg-gray-100 text-gray-600"}`}>
                    {inq.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{fmt(inq.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {inq.status !== "read" && inq.status !== "converted" && (
                      <button
                        onClick={() => patchStatus(inq.id, "read")}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Mark Read
                      </button>
                    )}
                    {inq.status !== "contacted" && inq.status !== "converted" && (
                      <button
                        onClick={() => patchStatus(inq.id, "contacted")}
                        className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {inq.status !== "converted" && (
                      <button
                        onClick={() => openConvert(inq)}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Convert to Booking
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convert to Booking Modal */}
      {converting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Convert to Booking</h2>
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{submitError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.client_name}
                    onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.client_email}
                    onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Phone</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.client_phone}
                    onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.package_id}
                    onChange={e => setForm(f => ({ ...f, package_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                  >
                    <option value="">Select a package...</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.event_date}
                    onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.event_location}
                    onChange={e => setForm(f => ({ ...f, event_location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.total_price}
                    onChange={e => setForm(f => ({ ...f, total_price: e.target.value === "" ? "" : Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="deposit_paid"
                    checked={form.deposit_paid}
                    onChange={e => setForm(f => ({ ...f, deposit_paid: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="deposit_paid" className="text-sm font-medium text-gray-700">Deposit Paid</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setConverting(null)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={submitConvert}
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Converting..." : "Create Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
