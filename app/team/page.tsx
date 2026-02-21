"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  IconUsers,
  IconMail,
  IconLink,
  IconCopy,
  IconCheck,
  IconPlus,
  IconUserPlus,
  IconHistory,
  IconEdit,
  IconCircleCheck,
  IconMessageCircle,
  IconClock,
  IconDotsVertical,
  IconChevronDown,
  IconTrash,
} from "@tabler/icons-react"
import { ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

// Team Member Type
export type TeamMember = {
  id: string
  name: string
  email: string
  role: "Admin" | "Member" | "Viewer"
  status: "active" | "pending" | "inactive"
  avatar?: string | null
  joinedAt: Date
}

// Sample team members - in a real app, this would come from a database
const SAMPLE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    avatar: null,
    joinedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Member",
    status: "active",
    avatar: null,
    joinedAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Member",
    status: "pending",
    avatar: null,
    joinedAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "Member",
    status: "active",
    avatar: null,
    joinedAt: new Date("2024-01-25"),
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@example.com",
    role: "Viewer",
    status: "active",
    avatar: null,
    joinedAt: new Date("2024-02-05"),
  },
]

// Sample audit logs
const SAMPLE_AUDIT_LOGS = [
  {
    id: "1",
    type: "task_completed",
    entity: "Task",
    entityName: "Complete project documentation",
    user: "John Doe",
    timestamp: new Date(Date.now() - 3600000),
    details: "Task marked as completed",
  },
  {
    id: "2",
    type: "project_edited",
    entity: "Project",
    entityName: "Website Redesign",
    user: "Jane Smith",
    timestamp: new Date(Date.now() - 7200000),
    details: "Updated project description",
  },
  {
    id: "3",
    type: "status_changed",
    entity: "Task",
    entityName: "Design mockups",
    user: "Mike Johnson",
    timestamp: new Date(Date.now() - 10800000),
    details: "Status changed from 'Todo' to 'In Progress'",
  },
  {
    id: "4",
    type: "comment_added",
    entity: "Task",
    entityName: "API Integration",
    user: "John Doe",
    timestamp: new Date(Date.now() - 14400000),
    details: "Added comment: 'Need to review API endpoints'",
  },
]

