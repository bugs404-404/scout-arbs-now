import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Activity,
  Calculator,
  List,
  Briefcase,
  LifeBuoy,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Live Arbs", url: "/live-arbs", icon: Activity },
  { title: "Calculators", url: "/calculators", icon: Calculator },
  { title: "Bet Tracker", url: "/bet-tracker", icon: List },
  { title: "Bookmakers", url: "/bookmakers", icon: Briefcase },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_18px_-2px_var(--primary)]">
            <Zap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight">
              ArbScout
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        className={
                          active
                            ? "text-primary [&>svg]:text-primary"
                            : undefined
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Need help?</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Chat with our arb specialists or browse the playbook.
            </p>
            <Button size="sm" className="mt-3 w-full" variant="secondary">
              Open support
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="mx-auto"
            aria-label="Open support"
          >
            <LifeBuoy className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
