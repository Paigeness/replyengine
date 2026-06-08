"use client"

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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tone">Response Tone</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Update your business information used for generating responses.
              </CardDescription>
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
        <TabsContent value="tone">
          <Card>
            <CardHeader>
              <CardTitle>Response Tone</CardTitle>
              <CardDescription>
                Configure the personality of your AI-generated responses.
              </CardDescription>
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
                <textarea 
                  id="custom" 
                  className="w-full p-2 border rounded-md h-32" 
                  placeholder="E.g., Always mention our weekly specials or invite them to join our loyalty program."
                />
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
              <CardDescription>
                Control how and when you receive updates.
              </CardDescription>
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
