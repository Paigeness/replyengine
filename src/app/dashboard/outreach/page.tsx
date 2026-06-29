"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Send, Loader2, History, Mail, User, FileText, CheckCircle2, XCircle } from "lucide-react"
import { getSupabase } from "@/lib/supabase"

const TEMPLATES = [
  {
    id: "initial",
    name: "Initial Outreach",
    subject: "Quick question about your [Business Name] reviews",
    body: `Hi [Owner Name],

I was just looking at [Business Name] on Google and noticed you have an impressive [Rating]-star rating! 

I also noticed that some of your recent reviews haven't received a response yet. I know how busy running a [Business Type] can be, but since 1 in 3 customers choose a business based on their review responses, I didn't want you to miss out on that extra revenue.

I built a tool called ReplyEngine that uses AI to automatically write and post personalized responses to your reviews. It's designed to be completely "set it and forget it".

I’d love to set you up with a 14-day free trial. Would you be open to a 5-minute chat?

Best,
[Your Name]
ReplyEngine.net`
  },
  {
    id: "followup",
    name: "Follow-up (3 days later)",
    subject: "Didn't want to bug you",
    body: `Hi [Owner Name],

Just checking in to see if you saw my last note about automating your review responses.

We recently helped a local business increase their response rate to 100% while saving the owner about 4 hours of manual work every month.

If you're still buried in tasks, I'd love to show you how ReplyEngine can take review management off your plate entirely.

You can grab a free trial at ReplyEngine.net or just reply to this email!

Best,
[Your Name]`
  },
  {
    id: "restaurant",
    name: "Restaurant Specific",
    subject: "Help with your Google reviews",
    body: `Hi [Owner Name],

As a fan of [Business Name], I noticed you guys are getting a high volume of reviews lately—which is awesome! 

However, I saw several reviews from the last month that are still waiting for a reply. In the restaurant world, a quick response can be the difference between a one-time diner and a regular.

I built ReplyEngine specifically to help high-volume businesses like yours handle this on auto-pilot. 

I’d love to show you a quick demo. Open to a quick call?

Best,
[Your Name]`
  }
]

export default function OutreachPage() {
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchHistory()
    fetchLeads()
  }, [])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('outreach_emails')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10)
    
    if (data) setHistory(data)
    setLoadingHistory(false)
  }

  const fetchLeads = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('leads')
      .select('id, business_name, phone, website, address, rating')
      .limit(20)
    
    if (data) setLeads(data)
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
      toast.info(`Applied template: ${template.name}`)
    }
  }

  const handleSelectLead = (lead: any) => {
    setRecipient("") // Owner needs to enter email as it's not always in leads
    setSubject(subject.replace('[Business Name]', lead.business_name))
    setBody(body.replace(/\[Business Name\]/g, lead.business_name)
                .replace(/\[Rating\]/g, lead.rating || '4.5')
                .replace(/\[Business Type\]/g, 'business'))
    toast.info(`Selected lead: ${lead.business_name}`)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !subject || !body) {
      toast.error("Please fill in all fields")
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject, body })
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Email sent successfully!")
        setRecipient("")
        fetchHistory()
      } else {
        toast.error(data.error || "Failed to send email")
      }
    } catch (error) {
      toast.error("An error occurred while sending email")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cold Outreach</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Outreach Email</CardTitle>
              <CardDescription>Compose and send a personalized outreach email to a prospect.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="template">Select Template</Label>
                  <div className="flex gap-2 flex-wrap">
                    {TEMPLATES.map(t => (
                      <Button 
                        key={t.id} 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApplyTemplate(t.id)}
                      >
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="recipient" 
                      placeholder="owner@business.com" 
                      className="pl-10"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="subject">Subject</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="subject" 
                      placeholder="Email subject" 
                      className="pl-10"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="body">Message Body</Label>
                  <textarea 
                    id="body" 
                    className="w-full min-h-[300px] p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Write your message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Use placeholders like [Owner Name], [Business Name], [Rating] for personalization.</p>
                </div>

                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Email
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No emails sent yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        history.map((email) => (
                          <TableRow key={email.id}>
                            <TableCell className="font-medium">{email.recipient_email}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                            <TableCell className="text-xs">
                              {new Date(email.sent_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {email.status === 'sent' ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                  <CheckCircle2 className="h-3 w-3" /> Sent
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> Failed
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Lead
              </CardTitle>
              <CardDescription>Pick a lead to auto-fill their business details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No leads found. Go to <a href="/dashboard/leads" className="text-primary underline">Lead Finder</a> to add some.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {leads.map(lead => (
                    <div 
                      key={lead.id} 
                      className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectLead(lead)}
                    >
                      <div className="text-sm font-medium">{lead.business_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{lead.address}</div>
                      <div className="text-xs mt-1 font-bold text-primary">{lead.rating} ★</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
