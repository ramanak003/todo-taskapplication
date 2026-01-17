"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconListCheck, type Icon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { type Task } from "@/components/tasks-table"

export function NavMain({
  items,
  onTaskCreate,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  onTaskCreate?: (task: Omit<Task, "id">) => Promise<void>
}) {
  const pathname = usePathname()
  const dashboardItem = items.length > 0 ? items[0] : null
  const DashboardIcon = dashboardItem?.icon

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* Dashboard - First item */}
          {dashboardItem && (
            <SidebarMenuItem key={dashboardItem.title}>
              <SidebarMenuButton 
                asChild
                tooltip={dashboardItem.title}
                isActive={pathname === dashboardItem.url}
              >
                <Link href={dashboardItem.url}>
                  {DashboardIcon && <DashboardIcon />}
                  <span>{dashboardItem.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {/* Tasks - Second item */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              tooltip="Tasks"
              isActive={pathname === "/lists"}
            >
              <Link href="/lists">
                <IconListCheck />
                <span>Tasks</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Rest of the items */}
          {items.slice(1).map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.url || (item.url === "/lists" && pathname?.startsWith("/lists"))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    {IconComponent && <IconComponent />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
