'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const C = {
  rose: "#C97B9F",
  roseMid: "#B5698C",
  green: "#6BAF90",
};

const data = {
  navMain: [
    {
      id: "elder",
      title: 'Companion',
      sub: "Lola's screen",
      url: '/',
    },
    {
      id: "dashboard",
      title: 'Dashboard',
      sub: "Family view",
      url: '/dashboard',
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar {...props} className="bg-[#2A1622] border-r-0">
      <SidebarHeader className="pt-9 pb-8 px-7">
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#C97B9F66]" />
              <div className="w-1 h-1 rounded-full bg-[#C97B9F] opacity-60" />
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#C97B9F66]" />
            </div>
            <div className="font-display text-[28px] tracking-[8px] uppercase text-[#B5698C] text-center leading-none">Nene</div>
            <div className="font-ui text-[8px] tracking-[2.5px] uppercase text-[#7A5C6A] text-center mt-1.5">The apo that never forgets</div>
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#4A2E3A]" />
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#4A2E3A]" />
            </div>
          </>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-4 gap-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {data.navMain.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "h-auto w-full p-[12px_14px] rounded-[10px] transition-all duration-200 border-l-2 border-transparent hover:bg-[#C97B9F1F] group",
                        isActive && "bg-gradient-to-br from-[#C97B9F22] to-[#9B7DBF18] border-l-[#C97B9F]"
                      )}
                    >
                      <a href={item.url} className="flex flex-col items-start gap-0.5">
                        <span className={cn(
                          "font-ui text-[13px] font-bold tracking-[0.4px] text-[#7A5C6A] group-hover:text-[#C97B9F]",
                          isActive && "text-[#C97B9F]"
                        )}>
                          {item.title}
                        </span>
                        {!isCollapsed && (
                          <span className="font-ui text-[10px] text-[#5A3C4A]">{item.sub}</span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && (
        <div className="mt-auto px-7 pb-7">
          <div className="h-[1px] bg-[#3A2230] mb-3.5" />
          <div className="flex items-center gap-1.5 mb-2">
            <div className="nn-live w-1.5 h-1.5 rounded-full bg-[#6BAF90]" />
            <span className="font-ui text-[9px] text-[#5A3C4A] tracking-[1.5px] uppercase">Connected</span>
          </div>
          <div className="font-ui text-[8px] text-[#4A2E3A] tracking-[1.5px] uppercase">Voice · Vision · Care</div>
        </div>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
