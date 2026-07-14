"use client"

import { useEffect, useState, useCallback } from "react"

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("")
  const [website, setWebsite] = useState("")
  const [address, setAddress] = useState("")
  const [tone, setTone] = useState("Professional & Friendly")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/profile", {
        headers: { Authorization: `Bearer ${(await (await import("@/lib/supabase")).getSupabase().auth.getSession()).data.session?.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBusinessName(data.name || "")
        setWebsite(data.website || "")
        setAddress(data.address || "")
        setTone(data.tone || "Professional & Friendly")
      }
    } catch (e) {
      console.error("Load error:", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const saveBusinessProfile = async () => {
    setMessage("")
    const supabase = (await import("@/lib/supabase")).getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setMessage("Not signed in"); return }

    const res = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName, website, address })
    })
    if (res.ok) {
      setMessage("Business profile saved!")
    } else {
      const err = await res.json()
      setMessage(err.error || "Failed to save")
    }
  }

  if (loading) return <div className="p-8"><p>Loading...</p></div>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {message && (
        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-md">{message}</div>
      )}

      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Business Profile</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input className="w-full border rounded-md p-2" value={businessName} onChange={e => setBusinessName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input className="w-full border rounded-md p-2" value={website} onChange={e => setWebsite(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input className="w-full border rounded-md p-2" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={saveBusinessProfile}
        >
          Save Changes
        </button>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Response Tone</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Tone</label>
          <select className="w-full border rounded-md p-2" value={tone} onChange={e => setTone(e.target.value)}>
            <option>Professional & Friendly</option>
            <option>Casual & Energetic</option>
            <option>Formal & Concise</option>
            <option>Empathetic & Warm</option>
          </select>
        </div>
      </div>
    </div>
  )
}