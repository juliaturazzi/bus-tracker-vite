"use client";

import * as React from "react";
import { CalendarCheck, LogOutIcon, Settings } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Collapsible } from "./ui/collapsible";

// Define the types for the data object
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;  // Icon type from lucide-react
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

// This is the sample data with correct TypeScript types
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Alertas cadastrados",
      url: "/subscribed-alerts",
      icon: CalendarCheck,
    },
    {
      title: "Configurações de Conta",
      url: "/user-settings",
      icon: Settings,
    },
    {
      title: "Log out",
      url: "#",
      icon: LogOutIcon,
    },
  ] as NavItem[],  // Type the navMain array properly
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  // Track sidebar state (collapsed or not)
  const [collapsed, setCollapsed] = React.useState(false);

  // Handle the navigation for sidebar items
  const handleNavigation = (url: string) => {
    // For the "Log out" functionality, we can add special handling
    if (url === "#") {
      // Trigger your logout logic here
      console.log("Logging out...");
      return;
    }

    // Otherwise, navigate to the URL by setting window.location
    window.location.href = url;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <Collapsible asChild className="group/collapsible">
          <div className="space-y-2">
            {data.navMain.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.url)}  // Use the handleNavigation function
                className="duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
              >
                <item.icon className="w-5 h-5" />
                {/* Conditionally render the label based on collapsed state */}
                {!collapsed && <span>{item.title}</span>}
              </button>
            ))}
          </div>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        {/* Optional footer content */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
