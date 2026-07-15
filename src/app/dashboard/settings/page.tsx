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
    try {
      const supabase = (await import("@/lib/supabase")).getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setMessage("Not signed in - try refreshing the page"); return }

      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, website, address })
      })
      
      if (res.ok) {
        setMessage("Business profile saved!")
        loadSettings()
        return
      }
      
      const text = await res.text()
      let errMsg: string
      try {
        const err = JSON.parse(text)
        errMsg = err.error || "Error: " + res.status
      } catch {
        errMsg = "Server error (" + res.status + "): " + text.substring(0, 200)
      }
      
      if (errMsg === "User not found" || errMsg.includes("Failed to create")) {
        setMessage("Setting up your account...")
        const setupRes = await fetch("/api/settings/setup", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
        })
        const setupData = await setupRes.json()
        if (setupRes.ok) {
          const retryRes = await fetch("/api/settings/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ name: businessName, website, address })
          })
          if (retryRes.ok) {
            setMessage("Business profile saved!")
            loadSettings()
          } else {
            const retryText = await retryRes.text()
            setMessage("Error after setup: " + retryText.substring(0, 200))
          }
        } else {
          setMessage("Setup error: " + (setupData.error || "Unknown"))
        }
      } else {
        setMessage(errMsg)
      }
    } catch (e: any) {
      setMessage("Error: " + (e.message || "Unknown error"))
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
    </div>
  )
}