import { useState } from "react";
import { ScanBarcode, List, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  itemsCount: number;
  fieldsCount: number;
  currentBarcode: string | null;
}

export function AppSidebar({ 
  activeTab, 
  onTabChange, 
  itemsCount, 
  fieldsCount, 
  currentBarcode 
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = [
    {
      id: "scan",
      title: "Scan Items",
      icon: ScanBarcode,
      badge: currentBarcode ? "1" : null,
      badgeVariant: "destructive" as const,
    },
    {
      id: "inventory",
      title: "Inventory",
      icon: List,
      badge: itemsCount.toString(),
      badgeVariant: "secondary" as const,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      badge: fieldsCount.toString(),
      badgeVariant: "outline" as const,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ScanBarcode className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-lg">Barcode Manager</h2>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="w-10 h-10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}