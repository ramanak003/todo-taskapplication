"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconMail,
  IconCalendar,
  IconEdit,
  IconCamera,
  IconListDetails,
  IconCircleCheck,
  IconClock,
  IconFolder,
  IconLock,
  IconCreditCard,
  IconSettings,
  IconUsers,
  IconBell,
} from "@tabler/icons-react"
import { useTasks } from "@/hooks/use-tasks"
import { useProjects } from "@/hooks/use-projects"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Sample user data - in a real app, this would come from authentication
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "",
  bio: "Product designer and developer passionate about creating beautiful user experiences.",
  location: "San Francisco, CA",
  website: "https://johndoe.com",
  joinedDate: new Date("2023-01-15"),
  role: "Admin",
}

export default function ProfilePage() {
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = React.useState(false)
  const [profileData, setProfileData] = React.useState(user)

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === "done").length
  const inProgressTasks = tasks.filter(t => t.status === "in progress").length
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id)
    return projectTasks.some(t => t.status !== "done")
  }).length

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    toast.success("Profile updated successfully")
    setIsEditDialogOpen(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, this would upload to a storage service
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string })
        toast.success("Avatar updated successfully")
        setIsAvatarDialogOpen(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                      <p className="text-muted-foreground">
                        Manage your account settings and preferences
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Profile Header Card */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex flex-col items-center md:items-start">
                            <div className="relative">
                              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                {profileData.avatar ? (
                                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                                ) : null}
                                <AvatarFallback className="text-3xl">
                                  {getInitials(profileData.name)}
                                </AvatarFallback>
                              </Avatar>
                              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                                  >
                                    <IconCamera className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Change Avatar</DialogTitle>
                                    <DialogDescription>
                                      Upload a new profile picture
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="avatar-upload">Choose an image</Label>
                                      <Input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                      />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                                <p className="text-muted-foreground mt-1">{profileData.email}</p>
                                <Badge variant="outline" className="mt-2">
                                  {profileData.role}
                                </Badge>
                              </div>
                              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline">
                                    <IconEdit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                      Update your profile information
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="name">Full Name</Label>
                                      <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) =>
                                          setProfileData({ ...profileData, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="email">Email</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) =>
                                          setProfileData({ ...profileData, email: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="bio">Bio</Label>
                                      <Textarea
                                        id="bio"
                                        value={profileData.bio}
                                        onChange={(e) =>
                                          setProfileData({ ...profileData, bio: e.target.value })
                                        }
                                        rows={4}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                          id="location"
                                          value={profileData.location}
                                          onChange={(e) =>
                                            setProfileData({ ...profileData, location: e.target.value })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                          id="website"
                                          type="url"
                                          value={profileData.website}
                                          onChange={(e) =>
                                            setProfileData({ ...profileData, website: e.target.value })
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {profileData.bio && (
                              <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {profileData.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <IconCalendar className="h-4 w-4" />
                                  {profileData.location}
                                </div>
                              )}
                              {profileData.website && (
                                <a
                                  href={profileData.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:underline"
                                >
                                  <IconMail className="h-4 w-4" />
                                  Website
                                </a>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconCalendar className="h-4 w-4" />
                                Joined {format(profileData.joinedDate, "MMMM yyyy")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <IconListDetails className="h-4 w-4" />
                            Total Tasks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{totalTasks}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {completedTasks} completed
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <IconCircleCheck className="h-4 w-4" />
                            Completed
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{completedTasks}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <IconClock className="h-4 w-4" />
                            In Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{inProgressTasks}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Active tasks
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <IconFolder className="h-4 w-4" />
                            Projects
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{totalProjects}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activeProjects} active
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Account Tab */}
                  <TabsContent value="account" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                          Manage your account settings and security
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <div className="flex items-center gap-2">
                            <Input value={profileData.email} readOnly />
                            <Button variant="outline" size="sm">
                              <IconEdit className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="••••••••" readOnly />
                            <Button variant="outline" size="sm">
                              <IconLock className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Two-Factor Authentication</Label>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                            <Button variant="outline" size="sm">
                              Enable
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Billing & Subscription</CardTitle>
                        <CardDescription>
                          Manage your subscription and billing information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Current Plan</p>
                            <p className="text-sm text-muted-foreground">Free Plan</p>
                          </div>
                          <Button variant="outline">
                            <IconCreditCard className="mr-2 h-4 w-4" />
                            Upgrade
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Payment Method</p>
                            <p className="text-sm text-muted-foreground">No payment method on file</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                          Configure how you receive notifications
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications for important updates
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <IconBell className="mr-2 h-4 w-4" />
                            Configure
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications on your device
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <IconBell className="mr-2 h-4 w-4" />
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                          Customize the look and feel of the application
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">
                              Choose between light, dark, or system theme
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <IconSettings className="mr-2 h-4 w-4" />
                            Change
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                          Your recent actions and updates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10">
                              <IconCircleCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Completed task &quot;Design new homepage&quot;
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-blue-500/10">
                              <IconFolder className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Created project &quot;Website Redesign&quot;
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                1 day ago
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-green-500/10">
                              <IconUsers className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Added team member to project
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                3 days ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset >
    </SidebarProvider >
  )
}
