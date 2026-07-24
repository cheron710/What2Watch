// src/app/admin/layout.tsx
import AdminLayout from "@/components/admin/layout/AdminLayout";
import "./admin.css";

export const metadata = {
  title: "Admin Panel | What2Watch",
  description: "Curated Cinema Administration Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