// Team Members Table Columns Factory
const createTeamMemberColumns = (
  handleEditMember: (member: TeamMember) => void,
  handleDeleteMember: (member: TeamMember) => void,
  currentUser: { id: string; email: string; role: "Admin" | "Member" | "Viewer" }
): ColumnDef<TeamMember>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const member = row.original
        const getInitials = (name: string) => {
          return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        }

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {member.avatar && (
                <AvatarImage src={member.avatar} alt={member.name} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "active" ? "default" : status === "pending" ? "secondary" : "outline"}
            className="capitalize"
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "joinedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8"
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("joinedAt") as Date
        return <div className="text-sm">{format(date, "MMM d, yyyy")}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const member = row.original
        const isAdmin = currentUser.role === "Admin"
        const isCurrentUser = member.id === currentUser.id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(member.email)
                  toast.success("Email copied to clipboard")
                }}
              >
                <IconMail className="mr-2 h-4 w-4" />
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit member
              </DropdownMenuItem>
              {/* Only show remove option for admins, and prevent removing yourself */}
              {isAdmin && !isCurrentUser && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteMember(member)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Remove member
                </DropdownMenuItem>
              )}
              {isAdmin && isCurrentUser && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <IconTrash className="mr-2 h-4 w-4" />
                  Cannot remove yourself
                </DropdownMenuItem>
              )}
              {!isAdmin && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <IconTrash className="mr-2 h-4 w-4" />
                  Only admins can remove members
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

export default function Page() {
  const [inviteLink, setInviteLink] = React.useState("https://ramana-tasks.vercel.app/join/abc123xyz")
  const [emailInvite, setEmailInvite] = React.useState("")
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false)
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(SAMPLE_TEAM_MEMBERS)
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [memberToDelete, setMemberToDelete] = React.useState<TeamMember | null>(null)

  // Current user - in a real app, this would come from authentication context
  const currentUser = {
    id: "1", // John Doe is the admin
    email: "john@example.com",
    role: "Admin" as const,
  }

  // Check if current user is admin
  const isAdmin = currentUser.role === "Admin"

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    toast.success("Invite link copied to clipboard")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleEmailInvite = () => {
    if (!emailInvite.trim()) {
      toast.error("Please enter an email address")
      return
    }
    toast.success(`Invitation sent to ${emailInvite}`)
    setEmailInvite("")
    setIsInviteDialogOpen(false)
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setIsEditDialogOpen(true)
  }

  const handleSaveMember = () => {
    if (!editingMember) return

    setTeamMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    )
    toast.success("Member updated successfully")
    setIsEditDialogOpen(false)
    setEditingMember(null)
  }

  const handleDeleteMember = (member: TeamMember) => {
    // Only admins can remove members
    if (!isAdmin) {
      toast.error("Only admins can remove team members")
      return
    }

    // Prevent admin from removing themselves
    if (member.id === currentUser.id) {
      toast.error("You cannot remove yourself from the team")
      return
    }

    setMemberToDelete(member)
  }

  const confirmDeleteMember = () => {
    if (!memberToDelete) return

    setTeamMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id))
    toast.success(`${memberToDelete.name} has been removed from the team`)
    setMemberToDelete(null)
  }

  // Create columns after handlers are defined
  const teamMemberColumns = React.useMemo(
    () => createTeamMemberColumns(handleEditMember, handleDeleteMember, currentUser),
    [currentUser, handleEditMember, handleDeleteMember]
  )

  const table = useReactTable({
    data: teamMembers,
    columns: teamMemberColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const getAuditIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <IconCircleCheck className="h-4 w-4 text-green-500" />
      case "project_edited":
      case "task_edited":
        return <IconEdit className="h-4 w-4 text-blue-500" />
      case "status_changed":
        return <IconClock className="h-4 w-4 text-orange-500" />
      case "comment_added":
        return <IconMessageCircle className="h-4 w-4 text-purple-500" />
      default:
        return <IconHistory className="h-4 w-4 text-muted-foreground" />
    }
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
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <IconUsers className="h-6 w-6 text-indigo-500" />
                      <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                      Invite team members, collaborate on tasks and projects, and track activity
                    </p>
                  </div>
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <IconUserPlus className="mr-2 h-4 w-4" />
                        Invite Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Invite team members by sharing a link or sending an email invitation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Share Link */}
                        <div className="space-y-2">
                          <Label>Share Invite Link</Label>
                          <div className="flex gap-2">
                            <Input value={inviteLink} readOnly className="flex-1" />
                            <Button
                              variant="outline"
                              onClick={handleCopyLink}
                              className="shrink-0"
                            >
                              {copiedLink ? (
                                <IconCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <IconCopy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Share this link with team members to invite them
                          </p>
                        </div>

                        {/* Email Invite */}
                        <div className="space-y-2">
                          <Label>Or Send Email Invitation</Label>
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="team.member@example.com"
                              value={emailInvite}
                              onChange={(e) => setEmailInvite(e.target.value)}
                              className="flex-1"
                            />
                            <Button onClick={handleEmailInvite}>
                              <IconMail className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Tabs defaultValue="members" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="members">Team Members</TabsTrigger>
                    <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                    <TabsTrigger value="audit">Audit Log</TabsTrigger>
                  </TabsList>

                  {/* Team Members Tab */}
                  <TabsContent value="members" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                          Manage your team members and their roles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full">
                          <div className="flex items-center py-4">
                            <Input
                              placeholder="Filter by name or email..."
                              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                              onChange={(event) =>
                                table.getColumn("name")?.setFilterValue(event.target.value)
                              }
                              className="max-w-sm"
                            />
                          </div>
                          <div className="overflow-hidden rounded-md border">
                            <Table>
                              <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                  <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                      return (
                                        <TableHead key={header.id}>
                                          {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                            )}
                                        </TableHead>
                                      )
                                    })}
                                  </TableRow>
                                ))}
                              </TableHeader>
                              <TableBody>
                                {table.getRowModel().rows?.length ? (
                                  table.getRowModel().rows.map((row) => (
                                    <TableRow
                                      key={row.id}
                                      data-state={row.getIsSelected() && "selected"}
                                    >
                                      {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                          {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                          )}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={teamMemberColumns.length}
                                      className="h-24 text-center"
                                    >
                                      No results.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex items-center justify-end space-x-2 py-4">
                            <div className="text-muted-foreground flex-1 text-sm">
                              {table.getFilteredSelectedRowModel().rows.length} of{" "}
                              {table.getFilteredRowModel().rows.length} row(s) selected.
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Collaboration Tab */}
                  <TabsContent value="collaboration" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Collaborate on Tasks</CardTitle>
                          <CardDescription>
                            Assign team members to tasks and track progress
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Assign team members to specific tasks
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Track task progress in real-time
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Add comments and updates
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Get notifications on task changes
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Collaborate on Projects</CardTitle>
                          <CardDescription>
                            Work together on projects with your team
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Assign team members to projects
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Share project links and resources
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              View project activity and updates
                            </li>
                            <li className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                              Set project deadlines and milestones
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Audit Log Tab */}
                  <TabsContent value="audit" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Audit Log</CardTitle>
                        <CardDescription>
                          Track all changes, completions, and activities across tasks and projects
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {SAMPLE_AUDIT_LOGS.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="mt-1">
                                {getAuditIcon(log.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{log.user}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.entity}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium mb-1">{log.entityName}</p>
                                <p className="text-sm text-muted-foreground">{log.details}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(log.timestamp, "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the member's information and role
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingMember.email}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingMember.role}
                  onValueChange={(value: "Admin" | "Member" | "Viewer") =>
                    setEditingMember({ ...editingMember, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingMember.status}
                  onValueChange={(value: "active" | "pending" | "inactive") =>
                    setEditingMember({ ...editingMember, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToDelete?.name}</strong> from the team?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
