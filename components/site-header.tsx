"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  IconBell,
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<{
    name: string
    email: string
    avatar: string
  }>({
    name: "User",
    email: "",
    avatar: "",
  })
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  // Fetch user data from Supabase
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const name = authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User"
        const email = authUser.email || ""
        const avatar = authUser.user_metadata?.avatar_url ||
          authUser.user_metadata?.picture ||
          ""

        setUser({
          name,
          email,
          avatar,
        })
      }
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User"
        const email = session.user.email || ""
        const avatar = session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture ||
          ""

        setUser({
          name,
          email,
          avatar,
        })
      } else {
        setUser({
          name: "User",
          email: "",
          avatar: "",
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error("Logout failed", {
          description: error.message,
        })
        setIsLoggingOut(false)
        return
      }

      toast.success("Logged out successfully", {
        description: "You have been signed out.",
      })

      // Redirect to sign-in page
      router.push("/sign-in")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      toast.error("Logout failed", {
        description: errorMessage,
      })
      setIsLoggingOut(false)
    }
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/my-day":
        return "My Day"
      case "/upcoming":
        return "Upcoming"
      case "/important":
        return "Important"
      case "/projects":
        return "Projects"
      case "/team":
        return "Team"
      case "/profile":
        return "Profile"
      case "/lists":
        return "New Task"
      default:
        return "New Task"
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="relative h-8 w-8">
            <IconBell className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <IconUserCircle className="mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCreditCard className="mr-2" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconNotification className="mr-2" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconSettings className="mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive"
              >
                {isLoggingOut ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <IconLogout className="mr-2" />
                    <span>Log out</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
