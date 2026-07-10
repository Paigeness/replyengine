"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ResponseWithReview {
  id: string
  content: string
  approved: boolean
  posted: boolean
  created_at: string
  reviews: {
    author_name: string
    content: string
  }
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<ResponseWithReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const loadResponses = async () => {
    setLoading(true)
    const supabase = getSupabase()
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    // Fetch user's organization_id
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!userData?.organization_id) {
      setLoading(false)
      return
    }

    // Fetch responses joined with reviews and locations to filter by organization_id
    const { data, error } = await supabase
      .from('responses')
      .select(`
        id,
        content,
        approved,
        posted,
        created_at,
        reviews!inner (
          author_name,
          content
        ),
        locations!inner (
          organization_id
        )
      `)
      .eq('locations.organization_id', userData.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching responses:', error)
      toast.error("Failed to load responses")
    } else {
      setResponses(data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadResponses()
  }, [])

  const filteredResponses = responses.filter((response) =>
    response.reviews?.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.reviews?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatus = (response: ResponseWithReview) => {
    if (response.posted) return 'posted'
    if (response.approved) return 'approved'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Response Log</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search responses..." 
            className="pl-8 w-[250px]" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review Author</TableHead>
              <TableHead className="max-w-[300px]">Review</TableHead>
              <TableHead className="max-w-[400px]">Response</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading responses...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No responses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.reviews?.author_name || 'Unknown'}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {response.reviews?.content || 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    {response.content}
                  </TableCell>
                  <TableCell>
                    {formatDate(response.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatus(response) === 'posted' ? 'default' : 'secondary'}>
                      {getStatus(response)}
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
