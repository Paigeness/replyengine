import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const responses = [
  {
    id: "1",
    reviewAuthor: "Alice Smith",
    reviewContent: "The best experience ever! The staff was incredibly helpful.",
    responseContent: "Thank you Alice! We're so glad you had a great experience with our staff. Hope to see you again soon!",
    date: "2024-05-20",
    status: "posted",
  },
  {
    id: "2",
    reviewAuthor: "Diana Prince",
    reviewContent: "Amazing quality and fast delivery. Will order again!",
    responseContent: "Hi Diana, thank you for the feedback! We take pride in our quality and speed. Looking forward to your next order!",
    date: "2024-05-10",
    status: "posted",
  },
  {
    id: "3",
    reviewAuthor: "Edward Norton",
    reviewContent: "Average experience. Nothing special.",
    responseContent: "Thank you for the review, Edward. We're always looking to improve. Feel free to share more details on how we can make your next visit better.",
    date: "2024-05-05",
    status: "posted",
  },
]

export default function ResponsesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Response Log</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search responses..." className="pl-8 w-[250px]" />
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
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell className="font-medium">{response.reviewAuthor}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {response.reviewContent}
                </TableCell>
                <TableCell className="max-w-[400px]">
                  {response.responseContent}
                </TableCell>
                <TableCell>{response.date}</TableCell>
                <TableCell>
                  <Badge variant="default">
                    {response.status}
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
