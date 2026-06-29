"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Search, Loader2, Plus, Download, Globe, Phone, MapPin } from "lucide-react"

interface Lead {
  id: string
  name: string
  address: string
  rating: number
  ratingCount: number
  website: string | null
  phone: string
}

export default function LeadFinderPage() {
  const [businessType, setBusinessType] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Lead[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType || !city) {
      toast.error("Please enter both business type and city")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, city })
      })

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setResults(data.results)
        if (data.results.length === 0) {
          toast.info("No results found")
        }
      }
    } catch (error) {
      toast.error("Failed to search leads")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToList = async (lead: Lead) => {
    setSavingId(lead.id)
    try {
      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          category: businessType,
          city: city,
          rating: lead.rating,
          address: lead.address,
          website: lead.website,
          phone: lead.phone
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`${lead.name} added to your leads list`)
      } else {
        toast.error(data.error || "Failed to save lead")
      }
    } catch (error) {
      toast.error("Failed to save lead")
    } finally {
      setSavingId(null)
    }
  }

  const handleExport = () => {
    if (results.length === 0) return

    const headers = ["Name", "Address", "Rating", "Reviews", "Website", "Phone"]
    const csvContent = [
      headers.join(","),
      ...results.map(r => [
        `"${r.name}"`,
        `"${r.address}"`,
        r.rating,
        r.ratingCount,
        r.website || "N/A",
        r.phone
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `leads-${businessType}-${city}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV exported successfully")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Lead Finder</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find New Prospects</CardTitle>
          <CardDescription>
            Search for local businesses using Google Places. Note: Ensure "Places API" is enabled in your Google Cloud Console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="businessType">Business Type</Label>
              <Input 
                id="businessType" 
                placeholder="e.g. Restaurant, Dentist, Gym" 
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="e.g. Austin, TX" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>Found {results.length} businesses matching your criteria.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <div>{lead.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {lead.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{lead.rating}</span>
                          <span className="text-xs text-muted-foreground">({lead.ratingCount} reviews)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <Globe className="h-3 w-3" /> Website
                            </a>
                          )}
                          <div className="text-xs flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddToList(lead)}
                          disabled={savingId === lead.id}
                        >
                          {savingId === lead.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Plus className="h-4 w-4 mr-1" /> Add to List</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
