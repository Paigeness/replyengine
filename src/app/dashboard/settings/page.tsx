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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState<{source: string, created_at: string}[]>([])
  const [yelpBusinessId, setYelpBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  

  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get('success')
    const error = new URLSearchParams(window.location.search).get('error')

    if (success === 'google_connected') {
      toast.success("Google Business Profile connected successfully!")
    } else if (error) {
      setErrorMessage(`Connection failed: ${error.replace('_', ' ')}`)
      toast.error(`Connection failed: ${error.replace('_', ' ')}`)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()
        
        if (userData?.organization_id) {
          setOrganizationId(userData.organization_id)
          
          // Fetch integrations
          const { data: integrationData } = await supabase
            .from('integrations')
            .select('source, created_at')
            .eq('organization_id', userData.organization_id)
          
          if (integrationData) {
            setIntegrations(integrationData)
          }

          // Fetch Yelp ID from locations
          const { data: locationData } = await supabase
            .from('locations')
            .select('yelp_business_id')
            .eq('organization_id', userData.organization_id)
            .limit(1)
            .single()
          
          if (locationData?.yelp_business_id) {
            setYelpBusinessId(locationData.yelp_business_id)
          }
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const isConnected = (source: string) => {
    if (source === 'yelp') return !!yelpBusinessId || integrations.some(i => i.source === 'yelp')
    return integrations.some(i => i.source === source)
  }

  const getConnectedDate = (source: string) => {
    const integration = integrations.find(i => i.source === source)
    if (!integration) return null
    return new Date(integration.created_at).toLocaleDateString()
  }

  const handleGoogleConnect = () => {
    if (!organizationId) {
      toast.error("Organization not found. Please try again.")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '139079306339-59t9oqg7r1jugum8s8me2uada0i8oefe.apps.googleusercontent.com'
    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/auth/google/callback`
      : process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'https://replyengine.net/api/auth/google/callback'
    
    const scope = 'https://www.googleapis.com/auth/business.manage'
    const state = organizationId
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`
    window.location.href = url
  }

  const handleDisconnect = async (source: string) => {
    if (!organizationId) return
    
    const supabase = getSupabase()
    
    if (source === 'yelp' && yelpBusinessId) {
      const { error } = await supabase
        .from('locations')
        .update({ yelp_business_id: null })
        .eq('organization_id', organizationId)
      
      if (error) {
        toast.error(`Failed to disconnect Yelp: ${error.message}`)
        return
      }
      setYelpBusinessId(null)
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('organization_id', organizationId)
      .eq('source', source)
    
    if (error) {
      toast.error(`Failed to disconnect ${source}: ${error.message}`)
    } else {
      toast.success(`${source.charAt(0).toUpperCase() + source.slice(1)} disconnected.`)
      setIntegrations(prev => prev.filter(i => i.source !== source))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      {errorMessage && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{errorMessage}</p>
          <Button variant="ghost" size="sm" className="ml-auto h-8 hover:bg-destructive/20" onClick={() => setErrorMessage(null)}>Dismiss</Button>
        </div>
      )}
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="tone">Response Tone</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your business information used for generating responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Business Name</Label>
                <Input id="name" defaultValue="Acme Coffee Roasters" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://acmecoffee.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Main St, Anytown, USA" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card className={isConnected('google') ? "border-green-100 bg-green-50/10" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  Google Business Profile
                  {isConnected('google') ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Connected ✓ {getConnectedDate('google')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  )}
                </CardTitle>
                <CardDescription>Connect your Google Business Profile to automatically monitor and respond to reviews.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isConnected('google') ? (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Your Google Business Profile is connected and active.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Click the button below to authorize ReplyEngine to manage your Google Business Profile reviews.</p>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button 
                onClick={handleGoogleConnect} 
                variant={isConnected('google') ? "outline" : "default"}
              >
                {isConnected('google') ? "Reconnect Google Account" : "Connect Google Business Profile"}
              </Button>
              {isConnected('google') && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDisconnect('google')}
                >
                  Disconnect
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className={isConnected('yelp') ? "border-green-100 bg-green-50/10" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  Yelp Integration
                  {isConnected('yelp') ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Connected ✓ {getConnectedDate('yelp')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  )}
                </CardTitle>
                <CardDescription>Connect your Yelp business page to monitor reviews.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected('yelp') ? (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Yelp is connected. We are monitoring your reviews.
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="yelp-id">Yelp Business ID or URL</Label>
                    <Input id="yelp-id" placeholder="e.g., acme-coffee-roasters-anytown" />
                    <p className="text-xs text-muted-foreground">You can find this in your Yelp business page URL (e.g., yelp.com/biz/<b>your-business-id</b>).</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant={isConnected('yelp') ? "outline" : "default"}>
                {isConnected('yelp') ? "Update Yelp ID" : "Connect Yelp"}
              </Button>
              {isConnected('yelp') && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDisconnect('yelp')}
                >
                  Disconnect
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle>TripAdvisor Integration</CardTitle>
              <CardDescription>Connect your TripAdvisor page to monitor reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">TripAdvisor integration is coming soon.</p>
            </CardContent>
            <CardFooter>
              <Button disabled>Coming Soon</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="tone">
          <Card>
            <CardHeader>
              <CardTitle>Response Tone</CardTitle>
              <CardDescription>Configure the personality of your AI-generated responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="tone">Primary Tone</Label>
                <select id="tone" className="w-full p-2 border rounded-md">
                  <option>Professional & Friendly</option>
                  <option>Casual & Energetic</option>
                  <option>Formal & Concise</option>
                  <option>Empathetic & Warm</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="custom">Custom Instructions (Optional)</Label>
                <textarea id="custom" className="w-full p-2 border rounded-md h-32" placeholder="E.g., Always mention our weekly specials or invite them to join our loyalty program." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Tone</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-new">New Review Alerts</Label>
                <input type="checkbox" id="email-new" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-daily">Daily Summary Report</Label>
                <input type="checkbox" id="email-daily" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-weekly">Weekly Insight Report</Label>
                <input type="checkbox" id="email-weekly" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
