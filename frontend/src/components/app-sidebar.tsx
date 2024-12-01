"use client";

import * as React from "react";
import { CalendarCheck, LogOutIcon, Settings } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible } from "./ui/collapsible";

// Define the types for the data object
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

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
  ] as NavItem[],
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
           onClick={() => handleNavigation(item.url)}
           className="duration-200 flex h-8 items-center space-x-4 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-6 [&>svg]:shrink-0"
         >
           <item.icon className="w-5 h-5" />
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
