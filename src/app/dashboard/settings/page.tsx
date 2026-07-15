"use client"

import { useEffect, useState, useCallback } from "react"

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("")
  const [website, setWebsite] = useState("")
  const [address, setAddress] = useState("")
  const [tone, setTone] = useState("Professional & Friendly")
  const [customInstructions, setCustomInstructions] = useState("")
  const [emailNewReviews, setEmailNewReviews] = useState(true)
  const [emailDailySummary, setEmailDailySummary] = useState(true)
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(false)
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
        setCustomInstructions(data.customInstructions || "")
        setEmailNewReviews(data.emailNewReviews ?? true)
        setEmailDailySummary(data.emailDailySummary ?? true)
        setEmailWeeklyReport(data.emailWeeklyReport ?? false)
      }
    } catch (e) {
      console.error("Load error:", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const doSave = async (body: any) => {
    const supabase = (await import("@/lib/supabase")).getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setMessage("Not signed in"); return false }

    const res = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (res.ok) return true

    const text = await res.text()
    try {
      const err = JSON.parse(text)
      if (err.error === "User not found" || (err.error || "").includes("Failed to create")) {
        setMessage("Setting up your account...")
        const setupRes = await fetch("/api/settings/setup", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
        })
        if (setupRes.ok) {
          const retry = await fetch("/api/settings/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body)
          })
          if (retry.ok) return true
          const rt = await retry.text()
          setMessage("Error: " + rt.substring(0, 200))
          return false
        }
        const sd = await setupRes.json()
        setMessage("Setup error: " + (sd.error || "Unknown"))
        return false
      }
      setMessage(err.error || "Error: " + res.status)
    } catch {
      setMessage("Server error: " + text.substring(0, 200))
    }
    return false
  }

  const saveBusinessProfile = async () => {
    setMessage("")
    const ok = await doSave({ name: businessName, website, address })
    if (ok) { setMessage("Business profile saved!"); loadSettings() }
  }

  const saveTone = async () => {
    setMessage("")
    const ok = await doSave({ tone, customInstructions })
    if (ok) setMessage("Response tone saved!")
  }

  const saveNotifications = async () => {
    setMessage("")
    const ok = await doSave({ emailNewReviews, emailDailySummary, emailWeeklyReport })
    if (ok) setMessage("Notification preferences saved!")
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
          <label className="block text-sm font-medium mb-1">Primary Tone</label>
          <select className="w-full border rounded-md p-2" value={tone} onChange={e => setTone(e.target.value)}>
            <option>Professional & Friendly</option>
            <option>Casual & Energetic</option>
            <option>Formal & Concise</option>
            <option>Empathetic & Warm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Custom Instructions (Optional)</label>
          <textarea className="w-full min-h-[100px] border rounded-md p-2" value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} placeholder="E.g., Always mention our weekly specials" />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={saveTone}
        >
          Save Tone
        </button>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">New Review Alerts</span>
          <input type="checkbox" checked={emailNewReviews} onChange={e => setEmailNewReviews(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">Daily Summary Report</span>
          <input type="checkbox" checked={emailDailySummary} onChange={e => setEmailDailySummary(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">Weekly Insight Report</span>
          <input type="checkbox" checked={emailWeeklyReport} onChange={e => setEmailWeeklyReport(e.target.checked)} />
        </label>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={saveNotifications}
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
}