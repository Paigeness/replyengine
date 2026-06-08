import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Star, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const reviews = [
  {
    id: "1",
    author: "Alice Smith",
    source: "Google",
    rating: 5,
    content: "The best experience ever! The staff was incredibly helpful.",
    date: "2024-05-20",
    status: "responded",
  },
  {
    id: "2",
    author: "Bob Jones",
    source: "Yelp",
    rating: 4,
    content: "Good food, but the wait was a bit long.",
    date: "2024-05-18",
    status: "pending",
  },
  {
    id: "3",
    author: "Charlie Brown",
    source: "TripAdvisor",
    rating: 2,
    content: "The room was not clean and the service was slow.",
    date: "2024-05-15",
    status: "pending",
  },
  {
    id: "4",
    author: "Diana Prince",
    source: "Google",
    rating: 5,
    content: "Amazing quality and fast delivery. Will order again!",
    date: "2024-05-10",
    status: "responded",
  },
  {
    id: "5",
    author: "Edward Norton",
    source: "Yelp",
    rating: 3,
    content: "Average experience. Nothing special.",
    date: "2024-05-05",
    status: "responded",
  },
]

export default function ReviewsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." className="pl-8 w-[250px]" />
          </div>
        </div>
      </div>
      <div className="rounded-md border">
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
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.author}</TableCell>
                <TableCell>{review.source}</TableCell>
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
                <TableCell className="max-w-[400px] truncate">
                  {review.content}
                </TableCell>
                <TableCell>{review.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      review.status === "responded" ? "default" : "secondary"
                    }
                  >
                    {review.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
