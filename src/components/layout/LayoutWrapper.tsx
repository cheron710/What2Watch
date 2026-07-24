"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function LayoutWrapper({ children, header, footer }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      {!isAdmin && header}
      <main className={isAdmin ? "flex flex-col min-h-screen" : "flex-1"}>
        {children}
      </main>
      {!isAdmin && footer}
    </>
  );
}
