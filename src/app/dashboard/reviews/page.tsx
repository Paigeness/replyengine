"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Loader2, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Review {
  id: string
  author_name: string
  source: string
  rating: number
  content: string
  posted_at: string
  responded: boolean
  location_id: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const supabase = getSupabase()

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        // Get user's organization
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .single()

        if (userError) throw userError
        if (!userData?.organization_id) throw new Error("No organization found")

        // Get reviews for this organization
        const { data, error: reviewsError } = await supabase
          .from("reviews")
          .select("*, locations!inner(organization_id)")
          .eq("locations.organization_id", userData.organization_id)
          .order("posted_at", { ascending: false })

        if (reviewsError) throw reviewsError
        setReviews(data || [])
      } catch (err: any) {
        console.error("Error fetching reviews:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [supabase])

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = 
        review.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSource = sourceFilter.length === 0 || sourceFilter.includes(review.source.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "responded" ? review.responded : !review.responded)

      return matchesSearch && matchesSource && matchesStatus
    })
  }, [reviews, searchQuery, sourceFilter, statusFilter])

  const toggleSourceFilter = (source: string) => {
    setSourceFilter(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground">
            Manage and respond to your customer reviews from all sources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reviews..." 
              className="pl-8 w-[250px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="responded">Responded</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Sources:</span>
          {["Google", "Yelp", "TripAdvisor"].map((source) => {
            const id = source.toLowerCase()
            const active = sourceFilter.includes(id)
            return (
              <Button
                key={id}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSourceFilter(id)}
                className="h-8"
              >
                {active && <Check className="mr-1 h-3 w-3" />}
                {source}
              </Button>
            )
          })}
          {sourceFilter.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSourceFilter([])}
              className="h-8 px-2 text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-[400px]">Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Star className="h-8 w-8 opacity-20" />
                    <p>No reviews found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.author_name}</TableCell>
                  <TableCell className="capitalize">{review.source}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="truncate" title={review.content}>
                      {review.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(review.posted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.responded ? "default" : "secondary"
                      }
                    >
                      {review.responded ? "Responded" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
