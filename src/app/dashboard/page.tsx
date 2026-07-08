"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Star, TrendingUp, Loader2 } from "lucide-react"

interface DashboardStats {
  totalReviews: number
  responseRate: number
  avgRating: number
  autoResponses: number
  recentReviews: any[]
  sourceCounts: { source: string; count: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = getSupabase()
        
        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setLoading(false)
          return
        }

        // 2. Get organization_id
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()
        
        if (userDataError || !userData?.organization_id) {
          console.warn("User has no organization linked")
          setLoading(false)
          return
        }
        
        const orgId = userData.organization_id

        // 3. Get locations for this organization
        const { data: locations, error: locationsError } = await supabase
          .from('locations')
          .select('id')
          .eq('organization_id', orgId)
        
        if (locationsError) throw locationsError
        
        const locationIds = locations?.map(l => l.id) || []
        
        if (locationIds.length === 0) {
          setStats({
            totalReviews: 0,
            responseRate: 0,
            avgRating: 0,
            autoResponses: 0,
            recentReviews: [],
            sourceCounts: []
          })
          setLoading(false)
          return
        }

        // 4. Fetch metrics in parallel
        const [
          totalReviewsRes,
          respondedReviewsRes,
          ratingsDataRes,
          autoResponsesRes,
          recentReviewsRes,
          sourceDataRes
        ] = await Promise.all([
          supabase.from('reviews').select('*', { count: 'exact', head: true }).in('location_id', locationIds),
          supabase.from('reviews').select('*', { count: 'exact', head: true }).in('location_id', locationIds).eq('responded', true),
          supabase.from('reviews').select('rating').in('location_id', locationIds),
          supabase.from('responses').select('*', { count: 'exact', head: true }).in('location_id', locationIds),
          supabase.from('reviews').select('*').in('location_id', locationIds).order('posted_at', { ascending: false }).limit(5),
          supabase.from('reviews').select('source').in('location_id', locationIds)
        ])

        // 5. Calculate JS side metrics
        const total = totalReviewsRes.count || 0
        const responded = respondedReviewsRes.count || 0
        const responseRate = total > 0 ? (responded / total) * 100 : 0
        
        const ratings = ratingsDataRes.data || []
        const avgRating = ratings.length > 0
          ? ratings.reduce((acc, r) => acc + (r.rating || 0), 0) / ratings.length
          : 0

        // Group sources
        const sources: Record<string, number> = {}
        sourceDataRes.data?.forEach(r => {
          sources[r.source] = (sources[r.source] || 0) + 1
        })
        const sourceCounts = Object.entries(sources).map(([source, count]) => ({ 
          source: source.charAt(0).toUpperCase() + source.slice(1), 
          count 
        }))

        setStats({
          totalReviews: total,
          responseRate,
          avgRating,
          autoResponses: autoResponsesRes.count || 0,
          recentReviews: recentReviewsRes.data || [],
          sourceCounts
        })
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to ReplyEngine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn't find any data for your organization. Please make sure you have connected at least one integration in the settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all connected sources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Reviews with AI responses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Responses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoResponses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Generated by AI
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentReviews.length > 0 ? (
                stats.recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-medium leading-none">{review.author_name || "Anonymous"}</p>
                         <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground opacity-20'}`} 
                                />
                            ))}
                         </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        "{review.content}"
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {review.posted_at ? new Date(review.posted_at).toLocaleDateString() : 'Unknown date'} via {review.source}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No reviews found.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {stats.sourceCounts.length > 0 ? (
                  stats.sourceCounts.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.source}</span>
                      <span className="text-sm font-bold">{source.count.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No sources connected.</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
