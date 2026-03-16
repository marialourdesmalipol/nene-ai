import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import "./globals.css";

export const metadata: Metadata = {
  title: "Nene AI",
  description: "Your Filipino family care companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
